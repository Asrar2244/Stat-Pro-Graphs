import { useTranslation } from 'react-i18next';
/**
 *  deleteByIDOutputTable,
  insertExecuteTaskTable,
 */
import {
  insertToNotificationTable,
  deleteNotification,
  outputGenerateIDTable,
  outputUpdateResult,
  deleteByIDOutputTable,
} from '@backend';
// import { v4 as uuidv4 } from 'uuid';
/**
 * collectionFolder, saveLargeJsonToFile,
 */
import { Database } from '@utils';
import { CONFIGURATION_DB } from '@constants';
import { useNodeActions, useActiveNode } from '@hooks';
import { mainWorker } from '@workers/worker';
import { API } from '@constants';
import { useStartProStore } from '@store/main-store';
import { useShallow } from 'zustand/react/shallow';
import { ISelector } from 'src/screens/workspace/explorer';
interface IOthersParameters {
  message?: string;
  queueFor: string;
  url: string;
  commonTranslate?: string;
  queueType: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  notificationId?: number;
  outputId?: number;
  dbName?: string;
}
export const useAnalyzeSave = () => {
  const { t } = useTranslation(['common', 'errors']);
  const { projects, setBlockUI } = useStartProStore(
    useShallow((state) => ({
      projects: state.projects,
      model: state.model,
      setBlockUI: state.setBlockUI,
    })),
  );
  const { openNewTab } = useNodeActions();
  const { config } = useActiveNode([]);

  const insertInNotifications = async (
    isDeleteID: number = 0,
    message: string,
    openTab: string,
    outputId: number,
  ): Promise<number> => {
    const db = new Database(CONFIGURATION_DB);
    if (isDeleteID > 0) {
      const deleted = await db.executeQuery(deleteNotification, [isDeleteID]);
      return deleted.lastInsertId;
    }
    const inserted = await db.executeQuery(insertToNotificationTable, [
      message,
      openTab,
      outputId,
      new Date().toISOString(),
    ]);
    return inserted.lastInsertId;
  };

  const execute = async (
    dbName: string,
    parameters: Record<string, any>,
    otherParameters: IOthersParameters,
    id?: string,
  ) => {
    const outputId = await outputGenerateIDTable(dbName, [
      '',
      dbName,
      otherParameters.queueFor,
      otherParameters.queueType,
      new Date().toISOString(),
    ]);
    const message = t(otherParameters?.commonTranslate ?? 'analyzing', {
      description: otherParameters.queueFor,
      tab: dbName,
      ns: 'common',
    });
    const notificationID = await insertInNotifications(0, message, dbName, outputId);
    parameters['notificationId'] = notificationID;
    otherParameters['message'] = message;
    otherParameters['outputId'] = outputId;
    otherParameters['notificationId'] = notificationID;
    otherParameters['dbName'] = dbName;
    // await insertInTasks('', JSON.stringify(otherParameters));
    let errorOccurred = false;
    mainWorker
      .axios(`${API.backendURL}/api/${API.analysis}`, parameters)
      .then((response: any) => {
        // Check HTTP status code
        if (response.status !== 200) {
          errorOccurred = true;
          const errorMsg = `Request failed with status ${response.status}: ${response.statusText || 'Unknown error'}`;
          return deleteByIDOutputTable(dbName, [outputId])
            .then(async () => {
              if (otherParameters.notificationId) {
                await insertInNotifications(otherParameters.notificationId, '', '', 0);
              }
              setBlockUI({ value: true, msg: errorMsg, hideOk: false });
            });
        }

        // Extract data from response
        const responseData = response.data || response;

        // Normalize backend error formats and stop output rendering immediately
        const normalizedError: string | undefined = (() => {
          if (!responseData) return 'Backend returned no response';
          if (typeof responseData === 'string') return responseData;
          if (responseData.error) return String(responseData.error);
          if (responseData.message && (responseData.status === 'error' || responseData.code === 'error')) return String(responseData.message);
          if (responseData.return_value && String(responseData.return_value).toLowerCase() !== 'success') {
            return String(responseData.message || responseData.detail || responseData.return_value);
          }
          return undefined;
        })();

        if (normalizedError) {
          errorOccurred = true;
          // Do NOT persist failed outputs in history: delete the created OUTPUT row and remove notification
          return deleteByIDOutputTable(dbName, [outputId])
            .then(async () => {
              if (otherParameters.notificationId) {
                await insertInNotifications(otherParameters.notificationId, '', '', 0);
              }
              setBlockUI({ value: true, msg: normalizedError, hideOk: false });
            });
        }

        // Inject outputType for stepwise regression (forward/backward/stepwise)
        if (
          (parameters?.regressionType === 'linear' || parameters?.regressionType === 'linear_db') &&
          (parameters?.linearparameters?.estimation === 'stepwise' || parameters?.estimationparameters?.estimation_type === 'stepwise')
        ) {
          const direction = parameters?.linearparameters?.direction || 'forward';
          if (otherParameters.queueType === 'regLinearStepwise') {
            responseData.outputType = 'regLinearStepwise';
          } else {
            responseData.outputType = direction === 'backward' ? 'regLinearBackwardStepwise' : 'regLinearForwardStepwise';
          }
        }

        // Inject outputType for best subset regression
        if (
          parameters?.regressionType === 'linear' &&
          parameters?.estimationparameters?.estimation_type === 'bestsubset'
        ) {
          responseData.outputType = 'regLinearBestSubset';
        }

        // Inject outputType for multiple linear regression
        if (
          parameters?.regressionType === 'linear' &&
          parameters?.sub_type === 'multiple_linear_regression'
        ) {
          responseData.outputType = 'regLinearMultipleLinear';
        }

        // Inject outputType for bayesian regression
        if (
          parameters?.regressionType === 'linear' &&
          parameters?.sub_type === 'bayesian'
        ) {
          responseData.outputType = 'regLinearBayesian';
        }

        outputUpdateResult(dbName, [JSON.stringify(responseData), outputId])
          .then(() => {
            const { isEmptyDataView } = config;
            if (!isEmptyDataView) {
              const projectId = Number(id?.split('-')[1]);
              const data = Object.values(projects).find(
                (item) => Number(item.id) === projectId,
              ) as ISelector;
              const type = 'OUTPUT';
              if (data) {
                openNewTab(data, projectId, type, t);
              } else {
                // Fallback: open with config if project lookup fails
                openNewTab(config as any, config.id, type, t);
              }
            } else {
              const type = 'OUTPUT';
              openNewTab(config as any, config.id, type, t);
            }
          })
          .catch((error) => {
            setBlockUI({ value: true, msg: error.message });
          });
      })
      .catch((errorMsg: any) => {
        errorOccurred = true;
        setBlockUI({ value: true, msg: errorMsg.message, hideOk: false });
      })
      .finally(() => {
        if (!errorOccurred) {
          setBlockUI({ value: false, msg: '' });
        }
      });
  };
  return { execute };
};
