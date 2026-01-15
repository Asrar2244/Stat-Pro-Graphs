import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../../context';
import { CardTableRender, RawTableRender } from '@libs';
import configurations from './configuration/paired-t-test.configuration.json';
import { useTranslation } from 'react-i18next';
import { ITableCreator } from '@utils';
import { useCommonStyles } from '../../../../top-menu/advanced/tests/t-test/styles-hook/use-test-styles';
import { TestResultScreen } from '../test-screen';

export const PairedTTestComponent: FC = () => {
    const context = useContext(OutputRenderContext);
    const { t } = useTranslation('t_test_output');
    const classes = useCommonStyles();

    // Robustly extract the table name from the backend result
    const result = context?.selectedRun?.result as any;
    const dbTableName = (
        result?.output_table_name ||
        result?.table_name ||
        (typeof result === 'string' ? result : '')
    ) as string;

    return (
        <RawTableRender
            dbFileName={context?.selectedRun?.tabName as string}
            dbTableName={dbTableName}
            title={t('title', { ns: 'pairedTTestAanalysis' })}
        />
    );
};



