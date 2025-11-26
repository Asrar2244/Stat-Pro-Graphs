import { FC, PropsWithChildren, ReactElement } from 'react';
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
  size?: 'small' | 'medium' | 'large';
  showCancel?: boolean;
  showOk?: boolean;
  showNext?: boolean;
  nextLabel?: ReactElement | string;
}

const useModalLayout = makeStyles({
  surface: {
    boxShadow: `0 8px 32px ${tokens.colorNeutralStroke1}40, 0 4px 16px ${tokens.colorNeutralStroke1}30`,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: tokens.colorNeutralBackground1,
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

const sizeConversion = (size: 'small' | 'medium' | 'large' | undefined): string => {
  return size === 'small' ? '35%' : size === 'medium' ? '60%' : size === 'large' ? '95%' : '25%';
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
  showNext = false,
  next,
  nextLabel,
  ...others
}) => {
  const classes = useModalLayout();
  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={(_event, data) => data.open === false && closeModal()} {...others}>
      <DialogSurface className={classes.surface} style={{ maxWidth: sizeConversion(size), width: 'fit-content' }}>
        {showTitle && (
          <div className={classes.header}>
            <DialogTitle>{title}</DialogTitle>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="subtle" icon={<RiCloseLine />} className={classes.closeButton} />
            </DialogTrigger>
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