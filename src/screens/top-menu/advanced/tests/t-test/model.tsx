import { ChangeEvent, FC, useEffect, useState, FormEvent } from 'react';
import { Field, Dropdown, Option, OptionOnSelectData, SelectionEvents, Input, Tab, TabList, SelectTabData, SelectTabEvent, Checkbox, Radio, RadioGroup, tokens, Button, RadioGroupOnChangeData } from "@fluentui/react-components";
import { MdKeyboardDoubleArrowRight, MdOutlineRemove } from 'react-icons/md';
import { useTranslation } from "react-i18next";
import { Fieldset } from "@libs/fieldset";
import { useCommonStyles } from "./styles-hook/use-test-styles";
import { IColumn, useColumnsRowsCount } from "@hooks/columns-row-count";
import { useTTestsStats } from "./use-t-tests";
import { useActiveNode } from "@hooks/layout-nodes";
import { useShallow } from 'zustand/react/shallow';
import { useTestsStats } from '../options/use-tests-config';
import { ListCheckboxWithSelectAll } from '@libs';
import { generateKey } from '@utils/helper';
import { useStartProStore } from '@store/main-store';

export const Model: FC = () => {
  const classes = useCommonStyles();
  const { t } = useTranslation(['T_TestsAnalysys', 'common', 'optionsComponent']);
  const { config } = useActiveNode([]);
  const { columns } = useColumnsRowsCount({
    ...config,
    noRowCount: true,
  });
  const [selectedTab, setSelectedTab] = useState<string>('assumptionChecking');

  const onTabSelectHandler = (_event: SelectTabEvent, { value }: SelectTabData): void => {
    setSelectedTab(value as string);
  };

  return (
    <div className={classes.commonWrapper} style={{ paddingTop: tokens.spacingVerticalM }}>
      <DataFormatSelection columns={columns} />
      <PopulationMeanInput />
      <div style={{ marginTop: tokens.spacingVerticalL }}>
        <TabList
          selectedValue={selectedTab}
          appearance="subtle"
          onTabSelect={onTabSelectHandler}
        >
          <Tab value="assumptionChecking">{t('assumptionChecking', { ns: 'optionsComponent' })}</Tab>
          <Tab value="results">{t('results', { ns: 'optionsComponent' })}</Tab>
          <Tab value="postHocTest">{t('postHocTest', { ns: 'optionsComponent' })}</Tab>
        </TabList>
        <div className="details" style={{ marginTop: tokens.spacingVerticalM }}>
          {selectedTab === 'assumptionChecking' && <AssumptionChecking />}
          {selectedTab === 'results' && <Results />}
          {selectedTab === 'postHocTest' && <PostHocTest />}
        </div>
      </div>
    </div>
  );
};

