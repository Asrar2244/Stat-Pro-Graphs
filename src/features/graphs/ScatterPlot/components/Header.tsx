import React, { FC } from 'react';
import { Text } from '@fluentui/react-components';
import { MdTrendingUp } from 'react-icons/md';

interface HeaderProps {
  classes: Record<string, string>;
}

export const ScatterHeader: FC<HeaderProps> = ({ classes }) => {
  return (
    <div className={classes.header}>
      <div className={classes.headerTitleRow}>
        <MdTrendingUp size={24} />
        <Text size={500} weight="semibold">Scatter Plot Configuration</Text>
      </div>
      <Text size={200} className={classes.headerSubtitle}>
        Create professional scatter plots with customizable variables and data formats
      </Text>
    </div>
  );
};




