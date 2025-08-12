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
  cancel?: ButtonProps;
  size?: 'small' | 'medium' | 'large';
  showCancel?: boolean;
  showOk?: boolean;
}

const useModalLayout = makeStyles({
  header: {
    flex: 1,
    display: 'flex',
    gap: '16px',
    justifyContent: 'space-between',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralForegroundDisabled),
  },
  body: {
    ...shorthands.padding(0),
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
  ...others
}) => {
  const classes = useModalLayout();
  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={(event, data) => data.open === false && closeModal()} {...others}>
      <DialogSurface style={{ maxWidth: sizeConversion(size), width: 'fit-content' }}>
        {showTitle && (
          <div className={classes.header}>
            <DialogTitle>{title}</DialogTitle>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="subtle" icon={<RiCloseLine />} />
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
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