const DataFormatSelection: FC<{ columns: IColumn[] }> = ({ columns }) => {
  const classes = useCommonStyles();
  const { t } = useTranslation(['T_TestsAnalysys', 'common']);
  const { model: { dataFormat, populationMean }, setModelBulk, setModel } = useTTestsStats(
    useShallow((state) => ({
      model: state.model,
      setModelBulk: state.setModelBulk,
      setModel: state.setModel,
    }))
  );

  // Initialize availableList and dataList from columns
  useEffect(() => {
    if (!columns || columns.length === 0) return;

    const columnMap = new Map<string, boolean>();
    let dataListMap = new Map<string, boolean>();

    // Initialize dataList from existing data (backward compatibility with sample array)
    if (dataFormat.sample && dataFormat.sample.length > 0 && (!dataFormat.dataList || dataFormat.dataList.size === 0)) {
      dataFormat.sample.forEach((colId) => {
        dataListMap.set(colId, false);
      });
    } else if (dataFormat.dataList && dataFormat.dataList.size > 0) {
      dataListMap = new Map(dataFormat.dataList);
    }

    // Initialize availableList with ALL columns (including those in dataList)
    columns.forEach((column) => {
      columnMap.set(column.columnId, false);
    });

    // Only update if there are changes
    const currentAvailableSize = dataFormat.availableList?.size || 0;
    const currentDataSize = dataListMap.size;
    const newAvailableSize = columnMap.size;

    if (currentAvailableSize !== newAvailableSize || currentDataSize !== dataListMap.size) {
      setModel({
        dataFormat: {
          ...dataFormat,
          availableList: columnMap,
          dataList: dataListMap,
        },
        populationMean
      });
    }
  }, [columns.length]);

  // Determine initial format based on store data
  const getInitialFormat = () => {
    if ((dataFormat.dataList && dataFormat.dataList.size > 0) || (dataFormat.sample && dataFormat.sample.length > 0)) return "raw";
    if (dataFormat.values?.deviation) return "MSSD";
    if (dataFormat.values?.standard_error) return "MSSE";
    return "raw";
  };

  const [selectedDataFormat, setSelectedDataFormat] = useState(getInitialFormat());
  const [selectedMean, setSelectedMean] = useState<string>(dataFormat.values?.mean || "");
  const [selectedSize, setSelectedSize] = useState<string>(dataFormat.values?.size || "");
  const [selectedStd, setSelectedStd] = useState<string>(
    dataFormat.values?.deviation || dataFormat.values?.standard_error || ""
  );

  const formatOptions = [
    { columnId: 'raw', label: "Raw" },
    { columnId: 'MSSD', label: "Mean, Size, Standard Deviation" },
    { columnId: 'MSSE', label: "Mean, Size, Standard Error" }
  ];

  const onFormatSelect = (_e: SelectionEvents, data: OptionOnSelectData) => {
    setSelectedDataFormat(data.selectedOptions[0]);
    setSelectedMean("");
    setSelectedSize("");
    setSelectedStd("");
    // Clear dataList when switching format
    if (data.selectedOptions[0] !== 'raw') {
      const newDataList = new Map<string, boolean>();
      setModel({
        dataFormat: {
          ...dataFormat,
          dataList: newDataList,
          sample: [],
        },
        populationMean
      });
    }
  };

  const onMeanChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedMean(val);
    setModelBulk({ ...dataFormat, sample: [""], values: { ...dataFormat.values, mean: val } }, "dataFormat");
  };

  const onSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedSize(val);
    setModelBulk({ ...dataFormat, sample: [""], values: { ...dataFormat.values, size: val } }, "dataFormat");
  };

  const onStdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedStd(val);
    const colName = selectedDataFormat === "MSSD" ? "deviation" : "standard_error";
    setModelBulk({ ...dataFormat, sample: [""], values: { ...dataFormat.values, [colName]: val } }, "dataFormat");
  };



  return (
    <Fieldset title={t("dataFormat")}>
      <div className={classes.dataformatWrapper}>
        <div className={classes.checkboxWrapper}>
          <span>{t("dataFormat")}</span>
          <Field>
            <Dropdown
              size="small"
              onOptionSelect={onFormatSelect}
              value={formatOptions.find(opt => opt.columnId === selectedDataFormat)?.label || "Raw"}
              selectedOptions={[selectedDataFormat]}
            >
              {formatOptions.map((option) => (
                <Option key={option.columnId} value={option.columnId}>{option.label}</Option>
              ))}
            </Dropdown>
          </Field>
        </div>

        {selectedDataFormat === 'raw' ? (
          <div className={classes.dataSelectionWrapper}>
            <Fieldset title={t("availableVar", { ns: 'regLinearLeastSquare' })}>
              <AvailableListRender columns={columns} />
            </Fieldset>
            <Fieldset title={t("selectedColumn")}>
              <DataListRender />
            </Fieldset>
          </div>
        ) : (
          <div className={classes.dataWrapper}>
            <Fieldset title="" className={classes.selectedData}>
              <div className={classes.valInput}>
                <p>{t("mean")}</p>
                <p>:</p>
                <Input type="number" value={selectedMean} onChange={onMeanChange} />
              </div>
              <div className={classes.valInput}>
                <p>{t("size")}</p>
                <p>:</p>
                <Input type="number" value={selectedSize} onChange={onSizeChange} />
              </div>
              <div className={classes.valInput}>
                <p>{selectedDataFormat === "MSSD" ? t("stdDev") : t("stdErr")}</p>
                <p>:</p>
                <Input type="number" value={selectedStd} onChange={onStdChange} />
              </div>
            </Fieldset>
          </div>
        )}
      </div>
    </Fieldset>
  );
};

