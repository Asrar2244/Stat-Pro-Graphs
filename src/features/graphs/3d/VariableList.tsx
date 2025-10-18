import React from 'react';
import {
  Card,
  CardHeader,
  CardPreview,
  Text,
  Field,
  Input,
  Button,
  makeStyles,
  tokens,
  Badge
} from '@fluentui/react-components';
import { MdSearch, MdAdd } from 'react-icons/md';

const useStyles = makeStyles({
  container: {
    marginBottom: tokens.spacingVerticalL
  },
  searchSection: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalM
  },
  searchInput: {
    flex: 1
  },
  variableList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    maxHeight: '300px',
    overflow: 'auto'
  },
  variableItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacingVerticalS,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground1,
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2
    }
  },
  variableInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS
  },
  variableName: {
    fontWeight: tokens.fontWeightSemibold
  },
  variableDetails: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2
  },
  variableActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS
  },
  addButton: {
    minWidth: 'auto'
  },
  noVariables: {
    textAlign: 'center',
    padding: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground3
  }
});

interface VariableInfo {
  name: string;
  type: string;
  count: number;
  description?: string;
}

interface VariableListProps {
  variables: VariableInfo[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddVariable: (variable: VariableInfo) => void;
  selectedVariables: string[];
  plotType: string;
}

export const VariableList: React.FC<VariableListProps> = ({
  variables,
  searchTerm,
  onSearchChange,
  onAddVariable,
  selectedVariables,
  plotType
}) => {
  const styles = useStyles();

  const filteredVariables = variables.filter(variable =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVariableTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'numeric':
      case 'number':
        return 'success';
      case 'string':
      case 'text':
        return 'info';
      case 'date':
      case 'datetime':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const isVariableSelected = (variableName: string) => {
    return selectedVariables.includes(variableName);
  };

  const canAddVariable = (variable: VariableInfo) => {
    if (isVariableSelected(variable.name)) return false;
    
    // Check if variable type is suitable for 3D mesh plots
    const suitableTypes = ['numeric', 'number', 'integer', 'float', 'double'];
    return suitableTypes.includes(variable.type.toLowerCase());
  };

  return (
    <Card className={styles.container}>
      <CardHeader header={<Text weight="semibold">Available Variables</Text>} />
      <CardPreview>
        <div className={styles.searchSection}>
          <Input
            className={styles.searchInput}
            placeholder="Search variables..."
            value={searchTerm}
            onChange={(_, data) => onSearchChange(data.value)}
            contentBefore={<MdSearch />}
          />
        </div>

        {filteredVariables.length === 0 ? (
          <div className={styles.noVariables}>
            <Text>
              {searchTerm ? 'No variables match your search.' : 'No variables available.'}
            </Text>
          </div>
        ) : (
          <div className={styles.variableList}>
            {filteredVariables.map((variable) => (
              <div key={variable.name} className={styles.variableItem}>
                <div className={styles.variableInfo}>
                  <Text className={styles.variableName}>
                    {variable.name}
                  </Text>
                  <div className={styles.variableDetails}>
                    <Badge
                      size="small"
                      color={getVariableTypeColor(variable.type)}
                      appearance="outline"
                    >
                      {variable.type}
                    </Badge>
                    <Text style={{ marginLeft: tokens.spacingHorizontalS }}>
                      {variable.count} values
                    </Text>
                  </div>
                  {variable.description && (
                    <Text size="small" style={{ color: tokens.colorNeutralForeground3 }}>
                      {variable.description}
                    </Text>
                  )}
                </div>
                
                <div className={styles.variableActions}>
                  {isVariableSelected(variable.name) ? (
                    <Badge size="medium" appearance="filled" color="success">
                      Selected
                    </Badge>
                  ) : (
                    <Button
                      appearance="primary"
                      size="small"
                      icon={<MdAdd />}
                      className={styles.addButton}
                      disabled={!canAddVariable(variable)}
                      onClick={() => onAddVariable(variable)}
                    >
                      Add
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardPreview>
    </Card>
  );
};
