import { IActiveNode, useAnalyzeSave } from '@hooks';
import { API } from '@constants';
import { useTTestsStats } from './use-t-tests';
import { useTestsStats } from '../options/use-tests-config';
import { useStartProStore } from '@store/main-store';
import { useTranslation } from 'react-i18next';

interface IOutput {
    executeAnalysis: (id: string) => void;
}
export const usePrepareAnalysis = ({
    config,
    queueFor,
    queueType,
}: IActiveNode & { queueFor: string; queueType: string }): IOutput => {
    const { execute } = useAnalyzeSave();
    const { setBlockUI } = useStartProStore();
    const { t } = useTranslation('errors');
    const { model: { assumptionChecking, results, postHocTests } } = useTestsStats();
    const { model: { populationMean, dataFormat } } = useTTestsStats();
    const executeAnalysis = async (id: string): Promise<void> => {
        try {
            const tableName = config.tabName;

            // Check if we are using summarized data
            const isSummarized = dataFormat.values?.mean && dataFormat.values?.size;

            if (!isSummarized) {
                // Validate that exactly one variable is selected
                const selectedVars = dataFormat.dataList ? Array.from(dataFormat.dataList.keys()) : (dataFormat.sample || []);
                if (selectedVars.length !== 1) {
                    setBlockUI({ value: true, msg: t('allowOnlyOneRecord', { defaultValue: 'Please select exactly one variable.' }) });
                    return;
                }
            }

            const parameters = {
                test_name: "t_test_one_sample",
                db_name: tableName,
                ...assumptionChecking,
                ...results,
                ...postHocTests,
                ...populationMean,
                ...dataFormat,
                DB: !isSummarized,
            };
            execute(config.tabName, parameters, {
                queueFor,
                url: `/api/${API.analysis}`,
                queueType
            }, id);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while executing the analysis.';
            setBlockUI({ value: true, msg: errorMessage, hideOk: false });
        }
    };

    return { executeAnalysis };
};
