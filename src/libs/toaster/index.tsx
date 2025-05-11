import { FC, isValidElement, ReactElement } from 'react';
import { Toast, ToastTitle, ToastBody, ToastFooter, Text } from '@fluentui/react-components';

export interface IToasterProps {
  title?: string;
  body: string | ReactElement;
  titleComponent?: ReactElement;
  footer?: string | ReactElement;
}

export const ToasterComponent: FC<IToasterProps> = (props) => {
  return (
    <Toast>
      <ToastTitle action={props.titleComponent}>
        <Text font="monospace">{props.title}</Text>
      </ToastTitle>
      <ToastBody>
        {isValidElement(props.body) ? props.body : <Text font="monospace">{props.body}</Text>}
      </ToastBody>
      <ToastFooter>
        {isValidElement(props.footer) ? props.footer : <Text font="monospace">{props.footer}</Text>}
      </ToastFooter>
    </Toast>
  );
};
