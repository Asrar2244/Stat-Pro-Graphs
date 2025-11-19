import { FC, useState, useEffect } from 'react';
import { Input, Label, Spinner, Checkbox, Dropdown, Option } from '@fluentui/react-components';
import { tokens } from '@fluentui/react-components';
import { useActiveNode, useToaster } from '@hooks';
import { Database } from '@utils/db';
import { EXCEL } from '@constants/db';
import { useEmptyDataStore } from '@store';
import { Modal } from '@libs';

interface ChiSquareSampleSizeModalProps {
  open: boolean;
  onClose: () => void;
}

interface DataBlock {
  id: string;
  name: string;
  data: any[][];
}

const ChiSquareSampleSizeModal: FC<ChiSquareSampleSizeModalProps> = ({ 
  open, 
  onClose
}) => {
  const [showCalculation, setShowCalculation] = useState(false);
  const [result, setResult] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [availableDataBlocks, setAvailableDataBlocks] = useState<DataBlock[]>([]);
  const [loadingDataBlocks, setLoadingDataBlocks] = useState(false);
  const [formData, setFormData] = useState({
    desired_power: 0.8,
    alpha: 0.05,
    yates_correction: false
  });

  const { config } = useActiveNode([open]);
  const toaster = useToaster();
  
  // Access global empty data store
  const { spreadsheetData } = useEmptyDataStore();

  // Add state for selected columns
  const [selectedColumns, setSelectedColumns] = useState<DataBlock[]>([]);

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
            data: filteredColData.map(val => [val]) // keep as array of arrays for backend
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
          // Extract data for this column
          const columnData = result
            .map((row: any) => [row[columnName]])
            .filter((row: any) => row[0] !== null && row[0] !== undefined && row[0] !== '');
          
          if (columnData.length > 0) {
            blocks.push({
              id: `column_${columnName}`,
              name: `${columnName} (${columnData.length} values)`,
              data: columnData
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
    if (!selectedColumns.length) {
      toaster.error({ body: 'Please select at least one data block' });
      return;
    }

    setLoading(true);
    setError('');
    setResult(0);

    try {
      // Prepare data for API
      const data = selectedColumns.map(col => col.data.map(row => row[0]));
      
      const requestBody = {
        alpha: parseFloat(formData.alpha.toString()),
        desired_power: parseFloat(formData.desired_power.toString()),
        yates_correction: formData.yates_correction,
        data: data
      };

      const response = await fetch('http://127.0.0.1:5000/sample_size/api/chisquare-sample-size', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const json = await response.json();
        setResult(json.sample_size);
        toaster.success({ body: 'Sample size calculated successfully!' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to calculate sample size.');
        toaster.error({ body: errorData.message || 'Failed to calculate sample size.' });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate sample size';
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
        title="Chi-Square Sample Size - Select Data"
        size="large"
        showCancel
        cancelLabel="Cancel"
        okLabel="Next"
        cancel={{
          onClick: onCloseModal,
        }}
        ok={{
          onClick: () => setShowCalculation(true),
          disabled: selectedColumns.length === 0 || loadingDataBlocks,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Label weight="semibold" style={{ marginBottom: '8px', display: 'block' }}>
              Select Data Columns for Chi-Square Test
            </Label>
            <div style={{ fontSize: '14px', color: tokens.colorNeutralForeground2, marginBottom: '12px' }}>
              Available columns with data from your current view:
              {availableDataBlocks.length > 0 && (
                <span style={{ fontWeight: '600', color: tokens.colorNeutralForeground1, marginLeft: '8px' }}>
                  ({availableDataBlocks.length} column{availableDataBlocks.length !== 1 ? 's' : ''} with data)
                </span>
              )}
            </div>
            <Dropdown
              multiselect
              placeholder="Select columns..."
              selectedOptions={selectedColumns.map(col => col.id)}
              onOptionSelect={(_, data) => {
                const selected = availableDataBlocks.filter(block => data.selectedOptions.includes(block.id));
                setSelectedColumns(selected);
              }}
              style={{ width: '100%', marginBottom: '12px' }}
            >
              {availableDataBlocks.map(block => (
                <Option key={block.id} value={block.id}>
                  {block.name}
                </Option>
              ))}
            </Dropdown>
            <div style={{ marginTop: '8px', fontSize: '13px', color: tokens.colorNeutralForeground2 }}>
              <strong>Selected Columns:</strong>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {selectedColumns.length === 0 && <li style={{ color: tokens.colorNeutralForeground3 }}>None</li>}
                {selectedColumns.map(col => (
                  <li key={col.id}>{col.name}</li>
                ))}
              </ul>
            </div>
          </div>

          {error && (
            <div style={{ 
              marginTop: '8px',
              color: tokens.colorPaletteRedForeground1, 
              padding: '12px', 
              background: tokens.colorPaletteRedBackground1,
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </Modal>
    );
  }

  // Calculation Step
  return (
    <Modal
      open={open}
      closeModal={() => onCloseModal()}
      openModal={() => {}}
      toggleModal={() => {}}
      title="Chi-Square Sample Size Calculator"
      size="medium"
      showCancel
      cancelLabel="Back"
      okLabel={loading ? 'Calculating...' : 'Calculate'}
      cancel={{
        onClick: () => setShowCalculation(false),
      }}
      ok={{
        onClick: handleCalculate,
        disabled: loading,
        icon: loading ? <Spinner size="tiny" /> : undefined,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {result > 0 && (
          <div style={{ 
            padding: '16px', 
            background: tokens.colorNeutralBackground2,
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Label style={{ fontSize: '16px', fontWeight: '600' }}>
              Calculated Sample Size: {result}
            </Label>
          </div>
        )}

        <div>
          <Label style={{ marginBottom: '8px', display: 'block', fontWeight: '500' }}>
            Desired Power
          </Label>
          <Input 
            type="number" 
            value={String(formData.desired_power)}
            onChange={(e) => handleInputChange('desired_power', e.target.value)}
            step="0.01" 
            min="0.1" 
            max="0.99"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <Label style={{ marginBottom: '8px', display: 'block', fontWeight: '500' }}>
            Alpha Level
          </Label>
          <Input 
            type="number" 
            value={String(formData.alpha)}
            onChange={(e) => handleInputChange('alpha', e.target.value)}
            step="0.01" 
            min="0.01" 
            max="0.5"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <Checkbox
            id="yates_correction"
            label="Yates Correction"
            checked={formData.yates_correction}
            onChange={(e) => handleInputChange('yates_correction', e.target.checked)}
          />
        </div>

        {error && (
          <div style={{ 
            color: tokens.colorPaletteRedForeground1, 
            padding: '12px', 
            background: tokens.colorPaletteRedBackground1,
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ChiSquareSampleSizeModal;

export { ChiSquareSampleSizeModal }; 