import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../../context';
import { CardTableRender } from '@libs';
import configurations from './configuration/t-test.configuration.json';
import { useTranslation } from 'react-i18next';
import { ITableCreator } from '@utils';
import { useCommonStyles } from '../../../../top-menu/advanced/tests/t-test/styles-hook/use-test-styles';
import { TestResultScreen } from '../test-screen';

export const TTestComponent: FC = () => {
    const context = useContext(OutputRenderContext);
    const { t } = useTranslation('t_test_output');
    const classes = useCommonStyles();
    return (
        <div className={classes.commonWrapper} style={{ gap: 0, borderRadius: 0 }}>
            {configurations.tables.map((table) => (
                <CardTableRender
                    key={table.name}
                    t={t}
                    table={table as ITableCreator}
                    dbFileName={context?.selectedRun?.tabName as string}
                    dbTableName={context?.selectedRun?.result as unknown as string}
                />
            ))}
            {configurations.customScreen?.map((screen) => (
                <TestResultScreen
                    config={screen}
                    key={screen.name}
                    t={t}
                    dbFileName={context?.selectedRun?.tabName as string}
                    dbTableName={context?.selectedRun?.result as unknown as string}
                    namespaces={['T_TestsAnalysys']}
                />
            ))}
        </div>
    );
};
