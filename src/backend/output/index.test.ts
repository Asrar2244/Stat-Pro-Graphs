import {
  fetchSingleOutput,
  fetchRunListOutput,
  fetchSelected,
  deleteByIDOutputTable,
  outputGenerateIDTable,
  outputTable,
  outputUpdateResult,
  createOutputTable,
  insertToOutputTable,
  generateIDOutputTable,
  updateOutputResult,
  deleteByIDOutputTableQuery,
} from './index';
import { Database } from '@utils';
import { OUTPUT } from '@constants';

// Mock the Database class
jest.mock('@utils', () => ({
  Database: jest.fn().mockImplementation(() => ({
    selectQuery: jest.fn(),
    executeQuery: jest.fn(),
  })),
}));

describe('backend/output', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = {
      selectQuery: jest.fn(),
      executeQuery: jest.fn(),
    };
    (Database as jest.Mock).mockImplementation(() => mockDb);
  });

  describe('fetchSingleOutput', () => {
    it('should fetch and parse a single output record successfully', async () => {
      const mockRecord = {
        id: 1,
        modifiedDateTime: '2024-01-01T00:00:00Z',
        outputFor: 'test-output',
        tabName: 'test-tab',
        result: '{"data":"test"}',
        outputType: 'analysis',
      };

      mockDb.selectQuery.mockResolvedValue([mockRecord]);

      const result = await fetchSingleOutput('test-db', 1);

      expect(Database).toHaveBeenCalledWith('test-db');
      expect(mockDb.selectQuery).toHaveBeenCalledWith(
        `SELECT id,result,tabName,outputFor,outputType,modifiedDateTime FROM ${OUTPUT} WHERE id = 1;`,
        [],
      );
      expect(result).toEqual({
        id: 1,
        modifiedDateTime: '2024-01-01T00:00:00Z',
        outputFor: 'test-output',
        tabName: 'test-tab',
        result: { data: 'test' },
        outputType: 'analysis',
      });
    });

    it('should return undefined when no records found', async () => {
      mockDb.selectQuery.mockResolvedValue([]);

      const result = await fetchSingleOutput('test-db', 999);

      expect(result).toBeUndefined();
    });

    it('should handle empty result string', async () => {
      const mockRecord = {
        id: 1,
        modifiedDateTime: '2024-01-01T00:00:00Z',
        outputFor: 'test-output',
        tabName: 'test-tab',
        result: '',
        outputType: 'analysis',
      };

      mockDb.selectQuery.mockResolvedValue([mockRecord]);

      const result = await fetchSingleOutput('test-db', 1);

      expect(result?.result).toEqual({});
    });

    it('should handle null result string', async () => {
      const mockRecord = {
        id: 1,
        modifiedDateTime: '2024-01-01T00:00:00Z',
        outputFor: 'test-output',
        tabName: 'test-tab',
        result: null,
        outputType: 'analysis',
      };

      mockDb.selectQuery.mockResolvedValue([mockRecord]);

      const result = await fetchSingleOutput('test-db', 1);

      expect(result?.result).toEqual({});
    });

    it('should handle database errors', async () => {
      mockDb.selectQuery.mockRejectedValue(new Error('Database error'));

      await expect(fetchSingleOutput('test-db', 1)).rejects.toThrow('Database error');
    });
  });

  describe('fetchRunListOutput', () => {
    it('should fetch all output records successfully', async () => {
      const mockRecords = [
        {
          id: 2,
          tabName: 'tab2',
          outputFor: 'output2',
          outputType: 'type2',
          modifiedDateTime: '2024-01-02T00:00:00Z',
          result: '{"data2":"test2"}',
        },
        {
          id: 1,
          tabName: 'tab1',
          outputFor: 'output1',
          outputType: 'type1',
          modifiedDateTime: '2024-01-01T00:00:00Z',
          result: '{"data1":"test1"}',
        },
      ];

      mockDb.selectQuery.mockResolvedValue(mockRecords);

      const result = await fetchRunListOutput('test-db');

      expect(Database).toHaveBeenCalledWith('test-db');
      expect(mockDb.selectQuery).toHaveBeenCalledWith(
        `SELECT id,tabName,outputFor,outputType,modifiedDateTime,result\n   FROM ${OUTPUT} ORDER BY id DESC;`,
        [],
      );
      expect(result).toEqual(mockRecords);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2); // Verify DESC order
    });

    it('should return empty array when no records exist', async () => {
      mockDb.selectQuery.mockResolvedValue([]);

      const result = await fetchRunListOutput('test-db');

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockDb.selectQuery.mockRejectedValue(new Error('Connection failed'));

      await expect(fetchRunListOutput('test-db')).rejects.toThrow('Connection failed');
    });
  });

  describe('fetchSelected', () => {
    it('should execute custom query successfully', async () => {
      const customQuery = 'SELECT * FROM output WHERE outputType = "analysis"';
      const mockRecords = [
        { id: 1, outputType: 'analysis' },
        { id: 2, outputType: 'analysis' },
      ];

      mockDb.selectQuery.mockResolvedValue(mockRecords);

      const result = await fetchSelected('test-db', customQuery);

      expect(Database).toHaveBeenCalledWith('test-db');
      expect(mockDb.selectQuery).toHaveBeenCalledWith(customQuery, []);
      expect(result).toEqual(mockRecords);
    });

    it('should handle empty results from custom query', async () => {
      mockDb.selectQuery.mockResolvedValue([]);

      const result = await fetchSelected('test-db', 'SELECT * FROM output WHERE id = 999');

      expect(result).toEqual([]);
    });

    it('should handle malformed queries gracefully', async () => {
      mockDb.selectQuery.mockRejectedValue(new Error('SQL syntax error'));

      await expect(fetchSelected('test-db', 'INVALID SQL')).rejects.toThrow('SQL syntax error');
    });
  });

  describe('deleteByIDOutputTable', () => {
    it('should delete record and return lastInsertId', async () => {
      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 1 });

      const result = await deleteByIDOutputTable('test-db', [1]);

      expect(Database).toHaveBeenCalledWith('test-db');
      expect(mockDb.executeQuery).toHaveBeenCalledWith(deleteByIDOutputTableQuery, [1]);
      expect(result).toBe(1);
    });

    it('should handle deletion of non-existent record', async () => {
      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 0 });

      const result = await deleteByIDOutputTable('test-db', [999]);

      expect(result).toBe(0);
    });

    it('should handle multiple parameter deletion', async () => {
      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 5 });

      const result = await deleteByIDOutputTable('test-db', [1, 2, 3]);

      expect(mockDb.executeQuery).toHaveBeenCalledWith(deleteByIDOutputTableQuery, [1, 2, 3]);
      expect(result).toBe(5);
    });

    it('should handle database errors during deletion', async () => {
      mockDb.executeQuery.mockRejectedValue(new Error('Delete failed'));

      await expect(deleteByIDOutputTable('test-db', [1])).rejects.toThrow('Delete failed');
    });
  });

  describe('outputGenerateIDTable', () => {
    it('should create table and generate ID successfully', async () => {
      const parameters = ['', 'test-tab', 'test-output', 'analysis', '2024-01-01T00:00:00Z'];
      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 42 });

      const result = await outputGenerateIDTable('test-db', parameters);

      expect(Database).toHaveBeenCalledWith('test-db');
      expect(mockDb.executeQuery).toHaveBeenCalledWith(
        `${createOutputTable};${generateIDOutputTable}`,
        parameters,
      );
      expect(result).toBe(42);
    });

    it('should handle empty parameters array', async () => {
      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 1 });

      const result = await outputGenerateIDTable('test-db', []);

      expect(result).toBe(1);
    });

    it('should handle table creation errors', async () => {
      mockDb.executeQuery.mockRejectedValue(new Error('Table creation failed'));

      await expect(outputGenerateIDTable('test-db', [])).rejects.toThrow('Table creation failed');
    });
  });

  describe('outputTable', () => {
    it('should create table and insert record successfully', async () => {
      const parameters = ['params', 'output-for', 'tab-name', '2024-01-01T00:00:00Z', 'type'];
      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 100 });

      const result = await outputTable('test-db', parameters);

      expect(Database).toHaveBeenCalledWith('test-db');
      expect(mockDb.executeQuery).toHaveBeenCalledWith(
        `${createOutputTable};${insertToOutputTable}`,
        parameters,
      );
      expect(result).toBe(100);
    });

    it('should handle insertion with null parameters', async () => {
      const parameters = [null, null, 'tab', '2024-01-01T00:00:00Z', null];
      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 5 });

      const result = await outputTable('test-db', parameters);

      expect(mockDb.executeQuery).toHaveBeenCalledWith(
        `${createOutputTable};${insertToOutputTable}`,
        parameters,
      );
      expect(result).toBe(5);
    });

    it('should handle insertion errors', async () => {
      mockDb.executeQuery.mockRejectedValue(new Error('Insert failed'));

      await expect(outputTable('test-db', [])).rejects.toThrow('Insert failed');
    });
  });

  describe('outputUpdateResult', () => {
    it('should update result successfully', async () => {
      const parameters = ['{"updated":"data"}', 1];
      mockDb.executeQuery.mockResolvedValue({});

      await outputUpdateResult('test-db', parameters);

      expect(Database).toHaveBeenCalledWith('test-db');
      expect(mockDb.executeQuery).toHaveBeenCalledWith(updateOutputResult, parameters);
    });

    it('should handle update with complex JSON', async () => {
      const complexJson = JSON.stringify({
        nested: { deep: { value: 'test' } },
        array: [1, 2, 3],
        boolean: true,
        null: null,
      });
      const parameters = [complexJson, 5];
      mockDb.executeQuery.mockResolvedValue({});

      await outputUpdateResult('test-db', parameters);

      expect(mockDb.executeQuery).toHaveBeenCalledWith(updateOutputResult, [complexJson, 5]);
    });

    it('should handle update with empty string', async () => {
      const parameters = ['', 1];
      mockDb.executeQuery.mockResolvedValue({});

      await outputUpdateResult('test-db', parameters);

      expect(mockDb.executeQuery).toHaveBeenCalledWith(updateOutputResult, parameters);
    });

    it('should handle update errors', async () => {
      mockDb.executeQuery.mockRejectedValue(new Error('Update failed'));

      await expect(outputUpdateResult('test-db', ['{}', 1])).rejects.toThrow('Update failed');
    });
  });

  describe('SQL query constants', () => {
    it('should have correct createOutputTable SQL', () => {
      expect(createOutputTable).toContain('CREATE TABLE IF NOT EXISTS');
      expect(createOutputTable).toContain(OUTPUT);
      expect(createOutputTable).toContain('AUTOINCREMENT');
    });

    it('should have correct insertToOutputTable SQL', () => {
      expect(insertToOutputTable).toContain('INSERT INTO');
      expect(insertToOutputTable).toContain(OUTPUT);
      expect(insertToOutputTable).toContain('VALUES');
    });

    it('should have correct generateIDOutputTable SQL', () => {
      expect(generateIDOutputTable).toContain('INSERT INTO');
      expect(generateIDOutputTable).toContain(OUTPUT);
    });

    it('should have correct updateOutputResult SQL', () => {
      expect(updateOutputResult).toContain('UPDATE');
      expect(updateOutputResult).toContain(OUTPUT);
      expect(updateOutputResult).toContain('SET result = ?');
      expect(updateOutputResult).toContain('WHERE id =?');
    });

    it('should have correct deleteByIDOutputTableQuery SQL', () => {
      expect(deleteByIDOutputTableQuery).toContain('DELETE FROM');
      expect(deleteByIDOutputTableQuery).toContain(OUTPUT);
      expect(deleteByIDOutputTableQuery).toContain('WHERE id = ?');
    });
  });
});
