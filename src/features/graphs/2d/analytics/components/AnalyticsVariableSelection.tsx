import React, { FC } from 'react';
import {
    makeStyles,
    shorthands,
    tokens,
    Button,
    Text,
    Subtitle2,
    Caption1,
    Tooltip,
    Card,
    CardHeader
} from '@fluentui/react-components';
import { MdArrowForward, MdArrowBack, MdInfoOutline } from 'react-icons/md';
import { useAnalyticsStore } from '../store/analyticsSlice';
import { getComputer } from '../computers';
import { AnalyticsVariableRequirement } from '../computers/types';
import { Variable } from '../../bar/types';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        gap: '16px',
        height: '400px',
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    leftCol: {
        flex: '2',
        ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
        ...shorthands.borderRadius(tokens.borderRadiusMedium),
        overflow: 'hidden',
    },
    rightCol: {
        flex: '3',
        overflowY: 'auto',
        ...shorthands.padding('4px'),
    },
    header: {
        ...shorthands.padding('8px'),
        backgroundColor: tokens.colorNeutralBackground2,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    list: {
        flex: '1',
        overflowY: 'auto',
        ...shorthands.padding('8px'),
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 8px',
        cursor: 'pointer',
        borderRadius: tokens.borderRadiusSmall,
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground1Hover,
        },
    },
    selectedItem: {
        backgroundColor: tokens.colorBrandBackground,
        color: tokens.colorNeutralForegroundInverted,
        ':hover': {
            backgroundColor: tokens.colorBrandBackgroundHover,
        },
    },
    reqCard: {
        marginBottom: '16px',
        ...shorthands.padding('12px'),
    },
    reqHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
    },
    controls: {
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    assignedList: {
        flex: '1',
        minHeight: '80px',
        maxHeight: '150px',
        overflowY: 'auto',
        ...shorthands.border('1px', 'dashed', tokens.colorNeutralStroke1),
        ...shorthands.padding('4px'),
        backgroundColor: tokens.colorNeutralBackground1,
    },
    assignedItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 8px',
        cursor: 'pointer',
        marginBottom: '4px',
        borderRadius: tokens.borderRadiusSmall,
        ':hover': {
            backgroundColor: tokens.colorPaletteRedBackground2,
        },
    },
    assignedItemSelected: {
        backgroundColor: tokens.colorPaletteRedBackground3,
        color: tokens.colorNeutralForegroundOnBrand,
    }
});

interface VariableListProps {
    variables: Variable[];
    selected: Set<string>;
    onToggle: (name: string) => void;
    title: string;
}

const VariableList: FC<VariableListProps> = ({ variables, selected, onToggle, title }) => {
    const styles = useStyles();
    return (
        <div className={styles.leftCol} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.header}>
                <Subtitle2>{title}</Subtitle2>
            </div>
            <div className={styles.list}>
                {variables.map((v) => (
                    <div
                        key={v.name}
                        onClick={() => onToggle(v.name)}
                        className={selected.has(v.name) ? styles.selectedItem : styles.item}
                    >
                        <Text style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {v.name}
                        </Text>
                        <Caption1 style={{ opacity: 0.8 }}>{v.type}</Caption1>
                    </div>
                ))}
                {variables.length === 0 && (
                    <Text align="center" style={{ display: 'block', marginTop: '16px', color: tokens.colorNeutralForeground3 }}>
                        No variables available
                    </Text>
                )}
            </div>
        </div>
    );
};


