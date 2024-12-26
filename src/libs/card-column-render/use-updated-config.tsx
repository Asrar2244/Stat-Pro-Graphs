import { ICardInterface, Database } from "@utils";
import { useState, useEffect } from "react";

export const useUpdatedConfig = ({ dbName, tableName, config }: {
    dbName: string, tableName: string, config: ICardInterface
}): ICardInterface => {
    const [updatedConfig, setUpdatedConfig] = useState<ICardInterface>(config)
    const updateConfiguration = async () => {
        const db = new Database(dbName);
        const query = `PRAGMA table_info(${tableName});`;
        try {
            const tableInfo = await db.selectQuery(query);
            const [_fc, ...columnNames] = tableInfo.map((row: any) => row.name);
            const updatedColumns = config.columns.map(col => {
                return {
                    ...col,
                    rows: col.type === "static" ? columnNames.map((c: string) => { return { label: c } }) : columnNames.map((c: string) => { return { path: c } })
                }
            })
            return Promise.resolve({
                ...config,
                columns: updatedColumns
            })
        } catch (error) {
            console.error('Error fetching column names:', error);
            throw error;
        }
    }
    useEffect(() => {
        if (config.showSelectedColumn) {
            updateConfiguration().then((data) =>
                setUpdatedConfig(data)
            )
        }
        else {
            setUpdatedConfig(config)
        }
    }, [config])
    return updatedConfig as ICardInterface;
}
