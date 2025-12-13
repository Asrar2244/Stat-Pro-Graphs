import { FC } from 'react';
import { Modal } from '@libs';
import { IModal } from '@hooks';
import { Text, tokens, Button } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { VscSparkle } from 'react-icons/vsc';

interface ComingSoonModalProps extends IModal {
  featureName?: string;
}

export const ComingSoonModal: FC<ComingSoonModalProps> = ({ 
  featureName = 'This feature',
  ...modal 
}) => {
  const { t } = useTranslation('common');

  return (
    <Modal
      modalType="modal"
      showTitle={false}
      showOk={false}
      showCancel={false}
      size="small"
      {...modal}
    >
      <div style={{
        padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
        textAlign: 'center',
        width: '450px',
        maxWidth: '500px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        {/* Professional icon with gradient background */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, ${tokens.colorBrandForeground1} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: tokens.spacingVerticalL,
          boxShadow: tokens.shadow16,
        }}>
          <VscSparkle 
            size={40} 
            style={{ 
              color: tokens.colorNeutralForegroundInverted,
            }} 
          />
        </div>

        {/* Title */}
        <Text 
          style={{
            fontSize: tokens.fontSizeHero700,
            fontWeight: tokens.fontWeightBold,
            color: tokens.colorNeutralForeground1,
            marginBottom: tokens.spacingVerticalM,
            display: 'block',
            fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", "Helvetica Neue", Arial, sans-serif',
            letterSpacing: '-0.5px',
          }}
        >
          Coming Soon
        </Text>

        {/* Description */}
        <Text 
          style={{
            fontSize: tokens.fontSizeBase400,
            color: tokens.colorNeutralForeground2,
            marginBottom: tokens.spacingVerticalXL,
            display: 'block',
            lineHeight: '1.6',
            fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", "Helvetica Neue", Arial, sans-serif',
            maxWidth: '420px',
          }}
        >
          <strong style={{ color: tokens.colorNeutralForeground1 }}>{featureName}</strong> is currently under development and will be available in a future update.
        </Text>

        {/* Thank you message */}
        <Text 
          style={{
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground3,
            marginBottom: tokens.spacingVerticalL,
            display: 'block',
            fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", "Helvetica Neue", Arial, sans-serif',
            fontStyle: 'italic',
          }}
        >
          Thank you for your patience!
        </Text>

        {/* Close button */}
        <Button
          appearance="primary"
          onClick={modal.closeModal}
          style={{
            marginTop: tokens.spacingVerticalM,
            minWidth: '120px',
          }}
        >
          {t('close', { ns: 'common' }) || 'Close'}
        </Button>
      </div>
    </Modal>
  );
};
