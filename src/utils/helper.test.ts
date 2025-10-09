import { generateKey, generateExcelColumn } from './helper';

describe('utils/helper', () => {
  describe('generateKey', () => {
    it('should generate key from empty map', () => {
      const map = new Map<string, boolean>();
      const result = generateKey(map);
      expect(result).toBe('');
    });

    it('should generate key from single entry', () => {
      const map = new Map<string, boolean>();
      map.set('option1', true);
      const result = generateKey(map);
      expect(result).toBe('option1-true');
    });

    it('should generate key from multiple entries', () => {
      const map = new Map<string, boolean>();
      map.set('option1', true);
      map.set('option2', false);
      map.set('option3', true);
      const result = generateKey(map);
      expect(result).toBe('option1-trueoption2-falseoption3-true');
    });

    it('should handle boolean false values', () => {
      const map = new Map<string, boolean>();
      map.set('disabled', false);
      const result = generateKey(map);
      expect(result).toBe('disabled-false');
    });

    it('should maintain order of entries', () => {
      const map = new Map<string, boolean>();
      map.set('a', true);
      map.set('b', false);
      map.set('c', true);
      const result = generateKey(map);
      expect(result).toBe('a-trueb-falsec-true');
    });

    it('should handle special characters in keys', () => {
      const map = new Map<string, boolean>();
      map.set('option-1', true);
      map.set('option_2', false);
      const result = generateKey(map);
      expect(result).toBe('option-1-trueoption_2-false');
    });

    it('should handle long key names', () => {
      const map = new Map<string, boolean>();
      map.set('veryLongOptionNameThatExceedsNormalLength', true);
      const result = generateKey(map);
      expect(result).toBe('veryLongOptionNameThatExceedsNormalLength-true');
    });
  });

  describe('generateExcelColumn', () => {
    it('should generate column A for 1', () => {
      expect(generateExcelColumn(1)).toBe('A');
    });

    it('should generate column B for 2', () => {
      expect(generateExcelColumn(2)).toBe('B');
    });

    it('should generate column Z for 26', () => {
      expect(generateExcelColumn(26)).toBe('Z');
    });

    it('should generate column AA for 27', () => {
      expect(generateExcelColumn(27)).toBe('AA');
    });

    it('should generate column AB for 28', () => {
      expect(generateExcelColumn(28)).toBe('AB');
    });

    it('should generate column AZ for 52', () => {
      expect(generateExcelColumn(52)).toBe('AZ');
    });

    it('should generate column BA for 53', () => {
      expect(generateExcelColumn(53)).toBe('BA');
    });

    it('should generate column ZZ for 702', () => {
      expect(generateExcelColumn(702)).toBe('ZZ');
    });

    it('should generate column AAA for 703', () => {
      expect(generateExcelColumn(703)).toBe('AAA');
    });

    it('should generate column ABC for 731', () => {
      expect(generateExcelColumn(731)).toBe('ABC');
    });

    it('should handle large numbers', () => {
      expect(generateExcelColumn(1000)).toBe('ALL');
    });

    it('should handle very large numbers', () => {
      expect(generateExcelColumn(16384)).toBe('XFD');
    });

    it('should generate sequential columns correctly', () => {
      const columns = [1, 2, 3, 4, 5].map(n => generateExcelColumn(n));
      expect(columns).toEqual(['A', 'B', 'C', 'D', 'E']);
    });

    it('should handle boundary between Z and AA', () => {
      expect(generateExcelColumn(25)).toBe('Y');
      expect(generateExcelColumn(26)).toBe('Z');
      expect(generateExcelColumn(27)).toBe('AA');
      expect(generateExcelColumn(28)).toBe('AB');
    });

    it('should handle boundary between AZ and BA', () => {
      expect(generateExcelColumn(51)).toBe('AY');
      expect(generateExcelColumn(52)).toBe('AZ');
      expect(generateExcelColumn(53)).toBe('BA');
    });
  });
});