const AvailableListRender: FC<{ columns: IColumn[] }> = () => {
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const { t } = useTranslation(['T_TestsAnalysys', 'regLinearLeastSquare']);
  const { model: { dataFormat, populationMean }, setModelBulk, setModel } = useTTestsStats(
    useShallow((state) => ({
      model: state.model,
      setModelBulk: state.setModelBulk,
      setModel: state.setModel,
    }))
  );
  const { setBlockUI } = useStartProStore();
  const availableList = dataFormat.availableList || new Map<string, boolean>();
  const dataList = dataFormat.dataList || new Map<string, boolean>();
  const [propKey, setPropKey] = useState(generateKey(availableList));

  useEffect(() => {
    setPropKey(generateKey(availableList));
  }, [availableList.size, Array.from(availableList.keys()).join(',')]);

  const onSendHandler = (): void => {
    const selected = Array.from(availableList.entries()).filter(([, v]) => v).map(([k]) => k);

    // Check if more than one variable is selected
    if (selected.length > 1) {
      setBlockUI({ value: true, msg: t('allowOnlyOneRecord', { ns: 'errors', defaultValue: 'Please select exactly one variable.' }) });
      return;
    }

    // Check if dataList already has a variable
    if (dataList.size >= 1 && selected.length > 0) {
      setBlockUI({ value: true, msg: t('allowOnlyOneRecord', { ns: 'errors', defaultValue: 'Please select exactly one variable.' }) });
      return;
    }

    // Add selected items to dataList (should only be one) without removing from availableList
    const newDataList = new Map(dataList);
    selected.forEach((key) => {
      newDataList.set(key, false);
    });

    // Reset checkboxes in availableList but keep all items
    const newAvailableList = new Map(availableList);
    newAvailableList.forEach((_, key) => {
      newAvailableList.set(key, false);
    });

    // Update sample array for backward compatibility
    const sampleArray = Array.from(newDataList.keys());

    setModel({
      dataFormat: {
        ...dataFormat,
        availableList: newAvailableList,
        dataList: newDataList,
        sample: sampleArray,
      },
      populationMean
    });
    setSelectAll(false);
  };

  return (
    <div className="section-available">
      <ListCheckboxWithSelectAll
        listSize={availableList.size}
        list={availableList}
        selectAllText={t('selectAll', { ns: 'regLinearLeastSquare' })}
        selectValue={selectAll}
        requiredSelectAll
        onSelectAllChanged={setSelectAll}
        propKey={propKey}
        setModelBulk={setModelBulk}
        listName='availableList'
      />
      <div className="send-buttons">
        <Button
          icon={<MdKeyboardDoubleArrowRight />}
          iconPosition="after"
          onClick={onSendHandler}
          disabled={dataList.size >= 1}
        >
          {t("data", { ns: 'T_TestsAnalysys' })}
        </Button>
      </div>
    </div>
  );
};

const DataListRender: FC = () => {
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const { t } = useTranslation(['T_TestsAnalysys', 'regLinearLeastSquare']);
  const { model: { dataFormat, populationMean }, setModelBulk, setModel } = useTTestsStats(
    useShallow((state) => ({
      model: state.model,
      setModelBulk: state.setModelBulk,
      setModel: state.setModel,
    }))
  );
  const availableList = dataFormat.availableList || new Map<string, boolean>();
  const dataList = dataFormat.dataList || new Map<string, boolean>();
  const [propKey, setPropKey] = useState(generateKey(dataList));

  useEffect(() => {
    setPropKey(generateKey(dataList));
  }, [dataList.size, Array.from(dataList.keys()).join(',')]);

  const onRemoveHandler = (): void => {
    const newDataList = new Map(dataList);
    const newAvailableList = new Map(availableList);

    dataList.forEach((value: boolean, name: string) => {
      if (value) {
        newAvailableList.set(name, false);
        newDataList.delete(name);
      }
    });

    // Update sample array for backward compatibility
    const sampleArray = Array.from(newDataList.keys());

    setModel({
      dataFormat: {
        ...dataFormat,
        availableList: newAvailableList,
        dataList: newDataList,
        sample: sampleArray,
      },
      populationMean
    });
    if (newDataList.size === 0) setSelectAll(false);
  };

  return (
    <div className="section-available">
      <ListCheckboxWithSelectAll
        listSize={dataList.size}
        list={dataList}
        selectAllText={t('selectAll', { ns: 'regLinearLeastSquare' })}
        selectValue={selectAll}
        requiredSelectAll
        onSelectAllChanged={setSelectAll}
        propKey={propKey}
        setModelBulk={setModelBulk}
        listName='dataList'
      />
      <Button
        icon={<MdOutlineRemove />}
        className="remove-button"
        onClick={onRemoveHandler}
      >
        {t('removeFromSelected', { ns: 'T_TestsAnalysys', defaultValue: 'Remove from Selected' })}
      </Button>
    </div>
  );
};

