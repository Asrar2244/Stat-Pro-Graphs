import { ChangeEvent, FC, useEffect, useState } from 'react';
import { Field, Dropdown, Option, OptionOnSelectData, SelectionEvents, Input, Tab, TabList, SelectTabData, SelectTabEvent, Checkbox, Radio, RadioGroup, tokens, makeStyles } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { Fieldset } from "@libs/fieldset";
import { useCommonStyles } from "./styles-hook/use-test-styles";
import { IColumn, useColumnsRowsCount } from "@hooks/columns-row-count";
import { useTTestsStats } from "./use-t-tests";
import { useActiveNode } from "@hooks/layout-nodes";
import { useShallow } from 'zustand/react/shallow';
import { useTestsStats } from '../options/use-tests-config';

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
  const { model: { dataFormat }, setModelBulk } = useTTestsStats(
    useShallow((state) => ({
      model: state.model,
      setModelBulk: state.setModelBulk,
    }))
  );
  // Determine initial format based on store data
  const getInitialFormat = () => {
    if (dataFormat.sample && dataFormat.sample.length > 0) return "raw";
    if (dataFormat.values?.deviation) return "MSSD";
    if (dataFormat.values?.standard_error) return "MSSE";
    return "raw";
  };

  const [selectedDataFormat, setSelectedDataFormat] = useState(getInitialFormat());
  const [selectedOption, setSelectedOption] = useState<string[]>(dataFormat.sample || []);
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
    setSelectedOption([]);
    setSelectedMean("");
    setSelectedSize("");
    setSelectedStd("");
  };

  const onColumnSelect = (_: SelectionEvents, data: OptionOnSelectData) => {
    setSelectedOption(data.selectedOptions);
    setModelBulk({ ...dataFormat, sample: data.selectedOptions }, "dataFormat");
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
              defaultValue={formatOptions[0].label}
              selectedOptions={[selectedDataFormat]}
            >
              {formatOptions.map((option) => (
                <Option key={option.columnId} value={option.columnId}>{option.label}</Option>
              ))}
            </Dropdown>
          </Field>
        </div>

        {selectedDataFormat === 'raw' ? (
          <div className={classes.dataWrapper}>
            <span>{t("dataForData")}</span>
            <Field>
              <Dropdown
                size="small"
                onOptionSelect={onColumnSelect}
                selectedOptions={selectedOption}
              >
                {columns.map((column) => (
                  <Option key={column.columnId}>{column.columnId}</Option>
                ))}
              </Dropdown>
            </Field>
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

        {selectedDataFormat === 'raw' && selectedOption.length > 0 && (
          <div className={classes.selectedColWrapper}>
            <span>{t("selectedColumn")}</span>
            <Fieldset title="" className={classes.selectedData}>
              <div className={classes.valInput}>
                <p>{t("data")}</p>
                <p>:</p>
                <p>{selectedOption.join(", ")}</p>
              </div>
            </Fieldset>
          </div>
        )}
      </div>
    </Fieldset>
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

  const onRadioChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
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

