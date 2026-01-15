import { FC, useEffect, useState } from 'react';
import { Modal } from '@libs';
import { Select } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { useGraphOptionStyles } from './styles-hook/use-graph-options-style';
import { PlotType, PlotData } from 'plotly.js';
import { restyle } from 'plotly.js-dist';
import { IModal } from '@hooks';
type IModes = Pick<PlotData, 'mode'>;
interface IGraphOptions extends IModal {
  plotly: any;
}
interface IGraphProps {
  type?: PlotType;
  mode: IModes | any;
  name?: string;
  color?: string;
}

export const GraphOptions: FC<IGraphOptions> = ({ plotly, ...props }) => {
  const [nodeProps, setNodeProps] = useState<IGraphProps[]>([]);
  const classes = useGraphOptionStyles();
  const { t } = useTranslation('common');

  useEffect(() => {
    const _nodeProps: IGraphProps[] = [];

    for (let i = 0; i < plotly.current._fullData.length; i++) {
      const data: any = plotly.current._fullData[i];
      _nodeProps.push({
        type: data.type,
        mode: data?.mode,
        name: data.name,
        color: data?.color || data?.line?.color || data?.marker?.color || 'default',
      });
    }
    setNodeProps(_nodeProps);
  }, []);

  const onSelectChanges =
    (item: any) =>
      (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>): void => {
        const { name, value } = event.target;
        item[name] = value;
        setNodeProps([...nodeProps]);
      };

  const onApplyChanges = (): void => {
    const gd = plotly.current;
    if (!gd) return;

    // Update each trace individually for better control
    nodeProps.forEach((nodeProp, index) => {
      const update: any = {
        'marker.color': nodeProp.color,
        'line.color': nodeProp.color,
        color: nodeProp.color,
        fillcolor: nodeProp.color, // For confidence interval fill
        'error_y.color': nodeProp.color,
        'error_x.color': nodeProp.color,
        type: nodeProp.type,
        mode: nodeProp.mode,
        name: nodeProp.name,
      };

      restyle(gd, update, [index]);
    });

    props.closeModal();
  };

  return (
    <Modal
      modalType="modal"
      size="medium"
      {...props}
      title={t('graphOptions')}
      ok={{
        onClick: onApplyChanges,
      }}
      okLabel={t('apply')}
      cancelLabel={t('close')}
    >
      <div className={classes.container}>
        <div className={classes.graphOptions}>
          <table>
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('type')}</th>
                <th>{t('mode')}</th>
                <th>{t('color')}</th>
              </tr>
            </thead>
            <tbody>
              {nodeProps.map((node) => (
                <tr key={node.name}>
                  <td>{node.name}</td>
                  <td>
                    <Select
                      name="type"
                      id="type"
                      appearance="underline"
                      defaultValue={node.type}
                      onChange={onSelectChanges(node)}
                    >
                      {['scatter', 'bar', 'histogram', 'scatter3d', 'mesh3d'].map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td>
                    <Select
                      name="mode"
                      defaultValue={`${node.mode}`}
                      onChange={onSelectChanges(node)}
                      appearance="underline"
                    >
                      {['lines', 'markers', 'lines+markers', 'none'].map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td>
                    <input
                      type="color"
                      name="color"
                      defaultValue={node.color}
                      onChange={onSelectChanges(node)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
