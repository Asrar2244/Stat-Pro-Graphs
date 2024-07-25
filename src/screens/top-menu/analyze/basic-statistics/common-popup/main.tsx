import { FC, useState } from 'react';
import { Fieldset } from '@libs';
import { useActiveNode } from '@hooks';
import List from 'react-virtualized/dist/es/List';
import { useTranslation } from 'react-i18next';
import { useMainStyles } from './styles-hook/use-column';
import { Button, Checkbox, Divider, Input, Tooltip } from '@fluentui/react-components';
import { SquareLineSkeleton } from '@libs/skeletons';
import { useColumnsRowsCount } from '../../../../table-render/use-column-count';
import { useBasicStatistics, IBasicTypes } from '../use-basic-statistics';
import { IoMdCheckmark, IoMdClose } from 'react-icons/io';

const AvailableAndSelectedList: FC = () => {
  const { t } = useTranslation(['basicStatistics']);
  const classes = useMainStyles();
  const { config } = useActiveNode([]);
  const { columns } = useColumnsRowsCount({
    ...config,
    noRowCount: true,
  });
  const { mainSelectedList, setMain } = useBasicStatistics();
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const onSelectedListChangeHandler = (_event: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = _event.target.checked;
    const { name } = _event.target;
    if (!isSelected) {
      if (checked) {
        mainSelectedList.push(name);
      } else {
        mainSelectedList.splice(mainSelectedList.indexOf(name), 1);
      }
    } else {
      if (checked) {
        mainSelectedList.splice(mainSelectedList.indexOf(name), 1);
      } else {
        mainSelectedList.push(name);
      }
    }
  };

  const onApplyHandler = (): void => {
    setMain('mainSelectedList', mainSelectedList);
  };
  const onClickSelected = (): void => {
    setIsSelected(!isSelected);
  };
  const rowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    // isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
  }: any): JSX.Element => {
    const row = mainSelectedList.find((f: string) => f === columns[index]['columnId']);
    const checked = row ? { disabled: true, checked: true } : {};
    return (
      <div key={key} style={style}>
        {isScrolling ? (
          <SquareLineSkeleton />
        ) : (
          <>
            <div className={classes.item}>
              <Checkbox
                disabled={!!row}
                name={columns[index]['columnId']}
                label={columns[index]['columnId']}
                onChange={onSelectedListChangeHandler}
                {...checked}
              />
            </div>
            <Divider />
          </>
        )}
      </div>
    );
  };

  const rowSelectedRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    // isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
  }: any): JSX.Element => {
    return (
      <div key={key} style={style}>
        {isScrolling ? (
          <SquareLineSkeleton />
        ) : (
          <>
            <div className={classes.item}>
              <Checkbox
                name={mainSelectedList[index]}
                label={mainSelectedList[index]}
                onChange={onSelectedListChangeHandler}
              />
            </div>
            <Divider />
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={classes.selector}>
        <div className={!isSelected ? 'selected' : ''} onClick={onClickSelected}>
          <span>Available</span>
        </div>
        <div className={isSelected ? 'selected' : ''} onClick={onClickSelected}>
          <span>Selected</span>
        </div>
      </div>
      <Fieldset title={t('availableVariables')}>
        <div className={classes.list}>
          <List
            width={300}
            height={300}
            rowCount={!isSelected ? columns.length : mainSelectedList.length}
            rowHeight={40}
            rowRenderer={!isSelected ? rowRenderer : rowSelectedRenderer}
          />
        </div>
        <div className={!isSelected ? classes.applyButton : classes.removeButton}>
          <Tooltip relationship="label" withArrow content={!isSelected ? t('add') : t('remove')}>
            <Button
              icon={!isSelected ? <IoMdCheckmark /> : <IoMdClose />}
              size="large"
              onClick={onApplyHandler}
            />
          </Tooltip>
        </div>
      </Fieldset>
    </>
  );
};

export const Main: React.FC = () => {
  const { setMain, mainOptions, mainTermedMean, mainWeightedMean } = useBasicStatistics();
  const { t } = useTranslation(['basicStatistics']);
  const classes = useMainStyles();
  const onChangeSelection = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { checked, name } = event.target;
    const dataType: IBasicTypes = event.target.getAttribute('data-type') as IBasicTypes;
    setMain(dataType, { [name]: checked });
  };
  const onBlurText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value, name } = event.target;
    const dataType: IBasicTypes = event.target.getAttribute('data-type') as IBasicTypes;
    setMain(dataType, { [name]: value });
  };
  return (
    <div className={classes.mainLayout}>
      <div className={classes.availability}>
        <AvailableAndSelectedList />

        <Fieldset title={t('options')} className={classes.optionsGroup}>
          <Checkbox name="allOptions" label={t('allOptions')} />
          <div className={classes.options}>
            <Checkbox
              data-type="mainOptions"
              name="n"
              label={t('n')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="median"
              label={t('median')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="range"
              label={t('range')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="minimum"
              label={t('minimum')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="mode"
              label={t('mode')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="integuartileRange"
              label={t('integuartileRange')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="maximum"
              label={t('maximum')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="geometricMean"
              label={t('geometricMean')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="skeewness"
              label={t('skeewness')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="sum"
              label={t('sum')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="harmonicMean"
              label={t('harmonicMean')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="seOfSkewness"
              label={t('seOfSkewness')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="arithmeticMean"
              label={t('arithmeticMean')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="sd"
              label={t('sd')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="kurtosis"
              label={t('kurtosis')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="seOfAm"
              label={t('seOfAm')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="cv"
              label={t('cv')}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="seOfKutosis"
              label={t('seOfKutosis')}
              onChange={onChangeSelection}
            />
            <div className={classes.ciOfAm}>
              <Checkbox
                data-type="mainOptions"
                name="ciOfAm"
                label={t('ciOfAm')}
                onChange={onChangeSelection}
              />
              <Input
                data-type="mainOptions"
                defaultValue={`${mainOptions?.ciOfAmValue}`}
                name="ciOfAmValue"
                disabled={!mainOptions?.ciOfAm}
                onBlur={onBlurText}
              />
            </div>
            <Checkbox
              data-type="mainOptions"
              name="variance"
              label={t('variance')}
              onChange={onChangeSelection}
            />
          </div>
        </Fieldset>
      </div>
      <div className={classes.meanGroup}>
        <Fieldset
          title={
            (
              <Checkbox
                label={t('trimmedMean')}
                name="selectAllTrimMean"
                data-type="mainTermedMean"
                onChange={onChangeSelection}
              />
            ) as any
          }
        >
          <Fieldset className={classes.frame} disabled={!mainTermedMean.selectAllTrimMean}>
            <div className={classes.meanTypes}>
              <div className={classes.meanItem}>
                <Input
                  name="twoTrimMeanSided"
                  data-type="mainTermedMean"
                  onBlur={onBlurText}
                  defaultValue={t('twoSided')}
                />
                <Input
                  name="twoTrimMeanSidedValue"
                  data-type="mainTermedMean"
                  onBlur={onBlurText}
                  defaultValue={`${mainTermedMean.twoTrimMeanSidedValue}`}
                />
              </div>
              <Checkbox
                name="seOfTM"
                label={t('seOfTM')}
                data-type="mainTermedMean"
                onChange={onChangeSelection}
              />
              <div className={classes.meanItem}>
                <Checkbox
                  name="ciOfTM"
                  label={t('ciOfTM')}
                  data-type="mainTermedMean"
                  onChange={onChangeSelection}
                />
                <Input
                  name="ciOfTMValue"
                  data-type="mainTermedMean"
                  defaultValue={`${mainTermedMean.ciOfTMValue}`}
                  onBlur={onBlurText}
                />
              </div>
            </div>
          </Fieldset>
        </Fieldset>
        <Fieldset
          title={
            (
              <Checkbox
                label={t('winsorizedMean')}
                data-type="mainWeightedMean"
                name="selectAllWinsorizedMean"
                onChange={onChangeSelection}
              />
            ) as any
          }
        >
          <Fieldset className={classes.frame} disabled={!mainWeightedMean.selectAllWinsorizedMean}>
            <div className={classes.meanTypes}>
              <div className={classes.meanItem}>
                <Input
                  name="twoWinsorizedMeanSided"
                  defaultValue={`${mainWeightedMean.twoWinsorizedMeanSided}`}
                  data-type="mainWeightedMean"
                  onBlur={onBlurText}
                />
                <Input
                  name="twoWinsorizedMeanSidedValue"
                  defaultValue={`${mainWeightedMean.twoWinsorizedMeanSidedValue}`}
                  data-type="mainWeightedMean"
                  onBlur={onBlurText}
                />
              </div>
              <Checkbox
                name="seOfWM"
                label={t('seOfWM')}
                data-type="mainWeightedMean"
                onChange={onChangeSelection}
              />
              <div className={classes.meanItem}>
                <Checkbox
                  name="ciOfWM"
                  label={t('ciOfWM')}
                  data-type="mainWeightedMean"
                  onChange={onChangeSelection}
                />
                <Input
                  name="ciOfWMValue"
                  data-type="mainWeightedMean"
                  defaultValue={`${mainWeightedMean.ciOfWMValue}`}
                  onBlur={onBlurText}
                />
              </div>
            </div>
          </Fieldset>
        </Fieldset>
      </div>
    </div>
  );
};
