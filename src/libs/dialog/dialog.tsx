import { Dialog as FDialog, DialogSurface, DialogBody, DialogContent, DialogActions } from "@fluentui/react-components";
import { Button } from "@fluentui/react-components";
import { useStartProStore } from "@store/main-store";
import { useTranslation } from "react-i18next";

export const Dialog = () => {
    const { blockUI, setBlockUI } = useStartProStore();
    const { t } = useTranslation('dialog')
    const onChange = () => {
        setBlockUI({ value: false, msg: "" })
    }
    return (blockUI.value ? (<FDialog open={blockUI.value} onOpenChange={onChange} >
        <DialogSurface>
            <DialogBody>
                <DialogContent>{blockUI.msg ? t(blockUI.msg) : t("somethingWentWrong")}</DialogContent>
                <DialogActions>
                    {!blockUI.hideOk && <Button appearance="primary" onClick={onChange}>{t("ok")}</Button>}
                </DialogActions>
            </DialogBody>
        </DialogSurface>
    </FDialog>) : (<></>)
    );
};
