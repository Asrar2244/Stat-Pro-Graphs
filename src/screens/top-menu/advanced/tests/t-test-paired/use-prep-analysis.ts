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
    const { model: { results, assumptionChecking, postHocTests } } = useTestsStats();

    const { model: { dataFormat } } = usePairedTTestsStats();

    const executeAnalysis = async (id: string): Promise<void> => {
        const tableName = config.tabName;

        const getKey = (map: Map<string, boolean> | undefined) => {
            if (!map) return "";
            for (const [key, value] of map.entries()) {
                if (value) return key;
            }
            return "";
        };

        const rawData = {
            before: getKey(dataFormat.raw_data.before),
            after: getKey(dataFormat.raw_data.after)
        };

        const indexedData = {
            subject: getKey(dataFormat.indexed.subject),
            treatment: getKey(dataFormat.indexed.treatment),
            values: getKey(dataFormat.indexed.data)
        };

        // Determine which format to use
        // If rawData columns are selected, use raw. Else if indexed columns are selected, use indexed.
        // Priority to raw if both are partially filled? User UI switches tabs.
        // We'll check if 'before' and 'after' are present.

        let payloadData = {};
        if (rawData.before && rawData.after) {
            payloadData = { raw_data: rawData };
        } else if (indexedData.subject && indexedData.treatment && indexedData.values) {
            payloadData = { indexed_data: indexedData };
        }

        const parameters = {
            test_name: "t_test_paired",
            db_name: tableName,
            alternative: "two-sided",
            confidence_level: (results.confidence_level || 95) / 100,
            alpha: (postHocTests?.alpha_value || 0.05),
            shaprio_walk: assumptionChecking?.shaprio_walk ?? true,
            kolmo_with_correction: assumptionChecking?.kolmo_with_correction ?? false,
            db: false,
            ...payloadData
        };

        execute(config.tabName, parameters, {
            queueFor,
            url: `/api/${API.analysis}`,
            queueType
        }, id);
    };

    return { executeAnalysis };
};