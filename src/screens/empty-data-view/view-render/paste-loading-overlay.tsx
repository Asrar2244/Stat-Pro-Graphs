import { FC } from 'react';
import { Spinner } from '@fluentui/react-components';
import { usePasteLoadingOverlayStyles } from './paste-loading-overlay.styles';

interface PasteLoadingOverlayProps {
  isVisible: boolean;
  isDarkMode: boolean;
  label?: string;
}

export const PasteLoadingOverlay: FC<PasteLoadingOverlayProps> = ({ isVisible, isDarkMode, label = "Processing paste..." }) => {
  const classes = usePasteLoadingOverlayStyles();

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${classes.overlay} ${isDarkMode ? classes.overlayDark : ''}`}>
      <div className={`${classes.container} ${isDarkMode ? classes.containerDark : ''}`}>
        <Spinner label={label} size="large" />
      </div>
    </div>
  );
};
