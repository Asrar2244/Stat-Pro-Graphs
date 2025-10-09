import { useEffect, useState } from 'react';
import { Fieldset } from '@libs';
import { useTranslation } from 'react-i18next';
import { useCommonStyles } from './styles-hook/use-test-styles';
import { Checkbox, Input, Radio, RadioGroup } from '@fluentui/react-components';
import { useTestsStats } from './use-tests-config';

export const AassumptionChecking: React.FC = () => {
  const classes = useCommonStyles();
  const { model: { assumptionChecking }, setModelBulk } = useTestsStats();
  const { t } = useTranslation(['optionsComponent']);
  const [isSelected, setIsSelected] = useState<boolean>(assumptionChecking?.normality);
  const [pValue, setPValue] = useState<number>(assumptionChecking?.P_value_reject)
  const [testValue, setTestValue] = useState<string>(assumptionChecking?.kolmo_with_correction ? "kolmo_with_correction" : "shaprio_walk")

  useEffect(() => {
    setPValue(assumptionChecking?.P_value_reject);
    setTestValue(assumptionChecking?.kolmo_with_correction ? "kolmo_with_correction" : "shaprio_walk")
  }, [assumptionChecking])


  const onChangeHandler = (): void => {
    setIsSelected(!isSelected);
    setModelBulk({ ...assumptionChecking, normality: !isSelected }, "assumptionChecking")
  };

  const onPValueChange = (e: any) => {
    setPValue(e.target.value);
    setModelBulk({ ...assumptionChecking, "P_value_reject": Number(e.target.value) }, "assumptionChecking")
  }

  const onRadioChangeHandler = (e: any) => {
    const { value } = e.target;
    const availableValues = ["shaprio_walk", "kolmo_with_correction"];
    let payLoad: Record<string, boolean> = {}
    availableValues.forEach(v => {
      payLoad[v] = value === v
    })
    setModelBulk({ ...assumptionChecking, ...payLoad }, "assumptionChecking")
  }
  return <div className={classes.commonWrapper} data-testid="mainLayout">
    <Checkbox
      label={t("normality")}
      name={"normality"}
      defaultChecked={isSelected}
      onChange={onChangeHandler}
    />
    <div className={classes.pValInput}>
      <p>{t("pValToReject")}</p>
      <Input className={classes.input} type="number" value={`${pValue}`} name="pValue" onChange={onPValueChange} />
    </div>
    <Fieldset
      title={
        t("normalityStats")
      }
      className={classes.optionsGroup}
    >
      <div className={classes.options} key={testValue}>
        <RadioGroup
          layout="vertical"
          name="normality"
          onChange={onRadioChangeHandler}
          defaultValue={testValue}
        >
          <Radio value="shaprio_walk" label={t("shaprio_walk")} />
          <Radio value="kolmo_with_correction" label={t("kolmo_with_correction")} />
        </RadioGroup>
      </div>
    </Fieldset>
  </div>

};

