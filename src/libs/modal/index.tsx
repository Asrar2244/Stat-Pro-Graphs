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

export interface IDialogProps extends IModal, PropsWithChildren {
  title?: ReactElement | string;
  okLabel?: ReactElement | string;
  cancelLabel?: ReactElement | string;
  ok?: ButtonProps;
  cancel?: ButtonProps;
  size?: 'small' | 'medium' | 'large';
}

const useModalLayout = makeStyles({
  header: {
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralForegroundDisabled),
  },
  body: {
    ...shorthands.padding(0),
  },
});

const sizeConversion = (size: 'small' | 'medium' | 'large' | undefined): string => {
  return size === 'small' ? '35%' : size === 'medium' ? '60%' : size === 'large' ? '95%' : '35%';
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
  ...others
}) => {
  const classes = useModalLayout();
  return (
    <Dialog open={open} onOpenChange={closeModal} {...others}>
      <DialogSurface style={{ maxWidth: sizeConversion(size) }}>
        <DialogBody>
          <DialogTitle className={classes.header}>{title}</DialogTitle>
          <DialogContent className={classes.body}>{children}</DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" {...cancel}>
                {cancelLabel}
              </Button>
            </DialogTrigger>
            <Button appearance="primary" {...ok}>
              {okLabel}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
