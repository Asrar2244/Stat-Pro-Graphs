import { FC } from 'react';
import { useEstimateModelStyles } from '../styles-hook/use-model-hook';
import { Button, Tooltip } from '@fluentui/react-components';
import { Fieldset, CheckListRender } from '@libs';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { useEstimateModel } from '../use-estimation-store';
import { useColumnsRowsCount, useActiveNode } from '@hooks';
import { MdDeleteOutline } from 'react-icons/md';

import { FaRegCopyright } from 'react-icons/fa';
import { RiFacebookCircleLine } from 'react-icons/ri';
import { SiDevpost } from 'react-icons/si';
import { useEstimateModelPrepare } from './use-prepare-columns';
export const EstimationOfModuleModel: FC = () => {
  const { t } = useTranslation(['estimationOfModules']);
  const classes = useEstimateModelStyles();
  const { config } = useActiveNode([]);

  const { columns } = useColumnsRowsCount({
    ...config,
    noRowCount: true,
  });
  useEstimateModelPrepare({ columns });
  const { setModel, model } = useEstimateModel(
    useShallow((state) => {
      const { setModel, model } = state;
      return { setModel, model };
    }),
  );
  const onClickAddToDependencies = (): void => {
    if (setModel) {
      Object.keys(model.availableList).forEach((key: string) => {
        if (model.availableList[key]) {
          delete model.availableList[key];
          setModel({
            dependentList: { ...model.dependentList, [key]: true },
            availableList: { ...model.availableList },
          });
        }
      });
    }
  };

  const onClickRemoveFromDependencies = (): void => {
    if (setModel) {
      Object.keys(model.dependentList).forEach((key: string) => {
        if (model.dependentList[key]) {
          delete model.dependentList[key];
          setModel({
            dependentList: { ...model.dependentList },
            availableList: { ...model.availableList, [key]: false },
          });
        }
      });
    }
  };
  const onClickRemoveFromFactor = (): void => {
    if (setModel) {
      Object.keys(model.factorList).forEach((key: string) => {
        if (model.factorList[key]) {
          delete model.factorList[key];
          setModel({
            factorList: { ...model.factorList },
            availableList: { ...model.availableList, [key]: false },
          });
        }
      });
    }
  };

  const onClickRemoveFromCovariate = (): void => {
    if (setModel) {
      Object.keys(model.covariateList).forEach((key: string) => {
        if (model.covariateList[key]) {
          delete model.covariateList[key];
          setModel({
            covariateList: { ...model.covariateList },
            availableList: { ...model.availableList, [key]: false },
          });
        }
      });
    }
  };
  const onClickAddToFactor = (): void => {
    if (setModel) {
      Object.keys(model.availableList).forEach((key: string) => {
        if (model.availableList[key]) {
          setModel({
            factorList: { ...model.factorList, [key]: false },
            availableList: { ...model.availableList },
          });
        }
      });
    }
  };
  const onClickAddToCovariate = (): void => {
    if (setModel) {
      Object.keys(model.availableList).forEach((key: string) => {
        if (model.availableList[key]) {
          setModel({
            covariateList: { ...model.covariateList, [key]: false },
            availableList: { ...model.availableList },
          });
        }
      });
    }
  };
  return (
    <div className={classes.modelLayout}>
      <div className={classes.modelWrapper}>
        <Fieldset title={t('available')}>
          <div className="section-available">
            <CheckListRender
              className="available-list"
              list={model.availableList}
              selected={undefined}
            />
            <div className={classes.buttonsFlex}>
              <Tooltip content={t('dependent')} relationship="label" withArrow>
                <Button
                  icon={<SiDevpost size={42} />}
                  name="dependent"
                  onClick={onClickAddToDependencies}
                />
              </Tooltip>
              <Tooltip content={t('factor')} relationship="label" withArrow>
                <Button
                  icon={<RiFacebookCircleLine />}
                  name="factor"
                  onClick={onClickAddToFactor}
                />
              </Tooltip>
              <Tooltip content={t('covariate')} relationship="label" withArrow>
                <Button
                  icon={<FaRegCopyright />}
                  name="covariate"
                  disabled
                  onClick={onClickAddToCovariate}
                />
              </Tooltip>
            </div>
          </div>
        </Fieldset>
        <Fieldset title={t('dependent')}>
          <div className="section-available">
            <CheckListRender
              className="available-list"
              list={model.dependentList}
              selected={undefined}
            />
            <div className={classes.buttonsFlex}>
              <Tooltip content={t('delete')} relationship="label" withArrow>
                <Button
                  icon={<MdDeleteOutline />}
                  className={classes.removeButtons}
                  name="dependent-delete"
                  onClick={onClickRemoveFromDependencies}
                />
              </Tooltip>
            </div>
          </div>
        </Fieldset>
        <Fieldset title={t('factor')}>
          <div className="section-available">
            <CheckListRender
              className="available-list"
              list={model.factorList}
              selected={undefined}
            />
            <div className={classes.buttonsFlex}>
              <Tooltip content={t('delete')} relationship="label" withArrow>
                <Button
                  icon={<MdDeleteOutline />}
                  className={classes.removeButtons}
                  name="factor-delete"
                  onClick={onClickRemoveFromFactor}
                />
              </Tooltip>
            </div>
          </div>
        </Fieldset>
        <Fieldset title={t('covariate')}>
          <div className="section-available">
            <CheckListRender
              className="available-list"
              list={model.covariateList}
              selected={undefined}
            />
            <div className={classes.buttonsFlex}>
              <Tooltip content={t('delete')} relationship="label" withArrow>
                <Button
                  icon={<MdDeleteOutline />}
                  className={classes.removeButtons}
                  name="covariate-delete"
                  onClick={onClickRemoveFromCovariate}
                />
              </Tooltip>
            </div>
          </div>
        </Fieldset>
      </div>
    </div>
  );
};
