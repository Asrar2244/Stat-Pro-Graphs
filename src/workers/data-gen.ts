import { CellBase, Matrix } from 'react-spreadsheet';

export const arrayArrayString = (data: Matrix<CellBase>) => {
  const newData: Array<Array<string>> = [];
  for (let i = 0; i < data.length; i++) {
    const row: Array<string> = [];
    for (let j = 0; j < data[i].length; j++) {
      const cell = data[i][j];
      if (cell?.value) {
        row.push(cell.value);
      }
    }
    if (row.length > 0) {
      newData.push(row);
    }
  }
  return newData;
};


const sanitizeHeader = (header: string): string => {
  // Replace all non-alphanumeric characters with underscores
  // Collapse multiple underscores and remove leading/trailing ones
  return header
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

const isNumericRow = (row: Array<string | null>): boolean => {
  const hasContent = row.some((cell) => cell !== null && cell !== '');
  if (!hasContent) return false;
  return row.every((cell) => cell === null || cell === '' || !isNaN(Number(cell)));
};

const generateDefaultHeaders = (count: number): Array<string | null> => {
  const headers: Array<string | null> = [];
  for (let i = 0; i < count; i++) {
    // Generate Column_A, Column_B, ..., Column_Z, Column_A1, Column_B1...
    const char = String.fromCharCode(65 + (i % 26));
    const suffix = i >= 26 ? Math.floor(i / 26) : '';
    headers.push(`Column_${char}${suffix}`);
  }
  return headers;
};

const makeHeadersUnique = (row: Array<string | null>): Array<string | null> => {
  const usedHeaders = new Set<string>();

  return row.map((cell) => {
    // default header for empty cells
    let header = 'Column';

    if (cell !== null && cell !== undefined && cell !== '') {
      header = sanitizeHeader(cell);
    }

    // If header becomes empty after sanitization (e.g. "!!!"), fallback to "Column"
    if (!header) {
      header = 'Column';
    }

    // If strictly unique, return as is
    if (!usedHeaders.has(header)) {
      usedHeaders.add(header);
      return header;
    }

    // Collision detected: append counter until unique
    let counter = 1;
    let newHeader = `${header}_${counter}`;
    while (usedHeaders.has(newHeader)) {
      counter++;
      newHeader = `${header}_${counter}`;
    }

    usedHeaders.add(newHeader);
    return newHeader;
  });
};

export const getFormattedData = (data: Matrix<CellBase>, _columns: Record<string, string>) => {
  // OPTIMIZED: Use efficient loops instead of map/filter to prevent crashes with huge datasets
  // Convert empty cells to null instead of empty strings
  // This ensures empty cells are stored as null in the database
  const rows: Array<Array<string | null>> = [];
  const dataLength = data.length;


  // CRITICAL: First, find the maximum column index that contains actual data across ALL rows
  // This prevents extra empty columns (like Column F, G, etc.) from being created in DB
  let maxActiveCol = -1;
  for (let i = 0; i < dataLength; i++) {
    const row = data[i];
    if (!Array.isArray(row)) continue;

    // Scan backwards from the end of the row to find the last non-empty cell
    for (let j = row.length - 1; j >= 0; j--) {
      const cell = row[j];
      const value = cell?.value;
      if (value !== null && value !== undefined && value !== '') {
        if (j > maxActiveCol) maxActiveCol = j;
        break; // Found last non-empty cell in this row
      }
    }
  }

  // If no data found at all, we might want a minimum of 1 column, but let's follow the data
  const columnCount = maxActiveCol + 1;
  if (columnCount === 0) return [];



  // Use for loop instead of map for better performance with large datasets
  for (let i = 0; i < dataLength; i++) {
    const row = data[i];
    if (!Array.isArray(row)) {
      rows.push(new Array(columnCount).fill(null));
      continue;
    }


    const formattedRow: Array<string | null> = [];
    // Only process up to columnCount to trim trailing empty columns
    for (let j = 0; j < columnCount; j++) {
      const cell = row[j];
      if (!cell || typeof cell !== 'object') {
        formattedRow.push(null);
        continue;
      }


      const value = cell.value;
      // Return null for empty/undefined values, otherwise return the value as string
      if (value === null || value === undefined || value === '') {
        formattedRow.push(null);
      } else {
        formattedRow.push(String(value));
      }
    }


    // CRITICAL: Handle the first row
    if (i === 0) {
      // Check if the first row is numeric (treat as data)
      if (isNumericRow(formattedRow)) {
        // Generate default headers and push the numeric row as data
        const defaultHeaders = generateDefaultHeaders(formattedRow.length);
        rows.push(defaultHeaders);
        rows.push(formattedRow);
      } else {
        // Make headers unique for the first row
        rows.push(makeHeadersUnique(formattedRow));
      }
    } else {
      rows.push(formattedRow);
    }
  }


  return rows;
};
