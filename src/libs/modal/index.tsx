import { FC, PropsWithChildren, ReactElement, ReactNode, useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  DialogProps,
  ButtonProps,
  makeStyles,
  tokens,
  shorthands,
  Text,
} from '@fluentui/react-components';
import { IModal } from '@hooks';
import { RiCloseLine } from 'react-icons/ri';

export interface IDialogProps extends IModal, PropsWithChildren {
  title?: ReactElement | string;
  showTitle?: boolean;
  okLabel?: ReactElement | string;
  cancelLabel?: ReactElement | string;
  ok?: ButtonProps;
  next?: ButtonProps;
  cancel?: ButtonProps;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  showCancel?: boolean;
  showOk?: boolean;
  modalType?: 'modal' | 'non-modal';
  showNext?: boolean;
  nextLabel?: ReactElement | string;
  preventOutsideClick?: boolean;
}

const useModalLayout = makeStyles({
  surface: {
    boxShadow: `0 8px 32px ${tokens.colorNeutralStroke1}40, 0 4px 16px ${tokens.colorNeutralStroke1}30`,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: 'visible',
  },
  header: {
    flex: 1,
    display: 'flex',
    gap: '16px',
    justifyContent: 'space-between',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralForegroundDisabled),
    background: `linear-gradient(to bottom, ${tokens.colorNeutralBackground1}, ${tokens.colorNeutralBackground2})`,
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusLarge, tokens.borderRadiusLarge, 0, 0),
  },
  body: {
    ...shorthands.padding(0),
    overflow: 'hidden',
    maxHeight: 'none',
  },
  closeButton: {
    fontSize: '20px',
    minWidth: '32px',
    minHeight: '32px',
    '&:hover': {
      color: tokens.colorPaletteRedForeground1,
      backgroundColor: tokens.colorPaletteRedBackground3,
    },
    '&:hover:active': {
      color: tokens.colorPaletteRedForeground1,
      backgroundColor: tokens.colorPaletteRedBackground2,
    },
  },
});

const sizeConversion = (size: 'small' | 'medium' | 'large' | 'extra-large' | undefined): string => {
  return size === 'small' ? '35%' : size === 'medium' ? '60%' : size === 'large' ? '95%' : size === 'extra-large' ? '98%' : '25%';
};

// Floating Modal Component with drag functionality and position persistence
const FloatingModal: FC<{
  children: ReactNode;
  title?: ReactElement | string;
  showTitle?: boolean;
  okLabel?: ReactElement | string;
  cancelLabel?: ReactElement | string;
  ok?: ButtonProps;
  cancel?: ButtonProps;
  showCancel?: boolean;
  showOk?: boolean;
  closeModal: () => void;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  classes: any;
}> = ({
  children,
  title,
  showTitle = true,
  okLabel,
  cancelLabel,
  ok,
  cancel,
  showCancel,
  showOk,
  closeModal,
  size,
  classes
}) => {
    // Load saved position from localStorage, default to center-right
    const getSavedPosition = () => {
      const saved = localStorage.getItem('floating-modal-position');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return { x: window.innerWidth - 450, y: 50 };
        }
      }
      return { x: window.innerWidth - 450, y: 50 };
    };

    const [position, setPosition] = useState(getSavedPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Keep modal within viewport bounds
      const maxX = window.innerWidth - (modalRef.current?.offsetWidth || 400);
      const maxY = window.innerHeight - (modalRef.current?.offsetHeight || 300);

      const newPosition = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      };

      setPosition(newPosition);

      // Save position to localStorage
      localStorage.setItem('floating-modal-position', JSON.stringify(newPosition));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, dragStart]);

    return (
      <div
        ref={modalRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000,
          maxWidth: sizeConversion(size),
          width: 'fit-content',
          minWidth: '400px',
          backgroundColor: tokens.colorNeutralBackground1,
          borderRadius: tokens.borderRadiusMedium,
          boxShadow: tokens.shadow16,
          border: `1px solid ${tokens.colorNeutralStroke1}`,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          minHeight: '300px',
          cursor: isDragging ? 'grabbing' : 'default',
          // Prevent text selection during drag
          userSelect: 'none',
          // Ensure proper rendering
          contain: 'layout style paint'
        }}
      >
        {showTitle && (
          <div
            className={classes.header}
            onMouseDown={handleMouseDown}
            style={{
              cursor: 'grab',
              userSelect: 'none',
              backgroundColor: tokens.colorNeutralBackground1,
              borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
              color: tokens.colorNeutralForeground1,
              padding: tokens.spacingVerticalM,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '48px'
            }}
          >
            <Text style={{
              color: tokens.colorNeutralForeground1,
              margin: 0,
              fontSize: tokens.fontSizeBase300,
              fontWeight: tokens.fontWeightSemibold
            }}>
              {title}
            </Text>
            <Button
              appearance="subtle"
              icon={<RiCloseLine />}
              onClick={closeModal}
              className={classes.closeButton}
              style={{ marginLeft: tokens.spacingHorizontalM }}
            />
          </div>
        )}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: tokens.colorNeutralBackground1,
          color: tokens.colorNeutralForeground1,
          padding: tokens.spacingVerticalM
        }}>
          {children}
        </div>
        <div style={{
          padding: tokens.spacingVerticalM,
          borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
          backgroundColor: tokens.colorNeutralBackground1,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: tokens.spacingHorizontalS,
          minHeight: '60px',
          alignItems: 'center'
        }}>
          {showCancel && (
            <Button appearance="secondary" onClick={closeModal} {...cancel}>
              {cancelLabel}
            </Button>
          )}
          {showOk && (
            <Button appearance="primary" {...ok}>
              {okLabel}
            </Button>
          )}
        </div>
      </div>
    );
  };

