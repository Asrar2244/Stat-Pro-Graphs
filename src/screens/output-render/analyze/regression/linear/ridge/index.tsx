import { FC } from 'react';

import { useRegressions } from '../../../../styles-hook/use-regressions-style';

import { Card, CardHeader, Body1Stronger } from '@fluentui/react-components';

export const LinearRidgeRegression: FC = () => {
  const classes = useRegressions();
  return (
    <div className={classes.regressionsLayout}>
      <Card>
        <CardHeader header={<Body1Stronger>Header</Body1Stronger>} />
        <h1>Here table</h1>
      </Card>
      <h1>Graph</h1>
    </div>
  );
};
