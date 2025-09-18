import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommonStyles } from './styles-hook/use-test-styles';
import { Checkbox, Input } from '@fluentui/react-components';
import { useTestsStats } from './use-tests-config';


export const PostHocTest: React.FC = () => {
    const classes = useCommonStyles();
    const { model: { postHocTests }, setModelBulk } = useTestsStats();
    const { t } = useTranslation(['optionsComponent']);
    const [alphaSelected, setAlphaSelected] = useState<boolean>(true);
    const [alphaValue, setAlphaValue] = useState(postHocTests.alpha_value);

    useEffect(() => {
        setAlphaValue(postHocTests?.alpha_value);
    }, [postHocTests])

    const onChangeHandler = (): void => {
        setAlphaSelected(!alphaSelected);
    };

    const onAlphaChange = (e: any) => {
        setAlphaValue(Number(e.target.value));
        setModelBulk({ ...postHocTests, alpha_value: alphaSelected ? Number(e.target.value) : 0.05 }, "postHocTests")
    }

    return (
        <div className={classes.postHocTestWrapper} data-testid="mainLayout">
            <Checkbox
                label={t("powerValue")}
                name={"powerValue"}
                defaultChecked={true}
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

