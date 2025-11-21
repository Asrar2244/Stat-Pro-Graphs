import { ChangeEvent, FC, useEffect, useState, MouseEvent } from 'react';
import { Field, Dropdown, Option, OptionOnSelectData, SelectionEvents, Tab, TabList, SelectTabData, SelectTabEvent, Checkbox, Radio, RadioGroup, Input, tokens, Button } from "@fluentui/react-components";
import { MdKeyboardDoubleArrowRight, MdOutlineRemove } from 'react-icons/md';
import { useTranslation } from "react-i18next";
import { Fieldset } from "@libs/fieldset";
import { useCommonStyles } from "./styles-hook/use-test-styles";
import { IColumn, useColumnsRowsCount } from "@hooks/columns-row-count";
import { usePairedTTestsStats } from "./use-t-test-paired";
import { useActiveNode } from "@hooks/layout-nodes";
import { useShallow } from 'zustand/react/shallow';
import { useTestsStats } from '../options/use-tests-config';
import { ListCheckboxWithSelectAll } from '@libs';
import { generateKey } from '@utils/helper';
import { useStartProStore } from '@store/main-store';

type FieldConfig = {
  key: string;
  label: string;
};

type Props = {
  modelKey: "raw_data" | "indexed";
  fields: FieldConfig[];
  columns: IColumn[];
};

