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
  const onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { checked } = event.target;
    const selectedObj: any = {};
    [
      'isN',
      'isMedian',
      'isRange',
      'isMin',
      'isInterquartileRange',
      'isMax',
      'isGeoMean',
      'isSkewness',
      'isSum',
      'isHarmonicMean',
      'isSEofSkewness',
      'isArithMean',
      'isSD',
      'isKurtosis',
      'isSEofAM',
      'isCV',
      'isSEofKurtosis',
      'ciOfAMChecked',
      'isShaprioWilk',
      'isAndersonDarling',
      'isMardiaSkewness',
      'isMardiaKurtosis',
      'isHenzeZirkler',
      'isMode',
      'isVariance',
    ].forEach((key) => {
      selectedObj[key] = checked;
    });
    setMain('mainOptions', selectedObj);
  };
  return (
    <div className={classes.mainLayout}>
      <div className={classes.availability}>
        <AvailableAndSelectedList />

        <Fieldset
          title={
            (
              <Checkbox name="allOptions" label={t('allOptions')} onChange={onChangeCheckbox} />
            ) as any
          }
          className={classes.optionsGroup}
        >
          <div className={classes.options}>
            <Checkbox
              data-type="mainOptions"
              name="isN"
              label={t('n')}
              checked={mainOptions?.isN as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isMedian"
              label={t('median')}
              checked={mainOptions?.isMedian as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isRange"
              label={t('range')}
              checked={mainOptions?.isRange as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isMin"
              label={t('minimum')}
              checked={mainOptions?.isMin as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isMode"
              label={t('mode')}
              checked={mainOptions?.isMode as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isInterquartileRange"
              label={t('integuartileRange')}
              checked={mainOptions?.isInterquartileRange as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isMax"
              label={t('maximum')}
              checked={mainOptions?.isMax as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isGeoMean"
              label={t('geometricMean')}
              checked={mainOptions?.isGeoMean as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isSkewness"
              label={t('skeewness')}
              checked={mainOptions?.isSkewness as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isSum"
              label={t('sum')}
              checked={mainOptions?.isSum as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isHarmonicMean"
              label={t('harmonicMean')}
              checked={mainOptions?.isHarmonicMean as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isSEofSkewness"
              label={t('seOfSkewness')}
              checked={mainOptions?.isSEofSkewness as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isArithMean"
              label={t('arithmeticMean')}
              checked={mainOptions?.isArithMean as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isSD"
              label={t('sd')}
              checked={mainOptions?.isSD as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isKurtosis"
              label={t('kurtosis')}
              checked={mainOptions?.isKurtosis as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isSEofAM"
              label={t('seOfAm')}
              checked={mainOptions?.isSEofAM as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isCV"
              label={t('cv')}
              checked={mainOptions?.isCV as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isSEofKurtosis"
              label={t('seOfKutosis')}
              checked={mainOptions?.isSEofKurtosis as boolean}
              onChange={onChangeSelection}
            />
            <div className={classes.ciOfAm}>
              <Checkbox
                data-type="mainOptions"
                name="ciOfAMChecked"
                label={t('ciOfAm')}
                checked={mainOptions?.ciOfAMChecked as boolean}
                onChange={onChangeSelection}
              />
              <Input
                data-type="mainOptions"
                defaultValue={`${mainOptions?.CIofAM}`}
                name="CIofAM"
                disabled={!mainOptions?.ciOfAMChecked}
                onBlur={onBlurText}
              />
            </div>
            <Checkbox
              data-type="mainOptions"
              name="isShaprioWilk"
              label={t('shaprioWilk')}
              checked={mainOptions?.isShaprioWilk as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isAndersonDarling"
              label={t('andersonDarling')}
              checked={mainOptions?.isAndersonDarling as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isMardiaSkewness"
              label={t('mardiaSkewness')}
              checked={mainOptions?.isMardiaSkewness as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isMardiaKurtosis"
              label={t('mardiaKurtosis')}
              checked={mainOptions?.isMardiaKurtosis as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isHenzeZirkler"
              label={t('henzeZirkler')}
              checked={mainOptions?.isHenzeZirkler as boolean}
              onChange={onChangeSelection}
            />
            <Checkbox
              data-type="mainOptions"
              name="isVariance"
              label={t('variance')}
              checked={mainOptions?.isVariance as boolean}
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
                  type='number'
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
                  type='number'
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
                  type='number'
                />
                <Input
                  name="twoWinsorizedMeanSidedValue"
                  defaultValue={`${mainWeightedMean.twoWinsorizedMeanSidedValue}`}
                  data-type="mainWeightedMean"
                  onBlur={onBlurText}
                  type='number'
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
                  type='number'
                />
              </div>
            </div>
          </Fieldset>
        </Fieldset>
      </div>
    </div>
  );
};
