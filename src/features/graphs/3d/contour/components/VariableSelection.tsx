import { FC } from 'react';
import { Button, Text, tokens } from '@fluentui/react-components';
import { MdCheckCircle, MdKeyboardDoubleArrowRight, MdOutlineRemove } from 'react-icons/md';
import { useContourPlotStore } from '../contourPlotSlice';
import { useVariableSelectionStyles } from '../styles-hook/use-variable-selection-styles';

/**
 * Props for the VariableSelection component
 */
interface VariableSelectionProps {
    classes: Record<string, string>;
    requireX: boolean;
    requireY: boolean;
    requireZ: boolean;
    showVariableSelection: boolean;
    dataFormat: string;
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
    zVariableList: Map<string, boolean>;
    selectAllZ: boolean | string | undefined;
    setSelectAllZ: (v: boolean | string | undefined) => void;
    setZVariableList: (v: Map<string, boolean>) => void;
    handleSendToX: () => void;
    handleSendToY: () => void;
    handleSendToZ: () => void;
    handleRemoveFromX: () => void;
    handleRemoveFromY: () => void;
    handleRemoveFromZ: () => void;
    canSendToX: boolean;
    canSendToY: boolean;
    canSendToZ: boolean;
    xCount?: number;
    yCount?: number;
    zCount?: number;
}

/**
 * Component for managing variable selection and assignment to X, Y, and Z axes
 */
