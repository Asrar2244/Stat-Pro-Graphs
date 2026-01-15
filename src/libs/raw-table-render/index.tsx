import { FC, useEffect, useState, memo } from 'react';
import {
    Table,
    TableRow,
    TableBody,
    TableCell,
    Card,
    CardHeader,
    Body1Stronger,
    makeStyles,
    tokens,
    shorthands
} from '@fluentui/react-components';
import { Database } from '@utils';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingHorizontalL,
        padding: tokens.spacingHorizontalL,
    },
    card: {
        width: '100%',
        overflowX: 'auto',
        backgroundColor: tokens.colorNeutralBackground1,
        ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    },
    table: {
        minWidth: '100%',
        borderCollapse: 'collapse',
    },
    keyCell: {
        backgroundColor: tokens.colorNeutralBackground2,
        color: tokens.colorNeutralForeground1,
        fontWeight: 'bold',
        width: '30%',
        minWidth: '200px',
        ...shorthands.padding(tokens.spacingHorizontalS),
        ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    },
    valueCell: {
        ...shorthands.padding(tokens.spacingHorizontalS),
        ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
        wordBreak: 'break-word',
    }
});

interface IRawTableRenderProps {
    dbFileName: string;
    dbTableName: string;
    title?: string;
}

const RawTableRenderComponent: FC<IRawTableRenderProps> = ({ dbFileName, dbTableName, title }) => {
    const classes = useStyles();
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            if (!dbFileName || !dbTableName) return;
            setLoading(true);
            setError(null);
            try {
                const db = new Database(dbFileName);

                // 1. Get all columns
                const pragma = await db.selectQuery(`PRAGMA table_info('${dbTableName}')`);
                if (!pragma || pragma.length === 0) {
                    throw new Error(`Table ${dbTableName} not found or has no columns.`);
                }
                const colNames = pragma.map((c: any) => c.name);

                // 2. Select all data
                const rows = await db.selectQuery(`SELECT * FROM ${dbTableName}`);

                if (isMounted) {
                    setColumns(colNames);
                    setData(rows);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || 'Failed to fetch data');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [dbFileName, dbTableName]);

    const formatValue = (value: any): string => {
        if (value === null || value === undefined) return '-';
        let str = String(value);

        // 1. Remove NumPy wrappers: np.float64(1.23) -> 1.23
        if (str.includes('np.float64')) {
            str = str.replace(/np\.float64\(([^)]+)\)/g, '$1');
        }

        // 2. Handle simple numbers
        const num = Number(str);
        if (!isNaN(num) && str.trim() !== '' && !str.includes(',')) {
            return new Intl.NumberFormat('en-US', {
                maximumFractionDigits: 4,
            }).format(num);
        }

        // 3. Handle list-like strings (e.g., [1.23, 4.56] or results of step 1)
        if (str.startsWith('[') && str.endsWith(']')) {
            const inner = str.substring(1, str.length - 1);
            const parts = inner.split(',').map((p) => {
                const n = Number(p.trim());
                return !isNaN(n)
                    ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(n)
                    : p.trim();
            });
            return `[${parts.join(', ')}]`;
        }

        return str;
    };

    if (loading) return <div style={{ padding: 20 }}>Loading results...</div>;
    if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;

    return (
        <div className={classes.container}>
            {data.length === 0 ? (
                <Card className={classes.card}>
                    <div style={{ padding: 20 }}>No results found in {dbTableName}.</div>
                </Card>
            ) : (
                data.map((row, rowIndex) => (
                    <Card key={rowIndex} className={classes.card}>
                        {(title || data.length > 1) && (
                            <CardHeader
                                header={
                                    <Body1Stronger>
                                        {title}
                                        {data.length > 1 ? ` - Run ${rowIndex + 1}` : ''}
                                    </Body1Stronger>
                                }
                            />
                        )}
                        <Table className={classes.table}>
                            <TableBody>
                                {columns.map((col) => (
                                    <TableRow key={col}>
                                        <TableCell className={classes.keyCell}>
                                            {col.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </TableCell>
                                        <TableCell className={classes.valueCell}>
                                            {formatValue(row[col])}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                ))
            )}
        </div>
    );
};

export const RawTableRender = memo(RawTableRenderComponent);