export const Modal: FC<IDialogProps & DialogProps> = ({
  children,
  open,
  title,
  okLabel,
  cancelLabel,
  cancel,
  ok,
  size,
  closeModal,
  showCancel,
  showTitle = true,
  showOk = true,
  modalType = 'modal',
  showNext = false,
  next,
  nextLabel,
  preventOutsideClick = false,
  ...others
}) => {
  const classes = useModalLayout();
  if (!open) return null;

  // For non-modal type, render as a floating panel instead of a dialog
  if (modalType === 'non-modal') {
    return (
      <FloatingModal
        title={title}
        showTitle={showTitle}
        okLabel={okLabel}
        cancelLabel={cancelLabel}
        ok={ok}
        cancel={cancel}
        showCancel={showCancel}
        showOk={showOk}
        closeModal={closeModal}
        size={size}
        classes={classes}
      >
        {children}
      </FloatingModal>
    );
  }

  // Handle outside click prevention
  const handleOpenChange = (_event: any, data: any) => {
    // If preventOutsideClick is true and the dialog is trying to close, prevent it
    if (preventOutsideClick && data.open === false) {
      return;
    }
    // Otherwise, allow normal close behavior
    if (data.open === false) {
      closeModal();
    }
  };

  // Default modal behavior
  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      modalType={preventOutsideClick ? 'modal' : undefined}
      {...others}
    >
      <DialogSurface
        className={classes.surface}
        style={{ maxWidth: sizeConversion(size), width: 'fit-content' }}
        onClick={(e) => {
          // Prevent clicks on the surface from bubbling to backdrop
          e.stopPropagation();
        }}
      >
        {showTitle && (
          <div className={classes.header}>
            <DialogTitle>{title}</DialogTitle>
            {preventOutsideClick ? (
              <Button
                appearance="subtle"
                icon={<RiCloseLine />}
                className={classes.closeButton}
                disabled={true}
              />
            ) : (
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="subtle" icon={<RiCloseLine />} className={classes.closeButton} />
              </DialogTrigger>
            )}
          </div>
        )}
        <DialogBody>
          <DialogContent className={classes.body}>{children}</DialogContent>
          <DialogActions>
            {showCancel && (
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" {...cancel}>
                  {cancelLabel}
                </Button>
              </DialogTrigger>
            )}
            {showOk && (
              <Button appearance="primary" {...ok}>
                {okLabel}
              </Button>
            )}
            {showNext && (
              <Button appearance="primary" {...next}>
                {nextLabel}
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};