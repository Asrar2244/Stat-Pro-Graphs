import { useEffect, useState } from 'react';
import { Fieldset } from '@libs';
import { useTranslation } from 'react-i18next';
import { useCommonStyles } from '../t-test/styles-hook/use-test-styles';
import { Checkbox, Dropdown, Field, Input, Option } from '@fluentui/react-components';
import { useTestsStats } from './use-tests-config';


export const Results: React.FC = () => {
    const classes = useCommonStyles();
    const { model: { results }, setModelBulk } = useTestsStats();
    const { t } = useTranslation(['optionsComponent']);
    const [confidenceSelected, setConfidenceSelected] = useState<boolean>(results?.isConfidenceSelected);
    const [confidenceValue, setConfidenceValue] = useState(results?.confidence_level);
    const [summaryTable, setSummaryTable] = useState(results?.summary_table);
    useEffect(() => {
        setConfidenceValue(results?.confidence_level);
        setSummaryTable(results?.summary_table);
    }, [results])
    const onChangeHandler = (e: any): void => {
        if (e.target.name === "confidence_level") {
            setConfidenceSelected(!confidenceSelected);
            setModelBulk({ ...results, confidence_level: confidenceValue, isConfidenceSelected: confidenceSelected }, "results")
        } else {
            setSummaryTable(e.target.checked)
            setModelBulk({ ...results, "summary_table": e.target.checked }, "results")
        }
    };
    const onConfidenceValueChange = (e: any) => {
        setConfidenceValue(Number(e.target.value));
        setModelBulk({ ...results, confidence_level: Number(e.target.value), isConfidenceSelected: confidenceSelected }, "results")
    }
    const columns = [{ columnId: 'none', label: "None" }]

    return (
        <div className={classes.commonWrapper} data-testid="mainLayout">
            <Fieldset
                title={t("report")}
                className={classes.optionsGroup}
            >
                <Checkbox
                    label={t("summaryTable")}
                    name={"summaryTable"}
                    defaultChecked={summaryTable}
                    onChange={onChangeHandler}
                />
                <div className={classes.checkboxWrapper}>
                    <Checkbox
                        label={t("confidenceLevel")}
                        name={"confidence_level"}
                        defaultChecked={confidenceSelected}
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
                        //To-Do: once it will come in picture, will be segregating it
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

