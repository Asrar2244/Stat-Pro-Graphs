import { FC, useState, useEffect } from 'react';
import { Input, Label, Spinner, Checkbox, Button, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { useActiveNode, useToaster, useModal } from '@hooks';
import { Database } from '@utils/db';
import { EXCEL } from '@constants/db';
import { useEmptyDataStore } from '@store';
import { Modal, Fieldset } from '@libs';
import { mainWorker } from '@workers/worker';
import { API } from '@constants/locale';
import { ProjectSelectionModal } from './project-selection-modal';
import { useSaveSampleSize } from './use-save-sample-size';
import { useSampleSizeStyles } from './styles-hook/use-sample-size-styles';
import { MdKeyboardDoubleArrowRight, MdOutlineRemove } from 'react-icons/md';

interface ChiSquareSampleSizeModalProps {
  open: boolean;
  onClose: () => void;
}

interface DataBlock {
  id: string;
  name: string;
  columnName: string;
  selected?: boolean;
}

const useDataSelectionStyles = makeStyles({
  dataSelectionLayout: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalS,
    ...shorthands.padding(tokens.spacingHorizontalM, '0'),
    '& fieldset': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
  },
  sectionAvailable: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    height: '100%',
    '& .column-list': {
      display: 'flex',
      flexDirection: 'column',
      height: '340px',
      overflowY: 'auto',
      ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralBackground1Pressed),
      ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralBackground1Pressed),
      marginBottom: tokens.spacingVerticalM,
      scrollbarWidth: 'thin',
      scrollbarColor: `${tokens.colorNeutralStroke1} transparent`,
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: tokens.colorNeutralStroke1,
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: tokens.colorNeutralStroke2,
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
    },
    '& .send-button': {
      width: '100%',
      marginTop: 'auto',
    },
    '& .remove-button': {
      width: '100%',
      marginTop: 'auto',
      backgroundColor: tokens.colorPaletteRedBackground3,
      '&:hover': {
        backgroundColor: tokens.colorPaletteRedBackground2,
      },
    },
  },
  columnItem: {
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  selectAllContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
});

