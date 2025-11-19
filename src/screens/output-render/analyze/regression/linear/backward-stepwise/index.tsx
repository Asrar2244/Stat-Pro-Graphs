import { FC, useContext } from 'react';
import { OutputRenderContext } from '../../../../context';
import { useRegressions } from '../../../../styles-hook/use-regressions-style';
import { CardTableRender, GraphPlot } from '@libs';
import configurations from './configuration/backward-stepwise-config.json';
import { useTranslation } from 'react-i18next';
import { ITableCreator, IGraph } from '@utils';
import { useGraphConfig } from '@hooks';
import { renderRawBackendOutput } from '@outputRegressionCommon/render-raw-backend-output';

export const BackwardStepwiseRegression: FC = () => {
  const context = useContext(OutputRenderContext);
  const { t } = useTranslation('reqLinearLeastSquareOutput');
  const classes = useRegressions();
  const graphConfig = useGraphConfig(configurations.graph as any);
  const result = context?.selectedRun?.result;

  if (typeof result === 'string') {
    return renderRawBackendOutput(result, {
      containerClassName: `${classes.regressionsLayout} ${classes.errorContainer}`,
      title: t('errorBackendOutputTitle'),
      description: t('errorBackendOutputDescription'),
      footer: t('errorBackendOutputFooter'),
      titleClassName: classes.errorHeading,
      descriptionClassName: classes.errorParagraph,
      preClassName: classes.errorPre,
      footerClassName: classes.errorFooter,
      useDefaultStyles: false,
    });
  }

  return (
    <div className={classes.regressionsLayout}>
      {configurations.tables.map((table) => (
        <CardTableRender
          key={table.name}
          t={t}
          table={table as ITableCreator}
          dbFileName={context?.selectedRun?.tabName as string}
          dbTableName={result?.output_table_name as string}
        />
      ))}
      {graphConfig.map((graph: IGraph) => (
        <GraphPlot
          key={graph.name}
          graph={graph as any}
          dbFileName={context?.selectedRun?.tabName as string}
          dbTableName={result?.output_table_name as string}
        />
      ))}

    </div>
  );
};