export const VariableSelection: FC<VariableSelectionProps> = (props) => {
    const {
        classes,
        requireX,
        requireY,
        requireZ,
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
        zVariableList,
        selectAllZ,
        setSelectAllZ,
        setZVariableList,
        handleSendToX,
        handleSendToY,
        handleSendToZ,
        handleRemoveFromX,
        handleRemoveFromY,
        handleRemoveFromZ,
        canSendToX,
        canSendToY,
        canSendToZ,
        xCount = 0,
        yCount = 0,
        zCount = 0,
    } = props;

    // Wire variable assignment to the store
    const { setXVariable, setYVariable, setZVariable } = useContourPlotStore();

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

    const onSendToZ = (): void => {
        handleSendToZ();
        const next = pickFirst(zVariableList);
        setZVariable(next);
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

    const onRemoveZ = (): void => {
        handleRemoveFromZ();
        const next = pickFirst(zVariableList);
        setZVariable(next);
    };

    return (
        <div className={classes.variableContainer}>
            <div className={classes.variableHeader}>
                <div className={classes.variableHeaderRow}>
                    <MdCheckCircle size={20} color={tokens.colorPaletteGreenForeground1} />
                    <Text size={400} weight="semibold" className={classes.variableHeaderTitle}>Variable Assignment</Text>
                </div>
                <Text size={200} className={classes.variableHeaderSubtitle}>
                    Select variables for your Contour plot. Use the arrows to assign variables to X, Y, and Z axes.
                </Text>
            </div>

            <div style={variableSelectionContainerStyles as React.CSSProperties}>
                {/* Available Variables - Leftmost position */}
                <div className={classes.column} style={{ ...columnStyles, flexDirection: 'column' as const }}>
                    <div className={classes.columnHeader}>
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
                                {dataFormat === 'XYZ Triplets' && (
                                    <>
                                        <Button
                                            icon={<MdKeyboardDoubleArrowRight />}
                                            iconPosition="after"
                                            onClick={onSendToX}
                                            className={classes.actionBtn}
                                            disabled={!canSendToX}
                                        >
                                            Send to X
                                        </Button>
                                        <Button
                                            icon={<MdKeyboardDoubleArrowRight />}
                                            iconPosition="after"
                                            onClick={onSendToY}
                                            className={classes.actionBtn}
                                            disabled={!canSendToY}
                                        >
                                            Send to Y
                                        </Button>
                                        <Button
                                            icon={<MdKeyboardDoubleArrowRight />}
                                            iconPosition="after"
                                            onClick={onSendToZ}
                                            className={classes.actionBtn}
                                            disabled={!canSendToZ}
                                        >
                                            Send to Z
                                        </Button>
                                    </>
                                )}
                                {dataFormat === 'Many Z' && (
                                    <>
                                        <Button
                                            icon={<MdKeyboardDoubleArrowRight />}
                                            iconPosition="after"
                                            onClick={onSendToZ}
                                            className={classes.actionBtn}
                                            disabled={!canSendToZ}
                                        >
                                            Send to Z
                                        </Button>
                                    </>
                                )}
                                {dataFormat === 'XY Many Z' && (
                                    <>
                                        <Button
                                            icon={<MdKeyboardDoubleArrowRight />}
                                            iconPosition="after"
                                            onClick={onSendToX}
                                            className={classes.actionBtn}
                                            disabled={!canSendToX}
                                        >
                                            Send to X
                                        </Button>
                                        <Button
                                            icon={<MdKeyboardDoubleArrowRight />}
                                            iconPosition="after"
                                            onClick={onSendToY}
                                            className={classes.actionBtn}
                                            disabled={!canSendToY}
                                        >
                                            Send to Y
                                        </Button>
                                        <Button
                                            icon={<MdKeyboardDoubleArrowRight />}
                                            iconPosition="after"
                                            onClick={onSendToZ}
                                            className={classes.actionBtn}
                                            disabled={!canSendToZ}
                                        >
                                            Send to Z
                                        </Button>
                                    </>
                                )}
                            </>
                        ) : (
                            <div style={disabledSelectionStyles as React.CSSProperties}>
                                Select a data format to enable variable selection
                            </div>
                        )}
                    </div>
                </div>

                {/* X Variables - Second position */}
                {requireX && (
                    <div className={classes.column} style={{ ...columnStyles, flexDirection: 'column' as const }}>
                        <div className={classes.columnHeader}>
                            <Text size={300} weight="bold" className={classes.columnHeaderTitle}>
                                X VARIABLE(S)
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
                            maxSelected={dataFormat === 'XY Many Z' ? 1 : undefined}
                        />

                        {showVariableSelection && xVariableList.size > 0 && (
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
                    <div className={classes.column} style={{ ...columnStyles, flexDirection: 'column' as const }}>
                        <div className={classes.columnHeader}>
                            <Text size={300} weight="bold" className={classes.columnHeaderTitle}>
                                Y VARIABLE(S)
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
                            maxSelected={dataFormat === 'XY Many Z' ? 1 : undefined}
                        />

                        {showVariableSelection && yVariableList.size > 0 && (
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

                {/* Z Variables - Fourth position */}
                {requireZ && (
                    <div className={classes.columnNoRightBorder} style={{ ...columnStyles, flexDirection: 'column' as const }}>
                        <div className={classes.columnHeader}>
                            <Text size={300} weight="bold" className={classes.columnHeaderTitle}>
                                Z VARIABLE(S)
                            </Text>
                            <div className={classes.columnHeaderBadge}>{zVariableList.size}</div>
                        </div>

                        <VariableListRender
                            list={zVariableList}
                            selectAll={selectAllZ}
                            setSelectAll={setSelectAllZ}
                            setList={setZVariableList}
                            listName="zVariableList"
                            selectAllText="Select All"
                        />

                        {showVariableSelection && zVariableList.size > 0 && (
                            <Button
                                icon={<MdOutlineRemove />}
                                appearance="outline"
                                onClick={onRemoveZ}
                                className={classes.removeBtn}
                                style={removeButtonStyles}
                                onMouseEnter={(e) => {
                                    Object.assign(e.currentTarget.style, removeButtonHoverStyles);
                                }}
                                onMouseLeave={(e) => {
                                    Object.assign(e.currentTarget.style, removeButtonLeaveStyles);
                                }}
                            >
                                Remove from Z
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