const ChiSquareSampleSizeModal: FC<ChiSquareSampleSizeModalProps> = ({ 
  open, 
  onClose
}) => {
  const classes = useSampleSizeStyles();
  const dataSelectionClasses = useDataSelectionStyles();
  const [showCalculation, setShowCalculation] = useState(false);
  const [result, setResult] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [availableDataBlocks, setAvailableDataBlocks] = useState<DataBlock[]>([]);
  const [selectedDataBlocks, setSelectedDataBlocks] = useState<DataBlock[]>([]);
  const [loadingDataBlocks, setLoadingDataBlocks] = useState(false);
  const [selectAllAvailable, setSelectAllAvailable] = useState(false);
  const [selectAllSelected, setSelectAllSelected] = useState(false);
  const [formData, setFormData] = useState({
    desired_power: 0.8,
    alpha: 0.05,
    yates_correction: false
  });

  const { config } = useActiveNode([open]);
  const toaster = useToaster();
  const projectModal = useModal({});
  const { saveSampleSizeToProject } = useSaveSampleSize();
  
  // Access global empty data store
  const { spreadsheetData } = useEmptyDataStore();

  // Handlers for moving columns
  const handleToggleAvailable = (columnId: string) => {
    setAvailableDataBlocks(prev =>
      prev.map(block =>
        block.id === columnId ? { ...block, selected: !block.selected } : block
      )
    );
  };

  const handleToggleSelected = (columnId: string) => {
    setSelectedDataBlocks(prev =>
      prev.map(block =>
        block.id === columnId ? { ...block, selected: !block.selected } : block
      )
    );
  };

  const handleMoveToSelected = () => {
    const toMove = availableDataBlocks.filter(block => block.selected);
    if (toMove.length === 0) {
      toaster.error({ body: 'Please select at least one column' });
      return;
    }
    
    setSelectedDataBlocks(prev => [...prev, ...toMove.map(b => ({ ...b, selected: false }))]);
    setAvailableDataBlocks(prev => prev.filter(block => !block.selected));
    setSelectAllAvailable(false);
  };

  const handleRemoveFromSelected = () => {
    const toRemove = selectedDataBlocks.filter(block => block.selected);
    if (toRemove.length === 0) {
      toaster.error({ body: 'Please select columns to remove' });
      return;
    }
    
    setAvailableDataBlocks(prev => [...prev, ...toRemove.map(b => ({ ...b, selected: false }))]);
    setSelectedDataBlocks(prev => prev.filter(block => !block.selected));
    setSelectAllSelected(false);
  };

  const handleSelectAllAvailable = () => {
    const newValue = !selectAllAvailable;
    setSelectAllAvailable(newValue);
    setAvailableDataBlocks(prev => prev.map(block => ({ ...block, selected: newValue })));
  };

  const handleSelectAllSelected = () => {
    const newValue = !selectAllSelected;
    setSelectAllSelected(newValue);
    setSelectedDataBlocks(prev => prev.map(block => ({ ...block, selected: newValue })));
  };

  // Handle save to project
  const handleSelectProject = async (projectId: number, projectName: string) => {
    if (!result) return;
    
    const sampleSizeResult = {
      sample_size: result,
      test_type: 'chi-square-sample-size' as any,
      parameters: {
        ...formData,
        column_names: selectedDataBlocks.map(col => col.columnName),
      }
    };

    await saveSampleSizeToProject(
      projectId,
      projectName,
      'Chi-Square',
      'chi-square-sample-size' as any,
      sampleSizeResult,
      { expected_difference: 0, expected_std_dev: 0, desired_power: formData.desired_power, alpha: formData.alpha },
      { group1_proportion: 0, group2_proportion: 0, desired_power: formData.desired_power, alpha: formData.alpha, yates_correction: formData.yates_correction },
      { change_to_be_detected: 0, expected_std_dev_of_change: 0, desired_power: formData.desired_power, alpha: formData.alpha, correlation: 0 },
      { minimum_detectable_difference: 0, expected_std_dev_residuals: 0, num_groups: 0, desired_power: formData.desired_power, alpha: formData.alpha },
      { desired_power: formData.desired_power, alpha: formData.alpha, yates_correction: formData.yates_correction }
    );
  };

  // Fetch available data blocks from the current tab or empty data view
  useEffect(() => {
    if (open) {
      // Check if we're in an empty data view context
      if (config?.isEmptyDataView || spreadsheetData.length > 0) {
        fetchDataFromEmptyDataView();
      } else if (config?.tabName) {
        fetchDataFromDatabase();
      } else {
        setError('No data view is currently active. Please open a data file or create data in an empty data view first.');
      }
    }
  }, [open, config?.tabName, config?.isEmptyDataView, spreadsheetData]);

  useEffect(() => {
    if (!open) {
      setShowCalculation(false);
      setResult(0);
      setError('');
      setSelectedDataBlocks([]);
      setSelectAllAvailable(false);
      setSelectAllSelected(false);
      setFormData({
        desired_power: 0.8,
        alpha: 0.05,
        yates_correction: false
      });
    }
  }, [open]);

  const fetchDataFromEmptyDataView = () => {
    setLoadingDataBlocks(true);
    setError('');
    try {
      const data = spreadsheetData;
      if (!data || data.length === 0) {
        setError('No data available in the empty data view. Please add some data first.');
        return;
      }
      // Transpose data to get columns
      const numColumns = data[0]?.length || 0;
      const transposed: any[][] = Array.from({ length: numColumns }, (_, colIdx) => data.map(row => row[colIdx]?.value || ''));
      // Use first row as header if all values are string or empty
      const firstRow = data[0] || [];
      const isHeaderRow = firstRow.every(cell => typeof cell?.value === 'string' || cell?.value === undefined || cell?.value === '');
      const columnHeaders = isHeaderRow
        ? firstRow.map((cell, idx) => cell?.value?.toString() || `Column ${idx + 1}`)
        : Array.from({ length: numColumns }, (_, idx) => `Column ${idx + 1}`);
      // Create data blocks for each column
      const blocks: DataBlock[] = [];
      for (let colIdx = 0; colIdx < numColumns; colIdx++) {
        const colData = transposed[colIdx];
        // Only include columns with at least one non-empty value
        const filteredColData = colData.filter(val => val !== '' && val !== undefined && val !== null);
        if (filteredColData.length > 0) {
          blocks.push({
            id: `column_${colIdx}`,
            name: `${columnHeaders[colIdx]} (${filteredColData.length} values)`,
            columnName: columnHeaders[colIdx],
            selected: false
          });
        }
      }
      setAvailableDataBlocks(blocks);
    } catch (err: any) {
      setError(`Failed to load data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoadingDataBlocks(false);
    }
  };

  const fetchDataFromDatabase = async () => {
    if (!config?.tabName) {
      setError('No data view is currently active. Please open a data file or data view first.');
      setLoadingDataBlocks(false);
      return;
    }
    
    setLoadingDataBlocks(true);
    setError('');
    
    try {
      const db = new Database(config.tabName);
      // First, let's check if the table exists
      const tableCheckQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name='${EXCEL}'`;
      const tableExists = await db.selectQuery(tableCheckQuery);
      
      if (tableExists.length === 0) {
        setError(`No data table found. Please ensure you have data loaded in the current view.`);
        return;
      }
      
      // Check if there's any data in the table
      const countQuery = `SELECT COUNT(*) as count FROM ${EXCEL}`;
      const countResult = await db.selectQuery(countQuery);
      const rowCount = countResult[0]?.count || 0;
      
      if (rowCount === 0) {
        setError('The current data view is empty. Please load some data first.');
        return;
      }
      
      console.log(`Found ${rowCount} rows in table`);
      
      // Now fetch the actual data
      const result = await db.selectQuery(`SELECT * FROM ${EXCEL} LIMIT 100`);
      
      if (!result || result.length === 0) {
        setError('No data could be retrieved from the current view.');
        return;
      }
      
      console.log('Successfully fetched data:', result.length, 'rows');
      
      // Create data blocks for each column that has data
      const blocks: DataBlock[] = [];
      
      if (result.length > 0) {
        const columnNames = Object.keys(result[0]);
        
        for (const columnName of columnNames) {
          // Extract data for this column to count non-empty values
          const columnData = result
            .map((row: any) => row[columnName])
            .filter((val: any) => val !== null && val !== undefined && val !== '');
          
          if (columnData.length > 0) {
          blocks.push({
            id: `column_${columnName}`,
            name: `${columnName} (${columnData.length} values)`,
            columnName: columnName,
            selected: false
          });
          }
        }
      }
      
      if (blocks.length === 0) {
        setError('No columns with data found in the current view.');
        return;
      }
      
      setAvailableDataBlocks(blocks);
      
    } catch (err: any) {
      console.error('Error fetching data blocks:', err);
      
      // Provide more specific error messages
      if (err.message?.includes('no such table')) {
        setError('No data table found. Please ensure you have data loaded in the current view.');
      } else if (err.message?.includes('database is locked')) {
        setError('Database is currently locked. Please try again in a moment.');
      } else {
        setError(`Failed to load data: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoadingDataBlocks(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'boolean' ? value : parseFloat(value) || 0
    }));
  };

  const handleCalculate = async () => {
    if (!selectedDataBlocks.length) {
      toaster.error({ body: 'Please select at least one data column' });
      return;
    }

    if (!config?.tabName) {
      toaster.error({ body: 'No data source available' });
      return;
    }

    setLoading(true);
    setError('');
    setResult(0);

    try {
      // Extract column names from selected columns
      const columnNames = selectedDataBlocks.map(col => col.columnName);
      
      const requestBody = {
        operation: 'chisquare_sample_size',
        db_name: config.tabName,
        column_names: columnNames,
        desired_power: parseFloat(formData.desired_power.toString()),
        alpha: parseFloat(formData.alpha.toString()),
        yates_correction: formData.yates_correction
      };

      console.log('[Chi-Square Sample Size] Sending request:', requestBody);
      console.log('[Chi-Square Sample Size] API endpoint:', `/api/${API.analysis}`);
      console.log('[Chi-Square Sample Size] Backend URL:', API.backendURL);
      console.log('[Chi-Square Sample Size] Full URL:', `${API.backendURL}/api/${API.analysis}`);

      const response = await mainWorker.axios(
        `${API.backendURL}/api/${API.analysis}`,
        requestBody
      );
      
      console.log('[Chi-Square Sample Size] Full response:', response);
      console.log('[Chi-Square Sample Size] Response status:', response.status);
      console.log('[Chi-Square Sample Size] Response data:', response.data);

      if (response.status === 200 && response.data) {
        const responseData = response.data;
        
        // Check for error in response
        if (responseData.error || responseData.status === 'failed') {
          const errorMsg = responseData.error || responseData.message || 'Failed to calculate sample size';
          setError(errorMsg);
          toaster.error({ body: errorMsg });
          return;
        }

        if (responseData.sample_size !== undefined) {
          setResult(responseData.sample_size);
          toaster.success({ body: 'Sample size calculated successfully!' });
        } else {
          throw new Error('Invalid response from server - no sample_size field found');
        }
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (err: any) {
      console.error('[Chi-Square Sample Size] Full error object:', err);
      console.error('[Chi-Square Sample Size] Error response:', err.response);
      console.error('[Chi-Square Sample Size] Error data:', err.response?.data);
      
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || 'Failed to calculate sample size';
      
      console.error('[Chi-Square Sample Size] Error message:', errorMessage);
      setError(errorMessage);
      toaster.error({ body: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const onCloseModal = () => {
    onClose();
  };

  if (!open) return null;

  // Data Selection Step
  if (!showCalculation) {
    return (
      <Modal
        open={open}
        closeModal={() => onCloseModal()}
        openModal={() => {}}
        toggleModal={() => {}}
        title="Chi-Square Sample Size - Select Data Columns"
        size="large"
        showCancel={true}
        showOk={true}
        cancelLabel="Cancel"
        okLabel="Next"
        cancel={{
          onClick: onCloseModal,
        }}
        ok={{
          onClick: () => setShowCalculation(true),
          disabled: selectedDataBlocks.length === 0 || loadingDataBlocks,
        }}
      >
        <div style={{ padding: '16px 0' }}>
          {error && (
            <div style={{ 
              marginBottom: '16px',
              color: tokens.colorPaletteRedForeground1, 
              padding: '12px', 
              background: tokens.colorPaletteRedBackground1,
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className={dataSelectionClasses.dataSelectionLayout}>
            {/* Available Columns */}
            <Fieldset title="Available Columns">
              <div className={dataSelectionClasses.sectionAvailable}>
                <div className={dataSelectionClasses.selectAllContainer}>
                  <Checkbox
                    label={`Select All (${availableDataBlocks.length})`}
                    checked={selectAllAvailable}
                    onChange={handleSelectAllAvailable}
                  />
                </div>
                <div className="column-list">
                  {loadingDataBlocks ? (
                    <div style={{ padding: '16px', textAlign: 'center' }}>
                      <Spinner size="small" label="Loading columns..." />
                    </div>
                  ) : availableDataBlocks.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: tokens.colorNeutralForeground3 }}>
                      No columns available
                    </div>
                  ) : (
                    availableDataBlocks.map(block => (
                      <div key={block.id} className={dataSelectionClasses.columnItem}>
                        <Checkbox
                          label={block.name}
                          checked={block.selected || false}
                          onChange={() => handleToggleAvailable(block.id)}
                        />
                      </div>
                    ))
                  )}
                </div>
                <Button
                  icon={<MdKeyboardDoubleArrowRight />}
                  className="send-button"
                  onClick={handleMoveToSelected}
                  disabled={!availableDataBlocks.some(b => b.selected)}
                >
                  Add to Selected
                </Button>
              </div>
            </Fieldset>

            {/* Selected Columns */}
            <Fieldset title="Selected Columns">
              <div className={dataSelectionClasses.sectionAvailable}>
                <div className={dataSelectionClasses.selectAllContainer}>
                  <Checkbox
                    label={`Select All (${selectedDataBlocks.length})`}
                    checked={selectAllSelected}
                    onChange={handleSelectAllSelected}
                  />
                </div>
                <div className="column-list">
                  {selectedDataBlocks.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: tokens.colorNeutralForeground3 }}>
                      No columns selected
                    </div>
                  ) : (
                    selectedDataBlocks.map(block => (
                      <div key={block.id} className={dataSelectionClasses.columnItem}>
                        <Checkbox
                          label={block.name}
                          checked={block.selected || false}
                          onChange={() => handleToggleSelected(block.id)}
                        />
                      </div>
                    ))
                  )}
                </div>
                <Button
                  icon={<MdOutlineRemove />}
                  className="remove-button"
                  onClick={handleRemoveFromSelected}
                  disabled={!selectedDataBlocks.some(b => b.selected)}
                >
                  Remove Selected
                </Button>
              </div>
            </Fieldset>
          </div>
        </div>
      </Modal>
    );
  }

  // Calculation Step
  return (
    <>
      <Modal
        open={open}
        closeModal={() => onCloseModal()}
        openModal={() => {}}
        toggleModal={() => {}}
        title="Chi-Square Sample Size Calculator"
        size="medium"
        showCancel={false}
        showOk={false}
      >
        <div className={classes.sampleSizeWrapper}>
          {/* Error Display */}
          {error && (
            <div className={classes.errorCard}>
              <Label className={classes.errorLabel}>Error</Label>
              <div className={classes.errorValue}>{error}</div>
            </div>
          )}

          {/* Sample Size Result Display */}
          {result > 0 && (
            <div className={classes.resultCard}>
              <div className={classes.resultLabel}>Sample Size:</div>
              <div className={classes.resultValue}>{result}</div>
            </div>
          )}

          {/* Loading Message */}
          {loading && (
            <div className={classes.loadingMessage}>
              Calculating sample size...
            </div>
          )}

          {/* Form */}
          <div className={classes.formSection}>
            {/* Back Navigation */}
            <div style={{ marginBottom: '16px' }}>
              <Button
                appearance="transparent"
                onClick={() => setShowCalculation(false)}
                style={{ 
                  padding: '4px 8px',
                  minWidth: 'auto',
                  fontSize: '13px',
                  color: tokens.colorBrandForeground1
                }}
              >
                ← Back to Data Selection
              </Button>
            </div>

            <div className={classes.formContainer}>
              <div className={classes.inputRow}>
                <div className={classes.inputField}>
                  <Label className={classes.label} htmlFor="desired_power">Desired Power</Label>
                  <Input
                    className={classes.input}
                    id="desired_power"
                    type="number"
                    placeholder="0.8"
                    value={String(formData.desired_power)}
                    onChange={(e) => handleInputChange('desired_power', e.target.value)}
                    step="0.01"
                    min="0.1"
                    max="0.99"
                  />
                </div>
                <div className={classes.inputField}>
                  <Label className={classes.label} htmlFor="alpha">Alpha</Label>
                  <Input
                    className={classes.input}
                    id="alpha"
                    type="number"
                    placeholder="0.05"
                    value={String(formData.alpha)}
                    onChange={(e) => handleInputChange('alpha', e.target.value)}
                    step="0.01"
                    min="0.01"
                    max="0.5"
                  />
                </div>
              </div>
              <div className={classes.checkboxContainer}>
                <Checkbox
                  id="yates_correction"
                  label="Apply Yates Correction"
                  checked={formData.yates_correction}
                  onChange={(e) => handleInputChange('yates_correction', e.target.checked)}
                />
              </div>
              <div className={classes.calculateButtonContainer}>
                <Button
                  appearance="outline"
                  className={classes.saveButton}
                  onClick={() => projectModal.openModal()}
                  disabled={!result}
                >
                  Save to Report
                </Button>
                <Button
                  appearance="subtle"
                  className={classes.calculateButton}
                  onClick={handleCalculate}
                  disabled={loading}
                >
                  {loading ? 'Calculating...' : 'Calculate Sample Size'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    
    {/* Project Selection Modal */}
    <ProjectSelectionModal
      open={projectModal.open}
      onClose={projectModal.closeModal}
      onSelectProject={handleSelectProject}
    />
  </>
  );
};

export default ChiSquareSampleSizeModal;

export { ChiSquareSampleSizeModal }; 