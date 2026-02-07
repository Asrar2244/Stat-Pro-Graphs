import { FC } from 'react';
import { Button, Text, tokens } from '@fluentui/react-components';
import { MdCheckCircle, MdInfoOutline, MdOutlineRemove, MdKeyboardDoubleArrowRight, MdTrendingDown, MdTrendingUp } from 'react-icons/md';
import { getRequiredErrorBarCount } from '../utils/formatRequirements';
import { useLineScatterPlotStore } from '../lineScatterPlotSlice';
import { useVariableSelectionStyles } from '../styles-hook';

/**
 * Props for the VariableSelection component
 */
interface VariableSelectionProps {
  classes: Record<string, string>;
  requireX: boolean;
  requireY: boolean;
  requireErrorBar?: boolean;
  requireCategory?: boolean;
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
  errorBarVariableList?: Map<string, boolean>;
  selectAllErrorBar?: boolean | string | undefined;
  setSelectAllErrorBar?: (v: boolean | string | undefined) => void;
  setErrorBarVariableList?: (v: Map<string, boolean>) => void;
  categoryVariableList?: Map<string, boolean>;
  selectAllCategory?: boolean | string | undefined;
  setSelectAllCategory?: (v: boolean | string | undefined) => void;
  setCategoryVariableList?: (v: Map<string, boolean>) => void;
  handleSendToX: (variables: string[]) => void;
  handleSendToY: (variables: string[]) => void;
  handleSendToErrorBar?: (variables: string[]) => void;
  handleSendToCategory?: (variables: string[]) => void;
  handleRemoveFromX: (variables: string[]) => void;
  handleRemoveFromY: (variables: string[]) => void;
  handleRemoveFromErrorBar?: (variables: string[]) => void;
  handleRemoveFromCategory?: (variables: string[]) => void;
  canSendToX: boolean;
  canSendToY: boolean;
  canSendToErrorBar?: boolean;
  canSendToCategory?: boolean;
  canSendToXForReplicates?: boolean;
  canSendToYForReplicates?: boolean;
  canSendToXForYReplicates?: boolean;
  canSendToYForXReplicates?: boolean;
  xCount?: number;
  yCount?: number;
}

/**
 * Component for managing variable selection and assignment to X, Y, error bar, and category axes
 */
