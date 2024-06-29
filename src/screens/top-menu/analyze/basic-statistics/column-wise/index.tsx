import { IModal } from '@hooks';
import { CommonStatistics } from '../common-popup';

export const ColumnWise: React.FC<IModal> = (props) => {
  return <CommonStatistics {...props} type="column" />;
};
