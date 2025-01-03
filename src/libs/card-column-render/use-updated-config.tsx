import { ICardInterface, Database } from "@utils";
import { useState, useEffect } from "react";

const EXCLUDE_COLUMNS = ["_sme", "_mode"];

export const useUpdatedConfig = ({ dbName, tableName, config }: {
    dbName: string;
    tableName: string;
    config: ICardInterface;
}): { config: ICardInterface, isLoading: boolean } => {
    const [updatedConfig, setUpdatedConfig] = useState<ICardInterface>(config);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const fetchTableColumns = async () => {
        const db = new Database(dbName);
        const query = `PRAGMA table_info(${tableName});`;
        try {
            const tableInfo = await db.selectQuery(query);
            return config.showHeader ? tableInfo.map((row: any) => row.name) : tableInfo.map((row: any) => row.name).sliice(1);
        } catch (error) {
            console.error("Error fetching column names:", error);
            throw error;
        }
    };

    const filterColumns = (columns: string[]) =>
        columns.filter(
            (column) => !EXCLUDE_COLUMNS.some((exclude) => column.includes(exclude))
        );

    const updateConfiguration = async () => {
        const columnNames = await fetchTableColumns();
        const filteredColumns = filterColumns(columnNames);
        const updatedColumns = config.columns.map((col) => ({
            ...col,
            rows: filteredColumns.map((column) =>
                col.type === "static" ? { label: column } : { path: column }
            ),
        }));

        return { ...config, columns: updatedColumns };
    };

    useEffect(() => {
        const updateConfig = async () => {
            if (config.showSelectedColumn) {
                const newConfig = await updateConfiguration();
                setUpdatedConfig(newConfig);
            } else {
                setUpdatedConfig(config);
            }
            setIsLoading(false)
        };

        updateConfig().catch((error) => console.error("Error updating config:", error));

    }, [config, dbName, tableName]);

    return { config: updatedConfig, isLoading }
};
