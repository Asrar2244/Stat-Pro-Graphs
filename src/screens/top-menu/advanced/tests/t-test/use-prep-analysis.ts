import { IActiveNode, useAnalyzeSave } from '@hooks';
import { API } from '@constants';
import { useTTestsStats } from './use-t-tests';
import { useTestsStats } from '../options/use-tests-config';

interface IOutput {
    executeAnalysis: (id: string) => void;
}
export const usePrepareAnalysis = ({
    config,
    queueFor,
    queueType,
}: IActiveNode & { queueFor: string; queueType: string }): IOutput => {
    const { execute } = useAnalyzeSave();
    const { model: { assumptionChecking, results, postHocTests } } = useTestsStats();
    const { model: { populationMean, dataFormat } } = useTTestsStats();
    const executeAnalysis = async (id: string): Promise<void> => {
        const tableName = config.tabName;
        const parameters = {
            test_name: "t_test_one_sample",
            db_name: tableName,
            ...assumptionChecking,
            ...results,
            ...postHocTests,
            ...populationMean,
            ...dataFormat,
            DB: true,
        };
        execute(config.tabName, parameters, {
            queueFor,
            url: `/api/${API.analysis}`,
            queueType
        }, id);
    };

    return { executeAnalysis };
};
