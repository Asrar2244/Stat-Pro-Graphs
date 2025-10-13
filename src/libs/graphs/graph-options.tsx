import { FC, useEffect, useState } from 'react';
import { Modal } from '@libs';
import { Select } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { useGraphOptionStyles } from './styles-hook/use-graph-options-style';
import { PlotType, PlotData } from 'plotly.js';
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
        color: data?.marker?.color || 'default',
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
    // if (graph) {
    //   const completeData: Data[] = [];
    //   for (let i = 0; i < nodeProps.length; i++) {
    //     const { color, type, mode, name } = nodeProps[i];
    //     const colors = color === 'default' ? {} : { marker: { color } };
    //     completeData.push({
    //       ... plotly.current.data[i],
    //       ...colors,
    //       type,
    //       mode,
    //       name,
    //     });
    //   }
    //   plotly.redraw({ data: completeData });
    //   props.closeModal();
    // }
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
                      {/* {plotly.editedConfig?.graphs?.map((graph) => (
                        <option key={graph} value={graph}>
                          {graph}
                        </option>
                      ))} */}
                    </Select>
                  </td>
                  <td>
                    <Select
                      name="mode"
                      defaultValue={`${node.mode}`}
                      onChange={onSelectChanges(node)}
                      appearance="underline"
                    >
                      {/* {plotly.editedConfig?.modes?.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))} */}
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
