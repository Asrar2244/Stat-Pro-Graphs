import { FC, useState } from 'react';
import { tokens } from '@fluentui/react-components';
import { MdOutlinePushPin, MdPushPin } from 'react-icons/md';
import { 
  VscHome, 
  VscPerson, 
  VscFeedback, 
  VscAccount, 
  VscInfo 
} from 'react-icons/vsc';
import { useHelpStyles } from './styles-hook/use-help-styles';
import type { HelpDropdownPanelProps } from './types';
import { useModal } from '@hooks';
import { OpenDevTools } from '../open-dev-tools';
import logo from '../../../assets/Square44x44Logo.png';

export const HelpDropdownPanel: FC<HelpDropdownPanelProps> = ({ 
  open, 
  onClose, 
  setMenuItem, 
  pinned: propPinned, 
  setPinned: propSetPinned 
}) => {
  const styles = useHelpStyles();
  const [localPinned, setLocalPinned] = useState(false);
  const pinned = propPinned !== undefined ? propPinned : localPinned;
  const setPinned = propSetPinned || setLocalPinned;
  
  const onCloseIfNotPinned = () => { if (!pinned) onClose(); };
  const modal = useModal({});

  // Render modal even when panel is closed, so it stays open
  const modalContent = modal.open ? <OpenDevTools {...modal} showCloseButton={false} /> : null;

  if (!open) {
    // Still render the modal even when panel is closed
    return modalContent;
  }

  const handleHomePage = () => {
    window.open('https://statpro.org', '_blank');
    if (!pinned) onClose();
  };

  const handleTechnicalSupport = () => {
    window.open('https://statpro.org/support', '_blank');
    if (!pinned) onClose();
  };

  const handleProductFeedback = () => {
    window.open('https://statpro.org/feedback', '_blank');
    if (!pinned) onClose();
  };

  const handleLicenseStatus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    modal.openModal();
    // Don't close the panel when opening modal, let user interact with modal
    // Panel will close when clicking outside or when modal is closed
  };

  const handleAboutStatPro = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    modal.openModal();
    // Don't close the panel when opening modal, let user interact with modal
    // Panel will close when clicking outside or when modal is closed
  };

  return (
    <>
      {/* Backdrop to close the slider when clicking outside */}
      <div 
        style={{ 
          ...styles.backdrop,
          pointerEvents: pinned ? 'none' : 'auto',
          zIndex: pinned ? 998 : 1001
        }} 
        onClick={(e) => {
          // Only close if clicking directly on backdrop and not pinned
          if (e.target === e.currentTarget && !pinned) {
            e.stopPropagation();
            onCloseIfNotPinned();
          }
        }}
        onMouseDown={(e) => {
          // Prevent event from bubbling to other panels when not pinned
          if (!pinned && e.target === e.currentTarget) {
            e.stopPropagation();
          }
        }}
      />
      
      <div style={styles.container}>
        {/* Pin control */}
        <div 
          style={{ 
            position: 'absolute', 
            right: 12, 
            bottom: 8, 
            zIndex: 1000001,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
          }}
          onClick={() => setPinned(!pinned)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {pinned ? (
            <MdPushPin size={14} style={{ color: tokens.colorBrandForeground1 }} />
          ) : (
            <MdOutlinePushPin size={14} />
          )}
        </div>

        <div style={styles.content}>
          {/* On the Web Container */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              <div style={styles.sectionTitleDot} />
              On the Web
            </div>
            <div style={styles.buttonContainer}>
              <div
                style={styles.helpButton}
                onClick={handleHomePage}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, ${tokens.colorBrandBackground2}20 100%)`;
                  e.currentTarget.style.borderColor = tokens.colorBrandStroke1;
                  e.currentTarget.style.boxShadow = tokens.shadow8;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`;
                  e.currentTarget.style.borderColor = tokens.colorNeutralStroke2;
                  e.currentTarget.style.boxShadow = tokens.shadow2;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <VscHome size={20} style={styles.buttonIcon} />
                <div style={styles.buttonLabel}>Home Page</div>
              </div>

              <div
                style={styles.helpButton}
                onClick={handleTechnicalSupport}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, ${tokens.colorBrandBackground2}20 100%)`;
                  e.currentTarget.style.borderColor = tokens.colorBrandStroke1;
                  e.currentTarget.style.boxShadow = tokens.shadow8;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`;
                  e.currentTarget.style.borderColor = tokens.colorNeutralStroke2;
                  e.currentTarget.style.boxShadow = tokens.shadow2;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <VscPerson size={20} style={styles.buttonIcon} />
                <div style={styles.buttonLabel}>Technical Support</div>
              </div>

              <div
                style={styles.helpButton}
                onClick={handleProductFeedback}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, ${tokens.colorBrandBackground2}20 100%)`;
                  e.currentTarget.style.borderColor = tokens.colorBrandStroke1;
                  e.currentTarget.style.boxShadow = tokens.shadow8;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`;
                  e.currentTarget.style.borderColor = tokens.colorNeutralStroke2;
                  e.currentTarget.style.boxShadow = tokens.shadow2;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <VscFeedback size={20} style={styles.buttonIcon} />
                <div style={styles.buttonLabel}>Product Feedback</div>
              </div>
            </div>
          </div>

          {/* License Container */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              <div style={styles.sectionTitleDot} />
              License
            </div>
            <div style={styles.buttonContainer}>
              <div
                style={styles.helpButton}
                onClick={handleLicenseStatus}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, ${tokens.colorBrandBackground2}20 100%)`;
                  e.currentTarget.style.borderColor = tokens.colorBrandStroke1;
                  e.currentTarget.style.boxShadow = tokens.shadow8;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`;
                  e.currentTarget.style.borderColor = tokens.colorNeutralStroke2;
                  e.currentTarget.style.boxShadow = tokens.shadow2;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '4px' }}>
                  <VscAccount size={24} style={styles.buttonIcon} />
                  <VscInfo 
                    size={12} 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 'calc(50% - 12px)', 
                      color: tokens.colorBrandForeground1,
                      backgroundColor: tokens.colorNeutralBackground1,
                      borderRadius: '50%',
                    }} 
                  />
                </div>
                <div style={styles.buttonLabel}>License Status</div>
              </div>

              <div
                style={styles.helpButton}
                onClick={handleAboutStatPro}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, ${tokens.colorBrandBackground2}20 100%)`;
                  e.currentTarget.style.borderColor = tokens.colorBrandStroke1;
                  e.currentTarget.style.boxShadow = tokens.shadow8;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`;
                  e.currentTarget.style.borderColor = tokens.colorNeutralStroke2;
                  e.currentTarget.style.boxShadow = tokens.shadow2;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '4px' }}>
                  <img 
                    src={logo} 
                    alt="StatPro" 
                    style={{ 
                      width: '24px', 
                      height: '24px',
                      objectFit: 'contain',
                    }} 
                  />
                  <VscInfo 
                    size={12} 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 'calc(50% - 12px)', 
                      color: tokens.colorBrandForeground1,
                      backgroundColor: tokens.colorNeutralBackground1,
                      borderRadius: '50%',
                    }} 
                  />
                </div>
                <div style={styles.buttonLabel}>About StatPro</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* License Status / About Modal - rendered separately so it persists when panel closes */}
      {modalContent}
    </>
  );
};