export const VariableSelection: FC<VariableSelectionProps> = (props) => {
  const {
    classes,
    requireX,
    requireY,
    requireErrorBar,
    requireCategory,
    showVariableSelection,
    dataFormat,
    subType,
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
    errorBarVariableList,
    selectAllErrorBar,
    setSelectAllErrorBar,
    setErrorBarVariableList,
    categoryVariableList,
    selectAllCategory,
    setSelectAllCategory,
    setCategoryVariableList,
    handleSendToX,
    handleSendToY,
    handleSendToErrorBar,
    handleSendToCategory,
    handleRemoveFromX,
    handleRemoveFromY,
    handleRemoveFromErrorBar,
    handleRemoveFromCategory,
    canSendToX,
    canSendToY,
    canSendToErrorBar,
    canSendToCategory,
    canSendToXForReplicates,
    canSendToYForReplicates,
    canSendToXForYReplicates,
    canSendToYForXReplicates,
    xCount = 0,
    yCount = 0,
  } = props;

  // Wire variable assignment to the store so the modal always has X/Y at Create time
  const { setXVariable, setYVariable } = useLineScatterPlotStore();

  const {
    variableSelectionContainerStyles,
    columnStyles,
    disabledSelectionStyles,
    removeButtonStyles,
    removeButtonHoverStyles,
    removeButtonLeaveStyles
  } = useVariableSelectionStyles();

  // Calculate max allowed error bars based on data format and X/Y counts
  const maxErrorBars = getRequiredErrorBarCount(xCount, yCount, dataFormat as any, subType);

  const pickFirst = (list: Map<string, boolean>): string | undefined => {
    const selected = Array.from(list.entries()).find(([, v]) => v);
    if (selected) return selected[0];
    const it = list.keys();
    const first = it.next();
    return first.done ? undefined : first.value;
  };

  const onSendToX = (): void => {
    const selectedVariables = Array.from(availableList.entries())
      .filter(([, checked]) => checked)
      .map(([name]) => name);
    handleSendToX(selectedVariables);
    const next = pickFirst(xVariableList);
    setXVariable(next);
  };

  const onSendToY = (): void => {
    const selectedVariables = Array.from(availableList.entries())
      .filter(([, checked]) => checked)
      .map(([name]) => name);
    handleSendToY(selectedVariables);
    const next = pickFirst(yVariableList);
    setYVariable(next);
  };

  const onSendToErrorBar = (): void => {
    const selectedVariables = Array.from(availableList.entries())
      .filter(([, checked]) => checked)
      .map(([name]) => name);
    handleSendToErrorBar?.(selectedVariables);
  };

  const onSendToCategory = (): void => {
    const selectedVariables = Array.from(availableList.entries())
      .filter(([, checked]) => checked)
      .map(([name]) => name);
    handleSendToCategory?.(selectedVariables);
  };

  const onRemoveX = (): void => {
    const selectedVariables = Array.from(xVariableList.entries())
      .filter(([, checked]) => checked)
      .map(([name]) => name);
    handleRemoveFromX(selectedVariables);
    const next = pickFirst(xVariableList);
    setXVariable(next);
  };

  const onRemoveY = (): void => {
    const selectedVariables = Array.from(yVariableList.entries())
      .filter(([, checked]) => checked)
      .map(([name]) => name);
    handleRemoveFromY(selectedVariables);
    const next = pickFirst(yVariableList);
    setYVariable(next);
  };

  const onRemoveErrorBar = (): void => {
    if (!errorBarVariableList) return;
    const selectedVariables = Array.from(errorBarVariableList.entries())
      .filter(([, checked]) => checked)
      .map(([name]) => name);
    handleRemoveFromErrorBar?.(selectedVariables);
  };

  const onRemoveCategory = (): void => {
    if (!categoryVariableList) return;
    const selectedVariables = Array.from(categoryVariableList.entries())
      .filter(([, checked]) => checked)
      .map(([name]) => name);
    handleRemoveFromCategory?.(selectedVariables);
  };

  return (
    <div className={classes.variableContainer}>
      <div className={classes.variableHeader}>
        <div className={classes.variableHeaderRow}>
          <MdCheckCircle size={20} color={tokens.colorPaletteGreenForeground1} />
          <Text size={400} weight="semibold" className={classes.variableHeaderTitle}>Variable Assignment</Text>
        </div>
        <Text size={200} className={classes.variableHeaderSubtitle}>
          Select variables for your line-scatter plot. Use the arrows to assign variables to X and Y axes.
        </Text>
      </div>

      <div style={variableSelectionContainerStyles as React.CSSProperties}>
        {/* Available Variables - Leftmost position */}
        <div className={classes.column} style={(columnStyles as React.CSSProperties)}>
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
                {(dataFormat === 'XY Pair' || dataFormat === 'XY Pairs' || dataFormat === 'XY Category' || dataFormat === 'X Many Y' || dataFormat === 'Y Many X' || dataFormat === 'X Many Y Replicates' || dataFormat === 'Y Many X Replicates' || dataFormat === 'Many Y Replicates' || dataFormat === 'Category Many Y' || dataFormat === 'Category Many X') && (
                  <>
                    <Button
                      icon={<MdKeyboardDoubleArrowRight />}
                      iconPosition="after"
                      onClick={onSendToX}
                      className={classes.actionBtn}
                      disabled={['X Many Y Replicates', 'Many Y Replicates'].includes(dataFormat || '') ? !canSendToXForReplicates :
                        dataFormat === 'Y Many X Replicates' ? !canSendToXForYReplicates : !canSendToX}
                    >
                      Send to X
                    </Button>
                    <Button
                      icon={<MdKeyboardDoubleArrowRight />}
                      iconPosition="after"
                      onClick={onSendToY}
                      className={classes.actionBtn}
                      disabled={['X Many Y Replicates', 'Many Y Replicates'].includes(dataFormat || '') ? !canSendToYForReplicates :
                        dataFormat === 'Y Many X Replicates' ? !canSendToYForXReplicates : !canSendToY}
                    >
                      Send to Y
                    </Button>
                    {requireErrorBar && (
                      <Button icon={<MdTrendingUp />} onClick={onSendToErrorBar} className={classes.actionBtn} disabled={!canSendToErrorBar}>
                        Send to Error Bar
                      </Button>
                    )}
                  </>
                )}
                {(dataFormat === 'Single Y' || dataFormat === 'Many Y' || dataFormat === 'Y Category' || dataFormat === 'Many Y Replicates') && (
                  <>
                    <Button icon={<MdKeyboardDoubleArrowRight />} iconPosition="after" onClick={onSendToY} className={classes.actionBtn} disabled={!canSendToY}>
                      Send to Y
                    </Button>
                    {requireErrorBar && (
                      <Button icon={<MdTrendingUp />} onClick={onSendToErrorBar} className={classes.actionBtn} disabled={!canSendToErrorBar}>
                        Send to Error Bar
                      </Button>
                    )}
                  </>
                )}
                {(dataFormat === 'Single X' || dataFormat === 'Many X' || dataFormat === 'X Category' || dataFormat === 'Many X Replicates') && (
                  <>
                    <Button icon={<MdKeyboardDoubleArrowRight />} iconPosition="after" onClick={onSendToX} className={classes.actionBtn} disabled={!canSendToX}>
                      Send to X
                    </Button>
                    {requireErrorBar && (
                      <Button icon={<MdTrendingUp />} onClick={onSendToErrorBar} className={classes.actionBtn} disabled={!canSendToErrorBar}>
                        Send to Error Bar
                      </Button>
                    )}
                  </>
                )}
                {requireCategory && (dataFormat === 'XY Category' || dataFormat === 'X Category' || dataFormat === 'Y Category' || dataFormat === 'Category Many Y' || dataFormat === 'Category Many X') && (
                  <Button icon={<MdTrendingUp />} onClick={onSendToCategory} className={classes.actionBtn} disabled={!canSendToCategory}>
                    Send to Category
                  </Button>
                )}
              </>
            ) : (
              <div style={disabledSelectionStyles}>
                <Text size={200} style={{ color: tokens.colorNeutralForegroundDisabled }}>
                  Variable selection not available for this plot type.
                </Text>
              </div>
            )}
          </div>
        </div>

        {/* X Variables */}
        {requireX && (
          <div className={classes.column} style={(columnStyles as React.CSSProperties)}>
            <div className={classes.columnHeader}>
              <MdTrendingUp size={18} color={tokens.colorPaletteRedForeground1} />
              <Text size={300} weight="bold" className={classes.columnHeaderTitle}>X VARIABLE(S)</Text>
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

            <div className={classes.actions}>
              <Button
                icon={<MdOutlineRemove />}
                iconPosition="before"
                size="small"
                onClick={onRemoveX}
                disabled={xVariableList.size === 0}
                className={classes.actionButton}
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        {/* Y Variables */}
        {requireY && (
          <div className={classes.column} style={(columnStyles as React.CSSProperties)}>
            <div className={classes.columnHeader}>
              <MdTrendingDown size={18} color={tokens.colorPaletteGreenForeground1} />
              <Text size={300} weight="bold" className={classes.columnHeaderTitle}>Y VARIABLE(S)</Text>
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

            <div className={classes.actions}>
              <Button
                icon={<MdOutlineRemove />}
                iconPosition="before"
                size="small"
                onClick={onRemoveY}
                disabled={yVariableList.size === 0}
                className={classes.actionButton}
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        {/* Error Bar Variables */}
        {requireErrorBar && errorBarVariableList && (
          <div className={classes.column} style={(columnStyles as React.CSSProperties)}>
            <div className={classes.columnHeader}>
              <MdCheckCircle size={18} color={tokens.colorPaletteYellowForeground1} />
              <Text size={300} weight="bold" className={classes.columnHeaderTitle}>ERROR BAR VARIABLE(S)</Text>
              <div className={classes.columnHeaderBadge}>{errorBarVariableList.size}</div>
            </div>

            <VariableListRender
              list={errorBarVariableList}
              selectAll={selectAllErrorBar}
              setSelectAll={setSelectAllErrorBar}
              setList={setErrorBarVariableList}
              listName="errorBarVariableList"
              selectAllText="Select All"
              maxSelected={maxErrorBars}
            />

            <div className={classes.actions}>
              <Button
                icon={<MdOutlineRemove />}
                iconPosition="before"
                size="small"
                onClick={onRemoveErrorBar}
                disabled={errorBarVariableList.size === 0}
                className={classes.actionButton}
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        {/* Category Variables */}
        {requireCategory && categoryVariableList && (
          <div className={classes.column} style={(columnStyles as React.CSSProperties)}>
            <div className={classes.columnHeader}>
              <MdCheckCircle size={18} color={tokens.colorPalettePurpleForeground2} />
              <Text size={300} weight="bold" className={classes.columnHeaderTitle}>CATEGORY VARIABLE(S)</Text>
              <div className={classes.columnHeaderBadge}>{categoryVariableList.size}</div>
            </div>

            <VariableListRender
              list={categoryVariableList}
              selectAll={selectAllCategory}
              setSelectAll={setSelectAllCategory}
              setList={setCategoryVariableList}
              listName="categoryVariableList"
              selectAllText="Select All"
            />

            <div className={classes.actions}>
              <Button
                icon={<MdOutlineRemove />}
                iconPosition="before"
                size="small"
                onClick={onRemoveCategory}
                disabled={categoryVariableList.size === 0}
                className={classes.actionButton}
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
