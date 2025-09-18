import { IActiveNode, useAnalyzeSave } from '@hooks';
import { API } from '@constants';
import { usePairedTTestsStats } from './use-t-test-paired';
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
    // const { model: { assumptionChecking, results, postHocTests } } = useTestsStats();
    const { model: { results } } = useTestsStats();

    const { model: { dataFormat } } = usePairedTTestsStats();
    const executeAnalysis = async (id: string): Promise<void> => {
        const tableName = config.tabName;
        const parameters = {
            test_name: "t_test_paired",
            db_name: tableName,
            // ...assumptionChecking,
            // ...results,
            // ...postHocTests,
            // ...dataFormat,
            "alternative": "two-sided",
            "confidence_level": results.confidence_level / 100
            // DB: false,
            ,
            "indexed_data": {
                "subject": "Student",
                "treatment": "Education",
                "values": "Score"
            },
            "alpha": 0.5,
            "shaprio_walk": true,
            "kolmo_with_correction": false,
            "db": false
        };

        execute(config.tabName, parameters, {
            queueFor,
            url: `/api/${API.analysis}`,
            queueType
        }, id);
    };

    return { executeAnalysis };
};