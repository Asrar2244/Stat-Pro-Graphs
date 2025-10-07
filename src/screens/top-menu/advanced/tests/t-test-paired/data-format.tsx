
import { useState, useEffect } from "react";
import { Dropdown, Field, Option, OptionOnSelectData, SelectionEvents } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { Fieldset } from "@libs/fieldset";
import { useCommonStyles } from "./styles-hook/use-test-styles";
import { IColumn, useColumnsRowsCount } from "@hooks/columns-row-count";
import { usePairedTTestsStats } from "./use-t-test-paired";
import { useActiveNode } from "@hooks/layout-nodes";


type FieldConfig = {
    key: string;
    label: string;
};

type Props = {
    modelKey: "raw_data" | "indexed";
    fields: FieldConfig[];
    columns: IColumn[];
};


export const DataFormatScreens = ({ pageIndex, ...props }:
    { pageIndex: number, setSelectedDataFormat: (x: string) => void, selectedDataFormat: string }) => {
    switch (pageIndex) {
        case 0:
            return <SelectDataType {...props} />
        case 1:
            return <SelectDataColumns {...props} />
        default:
            return <div></div>
    }

}

const SelectDataType = ({ setSelectedDataFormat, selectedDataFormat }: { setSelectedDataFormat: (x: string) => void, selectedDataFormat: string }) => {
    const classes = useCommonStyles()
    const [selectedOption, setSelectedOption] = useState([selectedDataFormat]);
    const columns = [{ columnId: 'raw', label: "Raw" }, { columnId: 'indexed', label: "Indexed" }]
    const { t } = useTranslation(['pairedTTestAanalysis', 'common']);

    const onOptionSelect = (_e: SelectionEvents, data: OptionOnSelectData) => {
        setSelectedOption(data.selectedOptions)
        setSelectedDataFormat(data.selectedOptions[0]);
    }
    return <div className={classes.dataformatWrapper}>
        <div className={classes.checkboxWrapper}>
            <span>{t("dataFormat")}</span>
            <Field>
                <Dropdown
                    size="small"
                    onOptionSelect={onOptionSelect}
                    defaultValue={columns.find(c => selectedDataFormat === c.columnId)?.label || columns[0].label}
                    selectedOptions={selectedOption}
                >
                    {columns.map((column) => (
                        <Option key={column.columnId} value={column.columnId}>{column.label}</Option>
                    ))}
                </Dropdown>
            </Field>
        </div>
    </div >
}
const SelectDataColumns = ({ selectedDataFormat }: any) => {
    const { config } = useActiveNode([]);
    const { columns } = useColumnsRowsCount({ ...config, noRowCount: true });
    const { t } = useTranslation(['pairedTTestAanalysis', 'common']);

    const [, ...cols] = columns;

    if (selectedDataFormat === "raw") {
        return (
            <DataSelection
                modelKey="raw_data"
                columns={cols}
                fields={[
                    { key: "before", label: t("dataForBefore") },
                    { key: "after", label: t("dataForAfter") },
                ]}
            />
        );
    }

    return (
        <DataSelection
            modelKey="indexed"
            columns={cols}
            fields={[
                { key: "subject", label: t("dataForSubject") },
                { key: "treatment", label: t("dataForTreatment") },
                { key: "data", label: t("dataForData") },
            ]}
        />
    );
};

const DataSelection: React.FC<Props> = ({ modelKey, fields, columns }) => {
    const classes = useCommonStyles();
    const { t } = useTranslation(['pairedTTestAanalysis', 'common']);
    const { model: { dataFormat }, setModelBulk } = usePairedTTestsStats();

    const [selections, setSelections] = useState<Record<string, string[]>>({});
    const [selectedColm, setSelectedColm] = useState<string[]>([]);

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
        <div className={classes.dataSelectionWrapper}>
            <div className={classes.dataWrapper}>
                {fields.map(({ key, label }) => (
                    <div key={key}>
                        <span>{label}</span>
                        <Field>
                            <Dropdown
                                size="small"
                                selectedOptions={selections[key]}
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
                            <p>{t(key) || label}</p> <p>:</p><p>{selections[key]?.join(", ")}</p>
                        </div>
                    ))}
                </Fieldset>
            </div>
        </div>
    );
};
