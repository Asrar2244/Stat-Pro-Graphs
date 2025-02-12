
import { useShallow } from 'zustand/react/shallow';
import { IActiveNode, IColumn, useAnalyzeSave } from '@hooks';
import { useEffect } from 'react';
import { API } from '@constants';
import { useDescriptiveStatistics } from './use-descriptive-statistics';
interface IOutput {
    executeAnalysis: (id: string) => void;
}
export const usePrepareAnalysis = ({
    config,
    columns,
    queueFor,
    queueType,
}: IActiveNode & { columns: IColumn[]; queueFor: string; queueType: string }): IOutput => {

    const { mainSelectedList, availableList, setModel } = useDescriptiveStatistics(useShallow((state) => ({
        availableList: state.model.availableList,
        mainSelectedList: state.model.mainSelectedList,
        setModelBulk: state.setModelBulk,
        setModel: state.setModel
    })));
    useEffect(() => {
        const columnMap = new Map<string, boolean>();
        columns.forEach((column) => {
            if (!availableList.has(column.columnId)) {
                columnMap.set(column.columnId, false);
            }
        });
        setModel({ availableList: columnMap, mainSelectedList: new Map() });
    }, [columns.length])
    const { execute } = useAnalyzeSave();

    const executeAnalysis = async (id: string): Promise<void> => {
        const tableName = config.tabName;
        const parameters = {
            data_name: tableName,
            input_data_type: 'file',
            db_name: tableName,
            selected_vars: [...mainSelectedList.keys()],
            operation: 'descriptive_statistics',
        };
        execute(config.tabName, parameters, {
            queueFor,
            url: `/api/${API.analysis}`,
            queueType
        }, id);
    };

    return { executeAnalysis };
};
