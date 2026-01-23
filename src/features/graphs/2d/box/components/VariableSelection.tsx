import { FC } from 'react';
import { Button, Text, tokens } from '@fluentui/react-components';
import { MdCheckCircle, MdKeyboardDoubleArrowRight, MdOutlineRemove } from 'react-icons/md';
import { useBoxPlotStore } from '../boxPlotSlice';

interface VariableSelectionProps {
    classes: Record<string, string>;
    availableList: Map<string, boolean>;
    selectAllAvailable: boolean | string | undefined;
    setSelectAllAvailable: (v: boolean | string | undefined) => void;
    setAvailableList: (v: Map<string, boolean>) => void;
    VariableListRender: FC<any>;

    yVariableList: Map<string, boolean>;
    selectAllY: boolean | string | undefined;
    setSelectAllY: (v: boolean | string | undefined) => void;
    setYVariableList: (v: Map<string, boolean>) => void;

    xVariableList: Map<string, boolean>;
    selectAllX: boolean | string | undefined;
    setSelectAllX: (v: boolean | string | undefined) => void;
    setXVariableList: (v: Map<string, boolean>) => void;

    handleSendToX: () => void;
    handleSendToY: () => void;
    handleRemoveFromX: () => void;
    handleRemoveFromY: () => void;

    requireX: boolean;
    requireY: boolean;
    canSendToX: boolean;
    canSendToY: boolean;
}

export const VariableSelection: FC<VariableSelectionProps> = (props) => {
    const {
        classes,
        availableList,
        selectAllAvailable,
        setSelectAllAvailable,
        setAvailableList,
        VariableListRender,
        yVariableList,
        selectAllY,
        setSelectAllY,
        setYVariableList,
        xVariableList,
        selectAllX,
        setSelectAllX,
        setXVariableList,
        handleSendToX,
        handleSendToY,
        handleRemoveFromX,
        handleRemoveFromY,
        requireX,
        requireY,
        canSendToX,
        canSendToY
    } = props;

    const { setXVariable, setYVariable } = useBoxPlotStore();

    // Helpers to update store selected variable immediately for preview/validation
    const updateSelectedX = () => {
        // Pick first for simplicity if multiple are selected, or undefined if empty
        const it = xVariableList.keys();
        const first = it.next();
        setXVariable(first.done ? undefined : first.value);
    }
    const updateSelectedY = () => {
        const it = yVariableList.keys();
        const first = it.next();
        setYVariable(first.done ? undefined : first.value);
    }

    const onSendToX = () => { handleSendToX(); setTimeout(updateSelectedX, 0); };
    const onSendToY = () => { handleSendToY(); setTimeout(updateSelectedY, 0); };
    const onRemoveX = () => { handleRemoveFromX(); setTimeout(updateSelectedX, 0); };
    const onRemoveY = () => { handleRemoveFromY(); setTimeout(updateSelectedY, 0); };

    // Styles for outline buttons to match Line Plot hover effects (simulated/hardcoded for now as they come from hook in Line Plot)
    const removeButtonStyles = {
        marginTop: '10px',
        width: '100%',
        justifyContent: 'center',
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        color: tokens.colorNeutralForeground1,
    };

    return (
        <div className={classes.variableContainer}>
            {/* Header */}
            <div className={classes.variableHeader}>
                <div className={classes.variableHeaderRow}>
                    <MdCheckCircle size={20} color={tokens.colorPaletteGreenForeground1} />
                    <Text size={400} weight="semibold" className={classes.variableHeaderTitle}>Variable Assignment</Text>
                </div>
                <Text size={200} className={classes.variableHeaderSubtitle}>
                    Select variables from the list and assign them to axes
                </Text>
            </div>

            <div className={classes.columns}>
                {/* Available Variables */}
                <div className={classes.column}>
                    <div className={classes.columnHeader}>
                        <Text className={classes.columnHeaderTitle}>AVAILABLE VARIABLE(S)</Text>
                        <div className={classes.columnHeaderBadge}>{availableList.size}</div>
                    </div>
                    <VariableListRender
                        list={availableList}
                        selectAll={selectAllAvailable}
                        setSelectAll={setSelectAllAvailable}
                        setList={setAvailableList}
                        listName="availableList"
                        selectAllText="Select All"
                    />

                    {/* Action buttons at bottom of Available column */}
                    <div className={classes.actions}>
                        {requireX && (
                            <Button
                                icon={<MdKeyboardDoubleArrowRight />}
                                iconPosition="after"
                                onClick={onSendToX}
                                style={{ width: '100%', justifyContent: 'space-between' }}
                                disabled={!canSendToX}
                            >
                                Send to X
                            </Button>
                        )}
                        {requireY && (
                            <Button
                                icon={<MdKeyboardDoubleArrowRight />}
                                iconPosition="after"
                                onClick={onSendToY}
                                style={{ width: '100%', justifyContent: 'space-between' }}
                                disabled={!canSendToY}
                            >
                                Send to Y
                            </Button>
                        )}
                    </div>
                </div>

                {/* X Variables */}
                {requireX && (
                    <div className={classes.column}>
                        <div className={classes.columnHeader}>
                            <Text className={classes.columnHeaderTitle}>X VARIABLE(S)</Text>
                            <div className={classes.columnHeaderBadge}>{xVariableList.size}</div>
                        </div>

                        <VariableListRender
                            list={xVariableList}
                            selectAll={selectAllX}
                            setSelectAll={setSelectAllX}
                            setList={setXVariableList}
                            listName="xVariableList"
                            selectAllText="Select All"
                        />

                        {xVariableList.size > 0 && (
                            <Button
                                icon={<MdOutlineRemove />}
                                appearance="outline"
                                onClick={onRemoveX}
                                style={removeButtonStyles}
                            >
                                Remove from X
                            </Button>
                        )}
                    </div>
                )}

                {/* Y Variables */}
                {requireY && (
                    <div className={classes.columnNoRightBorder}>
                        <div className={classes.columnHeader}>
                            <Text className={classes.columnHeaderTitle}>Y VARIABLE(S)</Text>
                            <div className={classes.columnHeaderBadge}>{yVariableList.size}</div>
                        </div>

                        <VariableListRender
                            list={yVariableList}
                            selectAll={selectAllY}
                            setSelectAll={setSelectAllY}
                            setList={setYVariableList}
                            listName="yVariableList"
                            selectAllText="Select All"
                        />

                        {yVariableList.size > 0 && (
                            <Button
                                icon={<MdOutlineRemove />}
                                appearance="outline"
                                onClick={onRemoveY}
                                style={removeButtonStyles}
                            >
                                Remove from Y
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
