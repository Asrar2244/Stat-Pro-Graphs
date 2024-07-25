import { FC, FieldsetHTMLAttributes, isValidElement } from 'react';
import { Caption1Strong, mergeClasses } from '@fluentui/react-components';

import { useFieldSetStyles } from './styles-hook/use-fieldset-style';

export const Fieldset: FC<
  FieldsetHTMLAttributes<HTMLFieldSetElement> & {
    title?: string | React.ReactElement;
  }
> = ({ title, children, className, ...props }) => {
  const classes = useFieldSetStyles();
  const mergedClass = mergeClasses(classes.fieldsetLayout, className);
  return (
    <fieldset className={mergedClass} {...props}>
      {isValidElement(title) ? (
        <div className={classes.elementFields}>{title}</div>
      ) : (
        <Caption1Strong className={classes.labelFields}>{title}</Caption1Strong>
      )}

      {children}
    </fieldset>
  );
};
