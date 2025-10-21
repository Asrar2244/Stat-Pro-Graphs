import { FC } from 'react';
import { Spinner, Text, tokens } from '@fluentui/react-components';

/**
 * Props for the GraphLoader component
 */
interface GraphLoaderProps {
  isVisible?: boolean;
  message?: string;
}

/**
 * Component for displaying a loading spinner while graphs are being processed
 */
export const GraphLoader: FC<GraphLoaderProps> = ({ 
  isVisible = false, 
  message = "Loading graph..." 
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tokens.colorNeutralBackground1,
      opacity: 0.9,
      zIndex: 1000,
      gap: tokens.spacingVerticalM,
    }}>
      <Spinner size="large" />
      <Text size={400} style={{ color: tokens.colorNeutralForeground1 }}>
        {message}
      </Text>
    </div>
  );
};







