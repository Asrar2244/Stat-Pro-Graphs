import { useTranslation } from 'react-i18next';
import { uniqueNumber } from '@utils';
import { useNodeActions } from '../layout-nodes';
import dayjs from 'dayjs';
type IMenuCodeExecutor = {
  id: string;
};

export const useMenuCodeExecutor = () => {
  const { openNewTab } = useNodeActions();
  const { t } = useTranslation('workspace');
  const openNewTabForGraph = (input: IMenuCodeExecutor) => {
    const numb = uniqueNumber();
    openNewTab(
      {
        fileSize: '',
        isOpenedData: numb,
        isActive: numb,
        modifiedDateTime: '',
        createdDateTime: '',
        isOpenedOutput: numb,
        workspacePath: dayjs().format('hh:mm:ss A'),
        id: numb.toString(),
        sheetId: input.id,
        inputFileName: input.id,
        projectName: dayjs().format('YYYY-MM-DD'),
      },
      numb,
      'GRAPH',
      t,
    );
  };

  return { openNewTabForGraph };
};
