import { CSSProperties } from 'react';

type RenderRawBackendOutputOptions = {
  containerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  preClassName?: string;
  footerClassName?: string;
  containerStyle?: CSSProperties;
  title?: string;
  description?: string;
  footer?: string;
  descriptionStyle?: CSSProperties;
  preStyle?: CSSProperties;
  footerStyle?: CSSProperties;
  useDefaultStyles?: boolean;
};

export const renderRawBackendOutput = (
  result: string,
  {
    containerClassName,
    titleClassName,
    descriptionClassName,
    preClassName,
    footerClassName,
    containerStyle,
    title = 'Backend Output (Raw String)',
    description = 'The backend did not return a structured result. Only the raw output string is available:',
    footer = 'To see full tables and statistics, please ask your backend developer to return a JSON object as described in the documentation.',
    descriptionStyle,
    preStyle,
    footerStyle,
    useDefaultStyles = true,
  }: RenderRawBackendOutputOptions = {}
): JSX.Element => {
  const defaultContainerStyle: CSSProperties = {
    padding: 24,
    color: '#b71c1c',
    background: '#fff3e0',
    borderRadius: 8,
  };

  const defaultDescriptionStyle: CSSProperties = {
    fontWeight: 'bold',
    marginBottom: 8,
  };

  const defaultPreStyle: CSSProperties = {
    fontSize: 18,
    color: '#263238',
    background: '#eceff1',
    padding: 16,
    borderRadius: 4,
  };

  const defaultFooterStyle: CSSProperties = {
    marginTop: 16,
    color: '#b71c1c',
  };

  const computedContainerStyle = useDefaultStyles
    ? { ...defaultContainerStyle, ...(containerStyle ?? {}) }
    : containerStyle;

  const computedDescriptionStyle = useDefaultStyles
    ? { ...defaultDescriptionStyle, ...(descriptionStyle ?? {}) }
    : descriptionStyle;

  const computedPreStyle = useDefaultStyles
    ? { ...defaultPreStyle, ...(preStyle ?? {}) }
    : preStyle;

  const computedFooterStyle = useDefaultStyles
    ? { ...defaultFooterStyle, ...(footerStyle ?? {}) }
    : footerStyle;

  return (
    <div className={containerClassName} style={computedContainerStyle}>
      <h2 className={titleClassName}>{title}</h2>
      {description && (
        <p className={descriptionClassName} style={computedDescriptionStyle}>
          {description}
        </p>
      )}
      <pre className={preClassName} style={computedPreStyle}>
        {result}
      </pre>
      {footer && (
        <p className={footerClassName} style={computedFooterStyle}>
          {footer}
        </p>
      )}
    </div>
  );
};

