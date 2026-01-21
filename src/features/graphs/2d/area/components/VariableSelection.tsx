import { FC } from 'react';
import { Button, Text, tokens } from '@fluentui/react-components';
import { MdCheckCircle, MdInfoOutline, MdOutlineRemove, MdKeyboardDoubleArrowRight, MdTrendingDown, MdTrendingUp } from 'react-icons/md';
import { useAreaPlotStore } from '../areaPlotSlice';
import { useVariableSelectionStyles } from '../styles-hook';
import { requiresX, requiresY } from '../utils/formatRequirements';

/**
 * Props for the VariableSelection component
 */
interface VariableSelectionProps {
    classes: Record<string, string>;
    requireX: boolean;
    requireY: boolean;
    showVariableSelection: boolean;
    dataFormat: string;
    subType?: string;
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
    xCount?: number;
    yCount?: number;
}

/**
 * Component for managing variable selection and assignment to X and Y axes
 */
export const VariableSelection: FC<VariableSelectionProps> = (props) => {
    const {
        classes,
        requireX,
        requireY,
        showVariableSelection,
        dataFormat,
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
    } = props;

    // Wire variable assignment to the store so the modal always has X/Y at Create time
    const { setXVariable, setYVariable } = useAreaPlotStore();

    const {
        variableSelectionContainerStyles,
        columnStyles,
        disabledSelectionStyles,
        removeButtonStyles,
        removeButtonHoverStyles,
        removeButtonLeaveStyles
    } = useVariableSelectionStyles();

    const pickFirst = (list: Map<string, boolean>): string | undefined => {
        const selected = Array.from(list.entries()).find(([, v]) => v);
        if (selected) return selected[0];
        const it = list.keys();
        const first = it.next();
        return first.done ? undefined : first.value;
    };

    const onSendToX = (): void => {
        handleSendToX();
        const next = pickFirst(xVariableList);
        setXVariable(next);
    };

    const onSendToY = (): void => {
        handleSendToY();
        const next = pickFirst(yVariableList);
        setYVariable(next);
    };

    const onRemoveX = (): void => {
        handleRemoveFromX();
        const next = pickFirst(xVariableList);
        setXVariable(next);
    };

    const onRemoveY = (): void => {
        handleRemoveFromY();
        const next = pickFirst(yVariableList);
        setYVariable(next);
    };

    return (
        <div className={classes.variableContainer}>
            <div className={classes.variableHeader}>
                <div className={classes.variableHeaderRow}>
                    <MdCheckCircle size={20} color={tokens.colorPaletteGreenForeground1} />
                    <Text size={400} weight="semibold" className={classes.variableHeaderTitle}>Variable Assignment</Text>
                </div>
                <Text size={200} className={classes.variableHeaderSubtitle}>
                    Select variables for your area plot. Use the arrows to assign variables to X and Y axes.
                </Text>
            </div>

            <div style={variableSelectionContainerStyles as React.CSSProperties}>
                {/* Available Variables - Leftmost position */}
                <div className={classes.column} style={columnStyles}>
                    <div className={classes.columnHeader}>
                        <MdInfoOutline size={18} color={tokens.colorNeutralForeground2} />
                        <Text size={300} weight="bold" className={classes.columnHeaderTitle}>AVAILABLE VARIABLE(S)</Text>
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

                    <div className={classes.actions}>
                        {showVariableSelection ? (
                            <>
                                {requiresX(dataFormat as any) && (
                                    <Button
                                        icon={<MdKeyboardDoubleArrowRight />}
                                        iconPosition="after"
                                        onClick={onSendToX}
                                        className={classes.actionBtn}
                                    >
                                        Send to X
                                    </Button>
                                )}

                                {requiresY(dataFormat as any) && (
                                    <Button
                                        icon={<MdKeyboardDoubleArrowRight />}
                                        iconPosition="after"
                                        onClick={onSendToY}
                                        className={classes.actionBtn}
                                    >
                                        Send to Y
                                    </Button>
                                )}
                            </>
                        ) : (
                            <div style={disabledSelectionStyles as React.CSSProperties}>
                                Select an Area Plot sub-type to enable variable selection
                            </div>
                        )}
                    </div>
                </div>

                {/* X Variables - Second position */}
                {requireX && (
                    <div className={classes.column} style={columnStyles}>
                        <div className={classes.columnHeader}>
                            <MdTrendingDown size={18} color={tokens.colorNeutralForeground2} />
                            <Text size={300} weight="bold" className={classes.columnHeaderTitle}>
                                {showVariableSelection && dataFormat === 'Single Y' ? 'AVAILABLE VARIABLE(S)' : 'X VARIABLE(S)'}
                            </Text>
                            <div className={classes.columnHeaderBadge}>{xVariableList.size}</div>
                        </div>

                        <VariableListRender
                            list={xVariableList}
                            selectAll={selectAllX}
                            setSelectAll={setSelectAllX}
                            setList={setXVariableList}
                            listName="xVariableList"
                            selectAllText="Select All"
                            maxSelected={dataFormat === 'X Many Y' ? 1 : undefined}
                        />

                        {showVariableSelection && dataFormat !== 'Single Y' && xVariableList.size > 0 && (
                            <Button
                                icon={<MdOutlineRemove />}
                                appearance="outline"
                                onClick={onRemoveX}
                                className={classes.removeBtn}
                                style={removeButtonStyles}
                                onMouseEnter={(e) => {
                                    Object.assign(e.currentTarget.style, removeButtonHoverStyles);
                                }}
                                onMouseLeave={(e) => {
                                    Object.assign(e.currentTarget.style, removeButtonLeaveStyles);
                                }}
                            >
                                Remove from X
                            </Button>
                        )}
                    </div>
                )}

                {/* Y Variables - Third position */}
                {requireY && (
                    <div className={classes.column} style={columnStyles}>
                        <div className={classes.columnHeader}>
                            <MdTrendingUp size={18} color={tokens.colorNeutralForeground2} />
                            <Text size={300} weight="bold" className={classes.columnHeaderTitle}>
                                {showVariableSelection && dataFormat === 'Single X' ? 'AVAILABLE VARIABLE(S)' : 'Y VARIABLE(S)'}
                            </Text>
                            <div className={classes.columnHeaderBadge}>{yVariableList.size}</div>
                        </div>

                        <VariableListRender
                            list={yVariableList}
                            selectAll={selectAllY}
                            setSelectAll={setSelectAllY}
                            setList={setYVariableList}
                            listName="yVariableList"
                            selectAllText="Select All"
                            maxSelected={dataFormat === 'Y Many X' ? 1 : undefined}
                        />

                        {showVariableSelection && dataFormat !== 'Single X' && yVariableList.size > 0 && (
                            <Button
                                icon={<MdOutlineRemove />}
                                appearance="outline"
                                onClick={onRemoveY}
                                className={classes.removeBtn}
                                style={removeButtonStyles}
                                onMouseEnter={(e) => {
                                    Object.assign(e.currentTarget.style, removeButtonHoverStyles);
                                }}
                                onMouseLeave={(e) => {
                                    Object.assign(e.currentTarget.style, removeButtonLeaveStyles);
                                }}
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
