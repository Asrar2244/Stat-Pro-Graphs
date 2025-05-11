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
