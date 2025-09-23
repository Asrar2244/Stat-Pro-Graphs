import { useTranslation } from 'react-i18next';
import { uniqueNumber } from '@utils';
import { useNodeActions } from '../layout-nodes';
import dayjs from 'dayjs';
import { GRAPHS } from '@constants';
import { DATA } from '@constants/db';

type IMenuCodeExecutor = {
  id: string;
  isEmptyDataView?: boolean;
  extraConfig?: Record<string, unknown>;
};

export const useMenuCodeExecutor = () => {
  const { openNewTab, getOpenRecords } = useNodeActions();
  const { t } = useTranslation('workspace');
  const openNewTabAction = (input: IMenuCodeExecutor) => {
    // Prefer project-specific id for GRAPHS to avoid duplicate tabs across actions
    const providedProjectId =
      input.id === GRAPHS && input.extraConfig && (input.extraConfig as any).id
        ? Number((input.extraConfig as any).id)
        : undefined;

    const tabId = providedProjectId ?? uniqueNumber();

    // If opening a Graphs tab, ensure a DATA tab for the same project is opened first (to its left)
    if (input.id === GRAPHS && providedProjectId) {
      const dataSelector: any = {
        fileSize: '',
        isOpenedData: tabId,
        isActive: tabId,
        modifiedDateTime: '',
        createdDateTime: '',
        isOpenedOutput: tabId,
        workspacePath: ((input.extraConfig || {}) as any).tabName || dayjs().format('hh:mm:ss A'),
        id: String(tabId),
        sheetId: DATA,
        inputFileName: DATA,
        projectName: ((input.extraConfig || {}) as any).name || dayjs().format('YYYY-MM-DD'),
        isEmptyDataView: true,
        ...(input.extraConfig || {}),
      };
      const { record } = getOpenRecords(dataSelector, DATA);
      if (!record) {
        openNewTab(
          dataSelector,
          tabId,
          DATA,
          t,
        );
      }
    }

    openNewTab(
      {
        fileSize: '',
        isOpenedData: tabId,
        isActive: tabId,
        modifiedDateTime: '',
        createdDateTime: '',
        isOpenedOutput: tabId,
        // If caller supplies workspace/name, use them so the tab matches project identity
        workspacePath: ((input.extraConfig || {}) as any).tabName || dayjs().format('hh:mm:ss A'),
        id: String(tabId),
        sheetId: input.id,
        inputFileName: input.id,
        projectName: ((input.extraConfig || {}) as any).name || dayjs().format('YYYY-MM-DD'),
        isEmptyDataView: input.isEmptyDataView,
        ...(input.extraConfig || {}),
      } as any,
      tabId,
      input.id,
      t,
    );
  };

  return { openNewTabAction };
};