export const Model: FC = () => {
  const classes = useCommonStyles();
  const { t } = useTranslation(['pairedTTestAanalysis', 'common', 'optionsComponent']);
  const { config } = useActiveNode([]);
  const { columns } = useColumnsRowsCount({
    ...config,
    noRowCount: true,
  });
  const { model: { dataFormat }, setModel } = usePairedTTestsStats(
    useShallow((state) => ({
      model: state.model,
      setModel: state.setModel,
    }))
  );
  const [selectedTab, setSelectedTab] = useState<string>('assumptionChecking');

  const onTabSelectHandler = (_event: SelectTabEvent, { value }: SelectTabData): void => {
    setSelectedTab(value as string);
  };

  // Initialize availableList from columns - keep all columns in available list
  useEffect(() => {
    if (!columns || columns.length === 0) return;
    
    // Build available list from all columns
    const newAvailableList = new Map<string, boolean>();
    const currentAvailableList = dataFormat.availableList || new Map<string, boolean>();
    
    columns.forEach((column) => {
      // If column already exists in availableList, keep its current state, otherwise add it as unchecked
      if (currentAvailableList.has(column.columnId)) {
        newAvailableList.set(column.columnId, currentAvailableList.get(column.columnId) || false);
      } else {
        newAvailableList.set(column.columnId, false);
      }
    });
    
    // Only update if the available list has changed (new columns added)
    const currentKeys = Array.from(currentAvailableList.keys()).sort().join(',');
    const newKeys = Array.from(newAvailableList.keys()).sort().join(',');
    if (currentKeys !== newKeys) {
      setModel({
        dataFormat: {
          ...dataFormat,
          availableList: newAvailableList,
        }
      });
    }
  }, [columns.length]);

  // Determine initial format based on store data
  const getInitialFormat = () => {
    const beforeSize = dataFormat.raw_data?.before?.size || 0;
    const afterSize = dataFormat.raw_data?.after?.size || 0;
    const subjectSize = dataFormat.indexed?.subject?.size || 0;
    const treatmentSize = dataFormat.indexed?.treatment?.size || 0;
    const dataSize = dataFormat.indexed?.data?.size || 0;
    
    if (beforeSize > 0 || afterSize > 0) {
      return "raw";
    }
    if (subjectSize > 0 || treatmentSize > 0 || dataSize > 0) {
      return "indexed";
    }
    return "raw";
  };

  const [selectedDataFormat, setSelectedDataFormat] = useState(getInitialFormat());

  const formatOptions = [
    { columnId: 'raw', label: "Raw" },
    { columnId: 'indexed', label: "Indexed" }
  ];

  const [, ...cols] = columns;

  return (
    <div className={classes.commonWrapper} style={{ paddingTop: tokens.spacingVerticalM }}>
      <DataFormatSelection
        selectedDataFormat={selectedDataFormat}
        setSelectedDataFormat={setSelectedDataFormat}
        formatOptions={formatOptions}
      />
      {selectedDataFormat === "raw" ? (
        <DataSelection
          modelKey="raw_data"
          columns={cols}
          fields={[
            { key: "before", label: t("dataForBefore") },
            { key: "after", label: t("dataForAfter") },
          ]}
        />
      ) : (
        <DataSelection
          modelKey="indexed"
          columns={cols}
          fields={[
            { key: "subject", label: t("dataForSubject") },
            { key: "treatment", label: t("dataForTreatment") },
            { key: "data", label: t("dataForData") },
          ]}
        />
      )}
      <div style={{ marginTop: tokens.spacingVerticalS }}>
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

const DataFormatSelection: FC<{
  selectedDataFormat: string;
  setSelectedDataFormat: (format: string) => void;
  formatOptions: Array<{ columnId: string; label: string }>;
}> = ({ selectedDataFormat, setSelectedDataFormat, formatOptions }) => {
  const classes = useCommonStyles();
  const { t } = useTranslation(['pairedTTestAanalysis', 'common']);
  const [selectedOption, setSelectedOption] = useState<string[]>([selectedDataFormat]);

  const onFormatSelect = (_e: SelectionEvents, data: OptionOnSelectData) => {
    setSelectedOption(data.selectedOptions);
    setSelectedDataFormat(data.selectedOptions[0]);
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
              selectedOptions={selectedOption}
            >
              {formatOptions.map((option) => (
                <Option key={option.columnId} value={option.columnId}>{option.label}</Option>
              ))}
            </Dropdown>
          </Field>
        </div>
      </div>
    </Fieldset>
  );
};

const DataSelection: React.FC<Props> = ({ modelKey, fields, columns }) => {
  const classes = useCommonStyles();
  const { t } = useTranslation(['pairedTTestAanalysis', 'common', 'regLinearLeastSquare']);
  const { model: { dataFormat }, setModelBulk, setModel } = usePairedTTestsStats(
    useShallow((state) => ({
      model: state.model,
      setModelBulk: state.setModelBulk,
      setModel: state.setModel,
    }))
  );
  const { setBlockUI } = useStartProStore();
  const availableList = dataFormat.availableList || new Map<string, boolean>();

  // Initialize availableList from columns - keep all columns in available list
  useEffect(() => {
    if (!columns || columns.length === 0) return;
    
    // Build available list from all columns
    const newAvailableList = new Map<string, boolean>();
    const currentAvailableList = availableList || new Map<string, boolean>();
    
    columns.forEach((column) => {
      // If column already exists in availableList, keep its current state, otherwise add it as unchecked
      if (currentAvailableList.has(column.columnId)) {
        newAvailableList.set(column.columnId, currentAvailableList.get(column.columnId) || false);
      } else {
        newAvailableList.set(column.columnId, false);
      }
    });
    
    // Only update if the available list has changed (new columns added)
    const currentKeys = Array.from(currentAvailableList.keys()).sort().join(',');
    const newKeys = Array.from(newAvailableList.keys()).sort().join(',');
    if (currentKeys !== newKeys) {
      setModel({
        dataFormat: {
          ...dataFormat,
          availableList: newAvailableList,
        }
      });
    }
  }, [columns.length, modelKey]);

  return (
    <div className={classes.dataSelectionWrapper}>
      <Fieldset title={t('availableVar', { ns: 'regLinearLeastSquare' })}>
        <AvailableListRender 
          modelKey={modelKey} 
          fields={fields} 
          availableList={availableList}
          setModelBulk={setModelBulk}
          setModel={setModel}
          dataFormat={dataFormat}
        />
      </Fieldset>
      <div className={classes.selectedFieldsWrapper}>
        {fields.map((field) => (
          <Fieldset key={field.key} title={field.label}>
            <FieldListRender
              modelKey={modelKey}
              fieldKey={field.key}
              fieldLabel={field.label}
              availableList={availableList}
              setModelBulk={setModelBulk}
              setModel={setModel}
              dataFormat={dataFormat}
            />
          </Fieldset>
        ))}
      </div>
    </div>
  );
};

const AvailableListRender: FC<{
  modelKey: "raw_data" | "indexed";
  fields: FieldConfig[];
  availableList: Map<string, boolean>;
  setModelBulk: any;
  setModel: any;
  dataFormat: any;
}> = ({ modelKey, fields, availableList, setModelBulk, setModel, dataFormat }) => {
  const classes = useCommonStyles();
  const { t } = useTranslation(['pairedTTestAanalysis', 'regLinearLeastSquare']);
  const { setBlockUI } = useStartProStore();
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const [propKey, setPropKey] = useState(generateKey(availableList));

  useEffect(() => {
    setPropKey(generateKey(availableList));
  }, [...availableList.values()]);

  const onSendHandler = (e: MouseEvent<HTMLButtonElement>): void => {
    const fieldKey = (e.currentTarget as HTMLButtonElement).dataset.name;
    if (!fieldKey) return;

    const movList = new Map<string, boolean>();
    const newAvailableList = new Map<string, boolean>();

    // Separate selected and unselected items
    availableList.forEach((value, key) => {
      if (value) {
        movList.set(key, true);
        // Keep in available list but uncheck it
        newAvailableList.set(key, false);
      } else {
        newAvailableList.set(key, false);
      }
    });

    // Only allow one item per field
    if (movList.size > 1) {
      setBlockUI({ value: true, msg: t('allowOnlyOneRecord', { ns: 'errors', defaultValue: 'Please select exactly one variable.' }) });
      return;
    }

    // Check if field already has a value
    const currentFieldList = dataFormat[modelKey]?.[fieldKey] || new Map<string, boolean>();
    if (currentFieldList.size >= 1 && movList.size > 0) {
      setBlockUI({ value: true, msg: t('allowOnlyOneRecord', { ns: 'errors', defaultValue: 'Please select exactly one variable.' }) });
      return;
    }

    if (movList.size === 1) {
      setModel({
        dataFormat: {
          ...dataFormat,
          availableList: newAvailableList, // Keep all items, just uncheck selected ones
          [modelKey]: {
            ...dataFormat[modelKey],
            [fieldKey]: movList,
          }
        }
      });
      setModelBulk(newAvailableList, 'availableList');
      setSelectAll(false);
    }
  };

  return (
    <div className={classes.sectionAvailable}>
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

      <div className={classes.sendButtons}>
        {fields.map((field) => {
          const currentFieldList = dataFormat[modelKey]?.[field.key] || new Map<string, boolean>();
          return (
            <Button
              key={field.key}
              icon={<MdKeyboardDoubleArrowRight />}
              iconPosition="after"
              data-name={field.key}
              onClick={onSendHandler}
              disabled={currentFieldList.size >= 1}
            >
              {field.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

const FieldListRender: FC<{
  modelKey: "raw_data" | "indexed";
  fieldKey: string;
  fieldLabel: string;
  availableList: Map<string, boolean>;
  setModelBulk: any;
  setModel: any;
  dataFormat: any;
}> = ({ modelKey, fieldKey, fieldLabel, availableList, setModelBulk, setModel, dataFormat }) => {
  const classes = useCommonStyles();
  const { t } = useTranslation(['pairedTTestAanalysis', 'regLinearLeastSquare']);
  const fieldList = dataFormat[modelKey]?.[fieldKey] || new Map<string, boolean>();
  const [selectAll, setSelectAll] = useState<boolean | string | undefined>(false);
  const [propKey, setPropKey] = useState(generateKey(fieldList));

  useEffect(() => {
    setPropKey(generateKey(fieldList));
  }, [...fieldList.values()]);

  const handleFieldListChange = (list: Map<string, boolean>, listName?: string) => {
    setModel({
      dataFormat: {
        ...dataFormat,
        [modelKey]: {
          ...dataFormat[modelKey],
          [fieldKey]: list,
        }
      }
    });
  };

  const onRemoveHandler = (): void => {
    const newAvailableList = new Map(availableList);
    const newFieldList = new Map(fieldList);

    fieldList.forEach((value: boolean, name: string) => {
      if (value) {
        // Add back to available list (unchecked)
        newAvailableList.set(name, false);
        newFieldList.delete(name);
      }
    });

    setModel({
      dataFormat: {
        ...dataFormat,
        availableList: newAvailableList,
        [modelKey]: {
          ...dataFormat[modelKey],
          [fieldKey]: newFieldList,
        }
      }
    });
    setModelBulk(newAvailableList, 'availableList');
    if (newFieldList.size === 0) setSelectAll(false);
  };

  return (
    <div className={classes.sectionAvailable}>
      <ListCheckboxWithSelectAll
        listSize={fieldList.size}
        list={fieldList}
        selectAllText={t('selectAll', { ns: 'regLinearLeastSquare' })}
        selectValue={selectAll}
        requiredSelectAll
        onSelectAllChanged={setSelectAll}
        propKey={propKey}
        setModelBulk={handleFieldListChange}
        listName="fieldList"
      />

      <Button
        icon={<MdOutlineRemove />}
        className={classes.removeButtonClass}
        onClick={onRemoveHandler}
      >
        {t('remove', { ns: 'pairedTTestAanalysis' })}
      </Button>
    </div>
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

