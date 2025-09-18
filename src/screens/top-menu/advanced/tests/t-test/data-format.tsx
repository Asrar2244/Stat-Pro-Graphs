import { Field, Dropdown, Option, OptionOnSelectData, SelectionEvents, Input } from "@fluentui/react-components"
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTTestsStats } from "../t-test/use-t-tests";
import { useActiveNode } from "@hooks/layout-nodes";
import { IColumn, useColumnsRowsCount } from "@hooks/columns-row-count";
import { Fieldset } from "@libs/fieldset";
import { useCommonStyles } from "./styles-hook/use-test-styles";


export const DataFormatScreens = ({ pageIndex, ...props }:
    { pageIndex: number, setSelectedDataFormat: (x: string) => void, selectedDataFormat: string }) => {
    const { config } = useActiveNode([]);
    const { columns } = useColumnsRowsCount({
        ...config,
        noRowCount: true,
    });
    switch (pageIndex) {
        case 0:
            return <SelectDataType {...props} />
        case 1:
            return <SelectDataColumns {...props} columns={columns} />
        default:
            return <div></div>
    }

}

const SelectDataType = ({ setSelectedDataFormat, selectedDataFormat }: { setSelectedDataFormat: (x: string) => void, selectedDataFormat: string }) => {
    const classes = useCommonStyles()
    const [selectedOption, setSelectedOption] = useState([selectedDataFormat]);
    const columns = [{ columnId: 'raw', label: "Raw" }, { columnId: 'MSSD', label: "Mean, Size, Standard Deviation" }, { columnId: 'MSSE', label: "Mean, Size, Standard Error" }]
    const { t } = useTranslation(['T_TestsAnalysys', 'common']);
    const { model: { populationMean }, setModelBulk } = useTTestsStats();
    const [populationMeanValue, setPopulationMeanValue] = useState(populationMean.population_mean);

    useEffect(() => {
        setPopulationMeanValue(populationMean.population_mean);
    }, [setPopulationMeanValue])

    const onChangeHandler = (e: any) => {
        setPopulationMeanValue(e.target.value);
        setModelBulk({ ...populationMean, "population_mean": Number(e.target.value) }, "populationMean")
    }
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
        <div className={classes.checkboxWrapper}>
            <p>{t("populationMean")}</p>
            <Field>
                <Input className={classes.input} type="number" value={`${populationMeanValue}`} name="populationMean" onChange={onChangeHandler} />
            </Field>
        </div>
    </div >
}

const SelectDataColumns = ({ columns, selectedDataFormat }: { setSelectedDataFormat: (x: string) => void, selectedDataFormat: string, columns: IColumn[] }) => {
    if (selectedDataFormat === 'raw')
        return <RawSelection columns={columns} />;
    return <MSSSelection columns={columns} selectedDataFormat={selectedDataFormat} />;

}

const RawSelection = ({ columns }: { columns: IColumn[] }) => {
    const [selectedOption, setSelectedOption] = useState<string[]>([]);
    const { t } = useTranslation(['T_TestsAnalysys', 'common']);
    const classes = useCommonStyles();
    const { model: { dataFormat }, setModelBulk } = useTTestsStats();
    const onOptionSelect = (_: SelectionEvents, data: OptionOnSelectData) => {
        setSelectedOption(data.selectedOptions);
        setModelBulk({ ...dataFormat, sample: data.selectedOptions }, "dataFormat")
    }

    return <div className={classes.dataSelectionWrapper}>
        <div className={classes.dataWrapper}>
            <span>{t("dataForData")}</span>
            <Field>
                <Dropdown
                    size="small"
                    onOptionSelect={onOptionSelect}
                    selectedOptions={selectedOption}
                >
                    {columns.map((column) => (
                        <Option key={column.columnId}>{column.columnId}</Option>
                    ))}
                </Dropdown>
            </Field>
        </div>
        <div className={classes.selectedColWrapper}>
            <span>{t("selectedColumn")}</span>
            <Fieldset
                title={""}
                className={classes.selectedData}
            >
                <div className={classes.valInput}>
                    <p>{t("data")}</p> <p>:</p><p>{selectedOption}</p>
                </div>
            </Fieldset>
        </div>
    </div>
}

const MSSSelection = ({ selectedDataFormat }: { columns: IColumn[], selectedDataFormat: string }) => {
    const [selectedMean, setSelectedMean] = useState<string>();
    const [selectedSize, setSelectedSize] = useState<string>();
    const [selectedStd, setSelectedStd] = useState<string>();

    const { t } = useTranslation(['T_TestsAnalysys', 'common']);
    const classes = useCommonStyles();
    const { model: { dataFormat }, setModelBulk } = useTTestsStats();
    const onMeanSelect = (e: ChangeEvent<HTMLInputElement>, _: any) => {
        const val = e.target.value;
        setSelectedMean(val);
        setModelBulk({ ...dataFormat, sample: [""], values: { ...dataFormat.values, mean: val, } }, "dataFormat")
    }

    const onSizeSelect = (e: ChangeEvent<HTMLInputElement>, _: any) => {
        const val = e.target.value;
        setSelectedSize(val);
        setModelBulk({ ...dataFormat, sample: [""], values: { ...dataFormat.values, size: val } }, "dataFormat")
    }

    const onSDSelect = (e: ChangeEvent<HTMLInputElement>, _: any) => {
        const val = e.target.value;
        setSelectedStd(val);
        const colName = selectedDataFormat === "MSSD" ? "deviation" : "standard_error"
        setModelBulk({ ...dataFormat, sample: [""], values: { ...dataFormat.values, [colName]: val } }, "dataFormat")
    }


    return <div className={classes.dataSelectionWrapper}>
        <div className={classes.dataWrapper}>
            <Fieldset
                title={""}
                className={classes.selectedData}
            >
                <div className={classes.valInput}>
                    <p>{t("mean")}</p> <p>:</p> <Input type="number" value={`${selectedMean}`} onChange={onMeanSelect} />
                </div>
                <div className={classes.valInput}>
                    <p>{t("size")}</p> <p>:</p> <Input type="number" value={`${selectedSize}`} onChange={onSizeSelect} />
                </div>
                <div className={classes.valInput}>
                    <p>{selectedDataFormat === "MSSD" ? t("stdDev") : t("stdErr")}</p> <p>:</p> <Input type="number" value={`${selectedStd}`} onChange={onSDSelect} />
                </div>
            </Fieldset>
        </div>
    </div>
}