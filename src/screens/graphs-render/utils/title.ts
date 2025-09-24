export const friendlyTitleForGraph = (graphType: string, subType?: string): string => {
  if (!graphType) return 'Unknown Graph';
  
  const baseTitle = graphType.replace(/([A-Z])/g, ' $1').trim();
  const subTitle = subType ? ` - ${subType}` : '';
  
  return `${baseTitle}${subTitle}`;
};