export const AnalyticsVariableSelection: FC = () => {
    const styles = useStyles();
    const {
        subType,
        availableVariables,
        variableSelections,
        setVariableSelection,
        clearVariableSelection,
        dataFormat,
    } = useAnalyticsStore();

    const [selectedAvailable, setSelectedAvailable] = React.useState<Set<string>>(new Set());
    const [selectedAssigned, setSelectedAssigned] = React.useState<Map<string, Set<string>>>(new Map());

    const computer = subType ? getComputer(subType) : undefined;

    if (!computer) return null;

    // Resolve requirements
    const requirements = typeof computer.variableRequirements === 'function'
        ? computer.variableRequirements({ dataFormat })
        : computer.variableRequirements;

    // Filter out variables that are already assigned to any slot and internal columns
    const unassignedVariables = availableVariables.filter(v => {
        if (v.name.startsWith('xxx_')) return false;
        for (const assignedVars of variableSelections.values()) {
            if (assignedVars.includes(v.name)) return false;
        }
        return true;
    });

    const handleToggleAvailable = (name: string) => {
        const newSet = new Set(selectedAvailable);
        if (newSet.has(name)) newSet.delete(name);
        else newSet.add(name);
        setSelectedAvailable(newSet);
    };

    const handleToggleAssigned = (reqId: string, name: string) => {
        const newMap = new Map(selectedAssigned);
        const reqSet = new Set(newMap.get(reqId) || []);
        if (reqSet.has(name)) reqSet.delete(name);
        else reqSet.add(name);
        newMap.set(reqId, reqSet);
        setSelectedAssigned(newMap);
    };

    const handleAssign = (req: AnalyticsVariableRequirement) => {
        const currentAssigned = variableSelections.get(req.id) || [];
        const toAdd = Array.from(selectedAvailable);

        // Enforce max count
        if (req.maxCount !== undefined) {
            const remaining = req.maxCount - currentAssigned.length;
            if (toAdd.length > remaining) {
                return;
            }
        }

        setVariableSelection(req.id, [...currentAssigned, ...toAdd]);
        setSelectedAvailable(new Set()); // Clear selection
    };

    const handleRemove = (reqId: string) => {
        const currentAssigned = variableSelections.get(reqId) || [];
        const toRemove = selectedAssigned.get(reqId) || new Set();

        const newAssigned = currentAssigned.filter(v => !toRemove.has(v));
        setVariableSelection(reqId, newAssigned);

        // Clear selection for this req
        const newMap = new Map(selectedAssigned);
        newMap.delete(reqId);
        setSelectedAssigned(newMap);
    };

    return (
        <div className={styles.container}>
            {/* Available Variables Column */}
            <div style={{ flex: 1 }}>
                <VariableList
                    title={`Available Variables (${unassignedVariables.length})`}
                    variables={unassignedVariables}
                    selected={selectedAvailable}
                    onToggle={handleToggleAvailable}
                />
            </div>

            {/* Middle Action Buttons & Target Slots */}
            <div className={styles.rightCol}>
                {requirements.map((req) => {
                    const assignedVars = variableSelections.get(req.id) || [];
                    const assignedSet = selectedAssigned.get(req.id) || new Set();

                    const isFull = req.maxCount !== undefined && assignedVars.length >= req.maxCount;
                    const canAssign = selectedAvailable.size > 0 && !isFull && (req.maxCount === undefined || selectedAvailable.size <= (req.maxCount - assignedVars.length));
                    const canRemove = assignedSet.size > 0;

                    return (
                        <Card key={req.id} className={styles.reqCard}>
                            <div className={styles.reqHeader}>
                                <Subtitle2>
                                    {req.label}
                                    <Caption1 style={{ marginLeft: 8, color: tokens.colorNeutralForeground3 }}>
                                        {req.maxCount === 1 ? '(Single)' : req.maxCount ? `(Max ${req.maxCount})` : '(Multiple)'}
                                    </Caption1>
                                </Subtitle2>
                                {req.description && (
                                    <Tooltip content={req.description} relationship="label">
                                        <Button appearance="subtle" icon={<MdInfoOutline />} size="small" />
                                    </Tooltip>
                                )}
                            </div>

                            <div className={styles.controls}>
                                <div className={styles.buttonGroup}>
                                    <Button
                                        appearance="primary"
                                        size="small"
                                        icon={<MdArrowForward />}
                                        disabled={!canAssign}
                                        onClick={() => handleAssign(req)}
                                    >
                                        Assign
                                    </Button>
                                    <Button
                                        appearance="outline"
                                        size="small"
                                        icon={<MdArrowBack />}
                                        disabled={!canRemove}
                                        onClick={() => handleRemove(req.id)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                                <div className={styles.assignedList}>
                                    {assignedVars.map(v => (
                                        <div
                                            key={v}
                                            onClick={() => handleToggleAssigned(req.id, v)}
                                            className={assignedSet.has(v) ? styles.assignedItemSelected : styles.assignedItem}
                                        >
                                            <Text>{v}</Text>
                                        </div>
                                    ))}
                                    {assignedVars.length === 0 && (
                                        <Caption1 style={{ padding: '8px', color: tokens.colorNeutralForeground3, display: 'block' }}>
                                            Select variables from left and click Assign
                                        </Caption1>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
