import { Dialog as FDialog, DialogSurface, DialogBody, DialogContent, DialogActions, Spinner } from "@fluentui/react-components";
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
                <DialogContent>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        {blockUI.hideOk && <Spinner size="large" />}
                        <div style={{ textAlign: 'center' }}>
                            {blockUI.msg ? t(blockUI.msg) : t("somethingWentWrong")}
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    {!blockUI.hideOk && <Button appearance="primary" onClick={onChange}>{t("ok")}</Button>}
                    {/* Visually hidden button to satisfy FluentUI focus requirement when hideOk is true */}
                    {blockUI.hideOk && <button style={{ opacity: 0, width: 0, height: 0, border: 0, padding: 0 }} aria-hidden="true" tabIndex={0} />}
                </DialogActions>
            </DialogBody>
        </DialogSurface>
    </FDialog>) : (<></>)
    );
};