const PopulationMeanInput: FC = () => {
  const classes = useCommonStyles();
  const { t } = useTranslation(['T_TestsAnalysys', 'common']);
  const { model: { populationMean }, setModelBulk } = useTTestsStats(
    useShallow((state) => ({
      model: state.model,
      setModelBulk: state.setModelBulk,
    }))
  );
  const [populationMeanValue, setPopulationMeanValue] = useState(populationMean.population_mean);

  useEffect(() => {
    setPopulationMeanValue(populationMean.population_mean);
  }, [populationMean.population_mean]);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setPopulationMeanValue(value);
    setModelBulk({ ...populationMean, "population_mean": value }, "populationMean");
  };

  return (
    <Fieldset title={t("populationMean")}>
      <div className={classes.checkboxWrapper}>
        <Field>
          <Input
            className={classes.input}
            type="number"
            value={`${populationMeanValue}`}
            name="populationMean"
            onChange={onChangeHandler}
          />
        </Field>
      </div>
    </Fieldset>
  );
};

const AssumptionChecking: FC = () => {
  const classes = useCommonStyles();
  const { model: { assumptionChecking }, setModelBulk } = useTestsStats(
    useShallow((state) => ({
      model: state.model,
      setModelBulk: state.setModelBulk,
    }))
  );
  const { t } = useTranslation(['optionsComponent']);
  const [isSelected, setIsSelected] = useState<boolean>(assumptionChecking?.normality);
  const [pValue, setPValue] = useState<number>(assumptionChecking?.P_value_reject);
  const [testValue, setTestValue] = useState<string>(assumptionChecking?.kolmo_with_correction ? "kolmo_with_correction" : "shaprio_walk");

  useEffect(() => {
    setPValue(assumptionChecking?.P_value_reject);
    setTestValue(assumptionChecking?.kolmo_with_correction ? "kolmo_with_correction" : "shaprio_walk");
  }, [assumptionChecking]);

  const onChangeHandler = (): void => {
    setIsSelected(!isSelected);
    setModelBulk({ ...assumptionChecking, normality: !isSelected }, "assumptionChecking");
  };

  const onPValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setPValue(value);
    setModelBulk({ ...assumptionChecking, "P_value_reject": value }, "assumptionChecking");
  };

  const onRadioChangeHandler = (_ev: FormEvent<HTMLDivElement>, data: RadioGroupOnChangeData) => {
    const value = data.value as string;
    const availableValues = ["shaprio_walk", "kolmo_with_correction"];
    let payLoad: Record<string, boolean> = {};
    availableValues.forEach(v => {
      payLoad[v] = value === v;
    });
    setModelBulk({ ...assumptionChecking, ...payLoad }, "assumptionChecking");
  };

  return (
    <div className={classes.commonWrapper} data-testid="mainLayout">
      <Checkbox
        label={t("normality")}
        name={"normality"}
        checked={isSelected}
        onChange={onChangeHandler}
      />
      <div className={classes.pValInput}>
        <p>{t("pValToReject")}</p>
        <Input className={classes.input} type="number" value={`${pValue}`} name="pValue" onChange={onPValueChange} />
      </div>
      <Fieldset
        title={t("normalityStats")}
        className={classes.optionsGroup}
      >
        <div className={classes.options} key={testValue}>
          <RadioGroup
            layout="vertical"
            name="normality"
            onChange={onRadioChangeHandler}
            value={testValue}
          >
            <Radio value="shaprio_walk" label={t("shaprio_walk")} />
            <Radio value="kolmo_with_correction" label={t("kolmo_with_correction")} />
          </RadioGroup>
        </div>
      </Fieldset>
    </div>
  );
};

