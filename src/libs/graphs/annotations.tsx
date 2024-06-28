import { FC, useState } from 'react';
import { Text } from '@fluentui/react-components';
import { Modal, IPlotlyGraphOutput, IPoints, useModal } from '@libs';
import { useTranslation } from 'react-i18next';
import { Annotations } from 'plotly.js';
import { useGraphAnnotationsStyles } from './styles-hook/use-graph-annotations-style';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';
interface IGraphAnnotation {
  plotly: IPlotlyGraphOutput;
}
export const AnnotationModal: FC<IGraphAnnotation> = ({ plotly }) => {
  const [text, setText] = useState<string>('');
  const { t } = useTranslation('common');
  const modal = useModal({ initialOpen: false });
  const classes = useGraphAnnotationsStyles();
  return (
    <Modal
      {...modal}
      open={!!Object.keys(plotly?.points as IPoints).length}
      modalType="alert"
      size="small"
      title={t('annotations')}
      okLabel={t('apply')}
      cancelLabel={t('close')}
      ok={{
        onClick: () => {
          plotly.setAnnotations({
            x: plotly.points?.x as number,
            y: plotly.points?.y as number,
            text: text
              .replace(/<p>/g, '<span>')
              .replace(/<\/p>/g, '</span>')
              .replace(/<strong>/g, '<b>')
              .replace(/<\/strong>/g, '</b>'),
          } as Annotations);
          plotly.resetPoints();
        },
      }}
      cancel={{
        onClick: () => {
          plotly.resetPoints();
        },
      }}
    >
      <ReactQuill
        className={classes.annotations}
        theme="snow"
        value={text}
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline', 'strike', 'link'],
            [{ script: 'sub' }, { script: 'super' }],
            ['code', 'clean'],
          ],
        }}
        onChange={setText}
      />
      <Text>{`${t('points')}: X[${plotly.points?.x}] || Y[${plotly.points?.y}] ${
        plotly.points?.z ? `|| Z[${plotly.points?.z}]` : ''
      }`}</Text>
    </Modal>
  );
};
