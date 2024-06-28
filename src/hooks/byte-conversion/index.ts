interface IFileSize {
  kb: (bytes: number) => string;
  mb: (bytes: number) => string;
}
export const useFileSize = (): IFileSize => {
  const kb = (bytes: number): string => (bytes / 1024).toFixed(2) + ' KB';
  const mb = (bytes: number): string => {
    const size = (bytes / (1024 * 1024)).toFixed(2);
    if (Number(size) === 0) {
      return kb(bytes);
    }
    return `${size} MB`;
  };
  return {
    kb,
    mb,
  };
};
