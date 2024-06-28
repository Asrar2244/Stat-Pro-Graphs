import { FC, ReactElement } from 'react';
import { Toast, ToastTitle, ToastBody, ToastFooter } from '@fluentui/react-components';

export interface IToasterProps {
  title?: string;
  body: string;
  titleComponent?: ReactElement;
  footerComponent?: ReactElement;
}

export const ToasterComponent: FC<IToasterProps> = (props) => {
  return (
    <Toast>
      <ToastTitle action={props.titleComponent}>{props.title}</ToastTitle>
      <ToastBody>{props.body}</ToastBody>
      <ToastFooter>{props.footerComponent}</ToastFooter>
    </Toast>
  );
};
