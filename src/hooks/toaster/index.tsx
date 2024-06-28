import { useToastController } from '@fluentui/react-components';
import { IToasterProps, ToasterComponent } from '@libs';
import { useTranslation } from 'react-i18next';
declare interface ToastOptions<TData = object> {
  /**
   * The position the toast should render to
   */
  position: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start' | 'top' | 'bottom';
  /**
   * Toast content
   */
  content: unknown;
  /**
   * Auto dismiss timeout in milliseconds
   * @default 3000
   */
  timeout: number;
  /**
   * Toast timeout pauses while focus is on another window
   * @default false
   */
  pauseOnWindowBlur: boolean;
  /**
   * Toast timeout pauses while user cursor is on the toast
   * @default false
   */
  pauseOnHover: boolean;

  /**
   * Higher priority toasts will be rendered before lower priority toasts
   */
  priority: number;
  /**
   * Used to determine [aria-live](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) narration
   * This will override the intent prop
   */
  politeness?: 'assertive' | 'polite';
  /**
   * Default toast types that determine the urgency or [aria-live](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) narration
   * The UI layer may use these intents to apply specific styling.
   * @default info
   */
  intent?: 'info' | 'error' | 'success' | 'warning';
  /**
   * Additional data that needs to be passed to the toast
   */
  data: TData;
}
interface DispatchToastOptions extends Partial<Omit<ToastOptions, 'toasterId'>> {}
interface IToaster {
  success: (props: IToasterProps, options?: DispatchToastOptions) => void;
  info: (props: IToasterProps, options?: DispatchToastOptions) => void;
  error: (props: IToasterProps, options?: DispatchToastOptions) => void;
  warn: (props: IToasterProps, options?: DispatchToastOptions) => void;
}

export const useToaster = (): IToaster => {
  const { dispatchToast } = useToastController();
  const { t } = useTranslation('errors');
  const dispatcherToaster = (props: IToasterProps, options: DispatchToastOptions): void =>
    dispatchToast(<ToasterComponent {...props} />, options);
  return {
    success: (props: IToasterProps, options?: DispatchToastOptions) =>
      dispatcherToaster({ title: t('success'), ...props }, { ...options, intent: 'success' }),
    info: (props: IToasterProps, options?: DispatchToastOptions) =>
      dispatcherToaster({ title: t('info'), ...props }, { ...options, intent: 'info' }),
    error: (props: IToasterProps, options?: DispatchToastOptions) =>
      dispatcherToaster({ title: t('error'), ...props }, { ...options, intent: 'error' }),
    warn: (props: IToasterProps, options?: DispatchToastOptions) =>
      dispatcherToaster({ title: t('warn'), ...props }, { ...options, intent: 'warning' }),
  };
};
