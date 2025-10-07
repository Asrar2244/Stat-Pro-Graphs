
import {
    Card,
    Text
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import React from 'react'
import { useEffect, useState } from 'react';
import { useTableFetch } from '@libs/table-creator/use-table-hook';

type CustomField = {
    name: string;
    type: string;
};

type Props = {
    data: Record<string, string | number>;
    customFields: CustomField[];
    namespaces: string[]
};

type TestResult = {
    config: any,
    t: any,
    namespaces: string[],
    dbFileName: string,
    dbTableName: string
};

export const TestResultScreen = ({ config, t, namespaces, dbFileName, dbTableName }: TestResult) => {
    const { view, recordType, appendColumn, postfix, prefix, type, } = config;

    const { templateView, loading, loadTemplateView } = useTableFetch({
        dbName: dbFileName,
        tableName: dbTableName,
        t,
        view: view as any,
        recordType,
        appendColumn,
        postfix,
        prefix,
        type
    });
    const [jsonData, updateJsonData] = useState({})

    useEffect(() => {
        loadTemplateView(0, 0);
    }, []);
    useEffect(() => {
        updateJsonData(Object.fromEntries(templateView));
    }, [templateView])
    if (loading) {
        return <div>Loading...</div>
    }

    return <TestResultComponent data={jsonData} customFields={config?.customFields} namespaces={namespaces} />

};

const TestResultComponent = ({ data, customFields, namespaces }: Props) => {
    const { t } = useTranslation(["testOuputCommon", ...namespaces]);

    const customFieldMap = Object.fromEntries(customFields?.map(f => [f.name, f.type]) || [[""]]);
    console.log(customFieldMap, "====================")
    const customRenderers: Record<string, (data: Record<string, string | number>) => React.ReactNode> = {
        "conclusion_one_tailed": (data) => {
            return Number(data['t-conclusion_one_tailed']) === 1 ? <React.Fragment>{t('one-success')}</React.Fragment> : <React.Fragment>{t('one-failure')}</React.Fragment>
        },
        "conclusion_two_tailed": (data) => {
            return Number(data['t-conclusion_two_tailed']) === 1 ? <React.Fragment>{t('two-success')}</React.Fragment> : <React.Fragment>{t('two-failure')}</React.Fragment>
        }
    };

    return (
        <Card style={{ width: '100%', padding: 16, margin: 'auto' }}>
            {Object.entries(data)?.map(([key]) => {
                const type = customFieldMap[key];
                const customRender = customRenderers[type];
                if (type && customRender) {
                    return <React.Fragment key={key}>{customRender(data)}</React.Fragment>;
                }
                return (
                    <Text key={key} style={{ display: 'block', marginTop: 8 }}>
                        <span>{t(key, { ...data })}</span>
                    </Text>
                );
            })}
        </Card>
    );
};


