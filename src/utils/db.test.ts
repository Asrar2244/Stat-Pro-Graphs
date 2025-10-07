import { Database } from './db';
import DB from '@tauri-apps/plugin-sql';
import { join } from '@tauri-apps/api/path';
import { homeDirectory } from './app-apis';
import { CONFIGURATION_DB } from '@constants';

jest.mock('@tauri-apps/plugin-sql');
jest.mock('@tauri-apps/api/path');
jest.mock('./app-apis');
jest.mock('@constants', () => ({
  CONFIGURATION_DB: 'config.db',
}));

describe('utils/db', () => {
  let mockDbInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDbInstance = {
      execute: jest.fn(),
      select: jest.fn(),
    };

    (DB.load as jest.Mock).mockResolvedValue(mockDbInstance);
    (homeDirectory as jest.Mock).mockResolvedValue('/home/user/.app');
    (join as jest.Mock).mockImplementation((...args) => args.join('/'));

    // Mock console.log to avoid clutter in test output
    jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should load database with correct path for regular db', async () => {
      new Database('test.db');

      // Wait for async constructor
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(DB.load).toHaveBeenCalledWith('sqlite:test.db');
    });

    it('should load configuration database from collections folder', async () => {
      new Database(CONFIGURATION_DB);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(homeDirectory).toHaveBeenCalled();
      expect(join).toHaveBeenCalledWith('/home/user/.app', 'collections', CONFIGURATION_DB);
      expect(DB.load).toHaveBeenCalledWith('sqlite:/home/user/.app/collections/config.db');
    });

    it('should handle different database names', async () => {
      const dbNames = ['user.db', 'analytics.db', 'cache.db'];

      for (const dbName of dbNames) {
        new Database(dbName);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      expect(DB.load).toHaveBeenCalledTimes(dbNames.length);
    });
  });

  describe('executeQuery', () => {
    it('should execute query successfully', async () => {
      mockDbInstance.execute.mockResolvedValue({ lastInsertId: 1, rowsAffected: 1 });

      const db = new Database('test.db');
      const result = await db.executeQuery('INSERT INTO users VALUES (?, ?)', ['John', 'Doe']);

      expect(mockDbInstance.execute).toHaveBeenCalledWith('INSERT INTO users VALUES (?, ?)', [
        'John',
        'Doe',
      ]);
      expect(result).toEqual({ lastInsertId: 1, rowsAffected: 1 });
    });

    it('should reject empty query', async () => {
      const db = new Database('test.db');

      await expect(db.executeQuery('')).rejects.toBe('Query can not be empty');
    });

    it('should execute query without parameters', async () => {
      mockDbInstance.execute.mockResolvedValue({ rowsAffected: 5 });

      const db = new Database('test.db');
      const result = await db.executeQuery('DELETE FROM users WHERE active = 0');

      expect(mockDbInstance.execute).toHaveBeenCalledWith(
        'DELETE FROM users WHERE active = 0',
        undefined,
      );
      expect(result).toEqual({ rowsAffected: 5 });
    });

    it('should handle query with empty parameters array', async () => {
      mockDbInstance.execute.mockResolvedValue({ lastInsertId: 10 });

      const db = new Database('test.db');
      await db.executeQuery('CREATE TABLE test (id INTEGER)', []);

      expect(mockDbInstance.execute).toHaveBeenCalledWith('CREATE TABLE test (id INTEGER)', []);
    });

    it('should handle query execution errors', async () => {
      mockDbInstance.execute.mockRejectedValue(new Error('SQL syntax error'));

      const db = new Database('test.db');

      await expect(db.executeQuery('INVALID SQL')).rejects.toThrow('SQL syntax error');
    });

    it('should handle null and undefined parameters', async () => {
      mockDbInstance.execute.mockResolvedValue({ lastInsertId: 1 });

      const db = new Database('test.db');
      await db.executeQuery('INSERT INTO users VALUES (?, ?)', [null, undefined]);

      expect(mockDbInstance.execute).toHaveBeenCalledWith('INSERT INTO users VALUES (?, ?)', [
        null,
        undefined,
      ]);
    });

    it('should handle multiple query types', async () => {
      const db = new Database('test.db');

      // INSERT
      mockDbInstance.execute.mockResolvedValueOnce({ lastInsertId: 1 });
      await db.executeQuery('INSERT INTO users VALUES (?)', ['test']);

      // UPDATE
      mockDbInstance.execute.mockResolvedValueOnce({ rowsAffected: 3 });
      await db.executeQuery('UPDATE users SET name = ?', ['updated']);

      // DELETE
      mockDbInstance.execute.mockResolvedValueOnce({ rowsAffected: 2 });
      await db.executeQuery('DELETE FROM users WHERE id = ?', [1]);

      // CREATE
      mockDbInstance.execute.mockResolvedValueOnce({});
      await db.executeQuery('CREATE TABLE test (id INTEGER)');

      expect(mockDbInstance.execute).toHaveBeenCalledTimes(4);
    });

    it('should handle transaction queries', async () => {
      mockDbInstance.execute.mockResolvedValue({});

      const db = new Database('test.db');
      await db.executeQuery('BEGIN;INSERT INTO users VALUES (1);COMMIT;');

      expect(mockDbInstance.execute).toHaveBeenCalled();
    });

    it('should handle complex parameters', async () => {
      mockDbInstance.execute.mockResolvedValue({ lastInsertId: 1 });

      const db = new Database('test.db');
      const jsonData = JSON.stringify({ nested: { data: 'value' } });

      await db.executeQuery('INSERT INTO data VALUES (?, ?, ?)', [
        jsonData,
        new Date().toISOString(),
        12345,
      ]);

      expect(mockDbInstance.execute).toHaveBeenCalled();
    });
  });

  describe('selectQuery', () => {
    it('should select data successfully', async () => {
      const mockData = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ];
      mockDbInstance.select.mockResolvedValue(mockData);

      const db = new Database('test.db');
      const result = await db.selectQuery('SELECT * FROM users');

      expect(mockDbInstance.select).toHaveBeenCalledWith('SELECT * FROM users', undefined);
      expect(result).toEqual(mockData);
    });

    it('should reject empty query', async () => {
      const db = new Database('test.db');

      await expect(db.selectQuery('')).rejects.toBe('Query can not be empty');
    });

    it('should select with parameters', async () => {
      const mockData = [{ id: 1, name: 'John' }];
      mockDbInstance.select.mockResolvedValue(mockData);

      const db = new Database('test.db');
      const result = await db.selectQuery('SELECT * FROM users WHERE id = ?', [1]);

      expect(mockDbInstance.select).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [1]);
      expect(result).toEqual(mockData);
    });

    it('should handle empty result set', async () => {
      mockDbInstance.select.mockResolvedValue([]);

      const db = new Database('test.db');
      const result = await db.selectQuery('SELECT * FROM users WHERE id = 999');

      expect(result).toEqual([]);
    });

    it('should handle select query errors', async () => {
      mockDbInstance.select.mockRejectedValue(new Error('Table does not exist'));

      const db = new Database('test.db');

      await expect(db.selectQuery('SELECT * FROM nonexistent')).rejects.toThrow(
        'Table does not exist',
      );
    });

    it('should handle multiple parameters', async () => {
      const mockData = [{ id: 1, name: 'John', age: 30 }];
      mockDbInstance.select.mockResolvedValue(mockData);

      const db = new Database('test.db');
      const result = await db.selectQuery(
        'SELECT * FROM users WHERE name = ? AND age > ? AND active = ?',
        ['John', 25, true],
      );

      expect(mockDbInstance.select).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE name = ? AND age > ? AND active = ?',
        ['John', 25, true],
      );
      expect(result).toEqual(mockData);
    });

    it('should handle complex SELECT queries', async () => {
      const mockData = [{ total: 100, avg: 50 }];
      mockDbInstance.select.mockResolvedValue(mockData);

      const db = new Database('test.db');
      const result = await db.selectQuery(`
        SELECT COUNT(*) as total, AVG(age) as avg
        FROM users
        WHERE created_at > ?
        GROUP BY department
      `, ['2024-01-01']);

      expect(result).toEqual(mockData);
    });

    it('should handle JOIN queries', async () => {
      const mockData = [
        { userId: 1, userName: 'John', orderId: 1, orderTotal: 100 },
      ];
      mockDbInstance.select.mockResolvedValue(mockData);

      const db = new Database('test.db');
      const result = await db.selectQuery(`
        SELECT u.id as userId, u.name as userName, o.id as orderId, o.total as orderTotal
        FROM users u
        JOIN orders o ON u.id = o.user_id
      `);

      expect(result).toEqual(mockData);
    });

    it('should handle PRAGMA queries', async () => {
      const mockData = [
        { name: 'col1', type: 'INTEGER' },
        { name: 'col2', type: 'TEXT' },
      ];
      mockDbInstance.select.mockResolvedValue(mockData);

      const db = new Database('test.db');
      const result = await db.selectQuery('PRAGMA table_info(users)');

      expect(result).toEqual(mockData);
    });
  });

  // Note: Development mode logging is controlled by import.meta.env.MODE
  // which cannot be easily tested in Jest environment, so we skip these tests

  describe('concurrent operations', () => {
    it('should handle multiple concurrent queries', async () => {
      mockDbInstance.execute.mockResolvedValue({ lastInsertId: 1 });
      mockDbInstance.select.mockResolvedValue([]);

      const db = new Database('test.db');

      const promises = [
        db.executeQuery('INSERT INTO test VALUES (1)'),
        db.selectQuery('SELECT * FROM test'),
        db.executeQuery('UPDATE test SET value = 2'),
        db.selectQuery('SELECT COUNT(*) FROM test'),
      ];

      await Promise.all(promises);

      expect(mockDbInstance.execute).toHaveBeenCalledTimes(2);
      expect(mockDbInstance.select).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple database instances', async () => {
      new Database('db1.db');
      new Database('db2.db');
      new Database(CONFIGURATION_DB);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(DB.load).toHaveBeenCalledTimes(3);
    });
  });

  describe('edge cases', () => {
    it('should handle very long queries', async () => {
      mockDbInstance.execute.mockResolvedValue({});

      const db = new Database('test.db');
      const longQuery = 'SELECT * FROM users WHERE id IN (' + '?,'.repeat(1000) + '?)';

      await db.executeQuery(longQuery, new Array(1001).fill(1));

      expect(mockDbInstance.execute).toHaveBeenCalled();
    });

    it('should handle unicode characters in parameters', async () => {
      mockDbInstance.execute.mockResolvedValue({ lastInsertId: 1 });

      const db = new Database('test.db');
      await db.executeQuery('INSERT INTO users VALUES (?, ?)', ['测试', '🚀']);

      expect(mockDbInstance.execute).toHaveBeenCalledWith('INSERT INTO users VALUES (?, ?)', [
        '测试',
        '🚀',
      ]);
    });

    it('should handle special database file paths', async () => {
      const specialPaths = [
        '/path/with spaces/db.sqlite',
        'C:\\Windows\\Path\\db.sqlite',
        './relative/path/db.sqlite',
      ];

      for (const path of specialPaths) {
        new Database(path);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(DB.load).toHaveBeenCalledTimes(specialPaths.length);
    });
  });
});
