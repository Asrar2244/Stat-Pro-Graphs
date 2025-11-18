import { ChangeEvent, FC, useEffect, useState } from 'react';
import { Field, Dropdown, Option, OptionOnSelectData, SelectionEvents } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { Fieldset } from "@libs/fieldset";
import { useCommonStyles } from "./styles-hook/use-test-styles";
import { IColumn, useColumnsRowsCount } from "@hooks/columns-row-count";
import { usePairedTTestsStats } from "./use-t-test-paired";
import { useActiveNode } from "@hooks/layout-nodes";
import { useShallow } from 'zustand/react/shallow';

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
  const { t } = useTranslation(['pairedTTestAanalysis', 'common']);
  const { config } = useActiveNode([]);
  const { columns } = useColumnsRowsCount({
    ...config,
    noRowCount: true,
  });
  const { model: { dataFormat } } = usePairedTTestsStats(
    useShallow((state) => ({
      model: state.model,
    }))
  );

  // Determine initial format based on store data
  const getInitialFormat = () => {
    if (dataFormat.raw_data?.before?.length > 0 || dataFormat.raw_data?.after?.length > 0) {
      return "raw";
    }
    if (dataFormat.indexed?.subject?.length > 0 || dataFormat.indexed?.treatment?.length > 0 || dataFormat.indexed?.data?.length > 0) {
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
    <div className={classes.commonWrapper}>
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
  const { t } = useTranslation(['pairedTTestAanalysis', 'common']);
  const { model: { dataFormat }, setModelBulk } = usePairedTTestsStats(
    useShallow((state) => ({
      model: state.model,
      setModelBulk: state.setModelBulk,
    }))
  );

  const initialSelections: Record<string, string[]> = {};
  fields.forEach(field => {
    const value = dataFormat[modelKey]?.[field.key];
    if (value) {
      initialSelections[field.key] = Array.isArray(value) ? value : [value];
    }
  });

  const [selections, setSelections] = useState<Record<string, string[]>>(initialSelections);
  const initialSelectedColm = Object.values(initialSelections).flat();
  const [selectedColm, setSelectedColm] = useState<string[]>(initialSelectedColm);

  const handleSelect = (fieldKey: string) => (_: SelectionEvents, data: OptionOnSelectData) => {
    const updatedSelections = { ...selections, [fieldKey]: data.selectedOptions };
    setSelections(updatedSelections);
    setModelBulk({
      ...dataFormat,
      [modelKey]: {
        ...dataFormat[modelKey],
        [fieldKey]: data.selectedOptions[0]
      }
    }, "dataFormat");
  };

  useEffect(() => {
    const allSelected = Object.values(selections).flat();
    setSelectedColm(allSelected);
  }, [selections]);

  return (
    <Fieldset title={t("dataSelection")}>
      <div className={classes.dataSelectionWrapper}>
        <div className={classes.dataWrapper}>
          {fields.map(({ key, label }) => (
            <div key={key}>
              <span>{label}</span>
              <Field>
                <Dropdown
                  size="small"
                  selectedOptions={selections[key] || []}
                  onOptionSelect={handleSelect(key)}
                >
                  <Option key="" value="">
                    -- Clear selection --
                  </Option>
                  {columns.map((column) => (
                    <Option
                      key={column.columnId}
                      disabled={
                        selectedColm.includes(column.columnId) &&
                        !(selections[key]?.includes(column.columnId))
                      }
                    >
                      {column.columnId}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
            </div>
          ))}
        </div>

        <div className={classes.selectedColWrapper}>
          <span>{t("selectedColumn")}</span>
          <Fieldset title="" className={classes.selectedData}>
            {fields.map(({ key, label }) => (
              <div className={classes.valInput} key={key}>
                <p>{t(key) || label}</p>
                <p>:</p>
                <p>{selections[key]?.join(", ") || ""}</p>
              </div>
            ))}
          </Fieldset>
        </div>
      </div>
    </Fieldset>
  );
};