const Results: FC = () => {
  const classes = useCommonStyles();
  const { model: { results }, setModelBulk } = useTestsStats(
    useShallow((state) => ({
      model: state.model,
      setModelBulk: state.setModelBulk,
    }))
  );
  const { t } = useTranslation(['optionsComponent']);
  const [confidenceSelected, setConfidenceSelected] = useState<boolean>(results?.isConfidenceSelected);
  const [confidenceValue, setConfidenceValue] = useState(results?.confidence_level);
  const [summaryTable, setSummaryTable] = useState(results?.summary_table);

  useEffect(() => {
    setConfidenceValue(results?.confidence_level);
    setSummaryTable(results?.summary_table);
  }, [results]);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.name === "confidence_level") {
      setConfidenceSelected(!confidenceSelected);
      setModelBulk({ ...results, confidence_level: confidenceValue, isConfidenceSelected: !confidenceSelected }, "results");
    } else {
      setSummaryTable(e.target.checked);
      setModelBulk({ ...results, "summary_table": e.target.checked }, "results");
    }
  };

  const onConfidenceValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setConfidenceValue(value);
    setModelBulk({ ...results, confidence_level: value, isConfidenceSelected: confidenceSelected }, "results");
  };

  const columns = [{ columnId: 'none', label: "None" }];

  return (
    <div className={classes.commonWrapper} data-testid="mainLayout">
      <Fieldset
        title={t("report")}
        className={classes.optionsGroup}
      >
        <Checkbox
          label={t("summaryTable")}
          name={"summaryTable"}
          checked={summaryTable}
          onChange={onChangeHandler}
        />
        <div className={classes.checkboxWrapper}>
          <Checkbox
            label={t("confidenceLevel")}
            name={"confidence_level"}
            checked={confidenceSelected}
            onChange={onChangeHandler}
          />
          <Input className={classes.input} disabled={!confidenceSelected} type="number" value={`${confidenceValue}`} name="confidenceLevel" onChange={onConfidenceValueChange} />
          <span>%</span>
        </div>
      </Fieldset>
      <div className={classes.checkboxWrapper}>
        <span>{t("resiInCol")}</span>
        <Field>
          <Dropdown
            size="small"
            onOptionSelect={() => { }}
            multiselect
            selectedOptions={["(none)"]}
            placeholder={t('none')}
            disabled
          >
            {columns.map((column) => (
              <Option key={column.columnId}>{column.label}</Option>
            ))}
          </Dropdown>
        </Field>
      </div>
    </div>
  );
};

const PostHocTest: FC = () => {
  const classes = useCommonStyles();
  const { model: { postHocTests }, setModelBulk } = useTestsStats(
    useShallow((state) => ({
      model: state.model,
      setModelBulk: state.setModelBulk,
    }))
  );
  const { t } = useTranslation(['optionsComponent']);
  const [alphaSelected, setAlphaSelected] = useState<boolean>(true);
  const [alphaValue, setAlphaValue] = useState(postHocTests.alpha_value);

  useEffect(() => {
    setAlphaValue(postHocTests?.alpha_value);
  }, [postHocTests]);

  const onChangeHandler = (): void => {
    setAlphaSelected(!alphaSelected);
  };

  const onAlphaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setAlphaValue(value);
    setModelBulk({ ...postHocTests, alpha_value: alphaSelected ? value : 0.05 }, "postHocTests");
  };

  return (
    <div className={classes.postHocTestWrapper} data-testid="mainLayout">
      <Checkbox
        label={t("powerValue")}
        name={"powerValue"}
        checked={true}
        onChange={onChangeHandler}
        value={`${alphaSelected}`}
      />
      <div className={classes.postHocTestAlphaInputWrapper}>
        <span>{t("useAlpha")}</span>
        <Input className={classes.input} disabled={!alphaSelected} type="number" value={`${alphaValue}`} name="confidenceLevel" onChange={onAlphaChange} />
      </div>
    </div>
  );
};

