export const generateKey = (list: Map<string, boolean>) => {
  let key = '';
  Array.from(list.entries()).forEach(([k, v]) => {
    key += `${k}-${v}`;
  });
  return key;
};

export const generateExcelColumn = (n: number) => {
  let col = '';
  while (n > 0) {
    n--;
    col = String.fromCharCode((n % 26) + 65) + col;
    n = Math.floor(n / 26);
  }
  return col;
};

export const isValidWorkspacePath = (path: string | undefined): boolean => {
  if (!path || path === '') return false;

  // Check if it looks like a time string (hh:mm:ss AM/PM)
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9] (AM|PM)$/i;
  if (timeRegex.test(path)) return false;

  // Basic check for path-like structure (contains backslash or forward slash, or ends with .db)
  // or just check that it's NOT a time string and is long enough
  return path.includes('\\') || path.includes('/') || path.endsWith('.db') || path.length > 15;
};
