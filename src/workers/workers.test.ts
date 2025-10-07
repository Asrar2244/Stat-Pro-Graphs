/**
 * Workers test file
 * Testing worker initialization and exports
 */

// Mock ComlinkWorker globally
global.ComlinkWorker = jest.fn().mockImplementation((url: any, options: any) => {
  return {
    url,
    options,
    terminate: jest.fn(),
  };
}) as any;

// Mock comlink
jest.mock('comlink', () => ({
  expose: jest.fn(),
  wrap: jest.fn(),
  transfer: jest.fn(),
}));

describe('Workers', () => {
  describe('data-gen-worker', () => {
    it('should initialize dataGenWorker', () => {
      const { dataGenWorker } = require('./data-gen-worker');
      expect(dataGenWorker).toBeDefined();
    });

    it('should create worker with correct name', () => {
      const { dataGenWorker } = require('./data-gen-worker');
      expect(dataGenWorker.options.name).toBe('dataComlink');
    });
  });

  describe('table-gen-worker', () => {
    it('should initialize tableWorker', () => {
      const { tableWorker } = require('./table-gen-worker');
      expect(tableWorker).toBeDefined();
    });

    it('should create worker with correct name', () => {
      const { tableWorker } = require('./table-gen-worker');
      expect(tableWorker.options.name).toBe('tableComlink');
    });

    it('should expose workerTransFunction', () => {
      const { expose } = require('comlink');
      require('./table-gen-worker');
      expect(expose).toHaveBeenCalled();
    });
  });

  describe('graph-worker', () => {
    it('should initialize graphWorker', () => {
      const { graphWorker } = require('./graph-worker');
      expect(graphWorker).toBeDefined();
    });
  });

  describe('Worker termination', () => {
    it('should support worker termination', () => {
      const { dataGenWorker } = require('./data-gen-worker');
      expect(dataGenWorker.terminate).toBeDefined();
      expect(typeof dataGenWorker.terminate).toBe('function');
    });
  });

  describe('Worker URL handling', () => {
    it('should handle worker URL correctly', () => {
      const { dataGenWorker } = require('./data-gen-worker');
      expect(dataGenWorker.url).toBeDefined();
    });
  });
});
