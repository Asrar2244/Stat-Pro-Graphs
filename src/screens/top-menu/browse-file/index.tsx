import { ChangeEvent, FC, FormEvent, useRef, useState } from 'react';
import {
  Field,
  Input,
  Button,
  Dropdown,
  Option,
  makeStyles,
  shorthands,
  tokens,
  Spinner,
} from '@fluentui/react-components';
import { BiDotsHorizontalRounded, BiPlayCircle } from 'react-icons/bi';
import { Modal, ITranslate } from '@libs';
import { IModal, useFileSize, useGetInitialConfig, useAxios, useToaster } from '@hooks';
import { useStartProStore } from '@store';
import { browseFile } from './configurations';
import { useShallow } from 'zustand/react/shallow';
import { volumeDirectory } from '@utils';
// import { volumeName } from '@constants/locale';
import { CONFIGURATION_DB } from '@constants';
import { insertIntoProject } from '@backend';
import { outputTable } from '@backend';
const useBrowseLayout = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalXXS,
  },
  fieldset: {
    ...shorthands.border('none'),
    ...shorthands.padding('0'),
  },
  iconHover: {
    cursor: 'pointer',
  },
  processor: {
    display: 'flex',
    flexDirection: 'row',
  },
});
export const BrowseFile: FC<IModal & ITranslate> = ({ t, ...props }) => {
  const [file, setFile] = useState<string | undefined>(undefined);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [projectExists, setProjectExists] = useState<boolean | undefined>(undefined);
  const [fileSize, setFileSize] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [sheets, setSheets] = useState<string[]>([]);
  const fileHandler = useRef<HTMLInputElement>(null);
  const axios = useAxios();
  const { getConfigurations } = useGetInitialConfig();
  const { mb } = useFileSize();
  const toast = useToaster();
  const { projects, newProject, setNewProject } = useStartProStore(
    useShallow((state) => ({
      projects: state.projects,
      setNewProject: state.setNewProject,
      newProjectName: state.newProject?.name,
      newProject: state.newProject,
    })),
  );

  const classes = useBrowseLayout();
  const onBrowseFileHandler = (): void => {
    if (fileHandler.current) {
      fileHandler.current.click();
    }
  };
  //ToDo
  /* const onChangeFile = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files) {
      try {
        const { path, size, name } = e.target.files[0];
        setLoading(true);
        const { appStoragePath, copyFile } = window.api;
        const appPath = await appStoragePath();
        const volumePath = appPath + '/excelDir/' + name;

        setFileSize(size);
        setFile(path);
        setNewProject('impBusinessObjFile', path);
        setNewProject('fileSize', size.toString());
        copyFile({
          from: path,
          to: volumePath,
          async cb(errorIn, error) {
            if (errorIn) {
              setFile('');
              setNewProject('impBusinessObjFile', '');
              setNewProject('fileSize', '');
              console.error(errorIn, error);
              toast.error({ body: `${errorIn} : ${error?.message}` });
              return;
            }
            const { data } = await axios.post('/api/receive-json', {
              data_name: volumeName + '/excelDir/' + name,
              input_data_type: 'file',
              operation: 'get_timeout',
            });
            if (window.api.getExtension(path).toUpperCase() === '.CSV') {
              setSheets(['Sheet1']);
            } else {
              setSheets(data?.sheet_names);
            }
          },
        });
      } catch (error: any) {
        toast.error({ body: error.message });
      } finally {
        setLoading(false);
      }
    }
  };
  */
  const onOpenChangeHandler = (_e: any, data: any): void => {
    setSelectedSheet(data?.optionValue);
    setNewProject('selectedSheet', data?.optionValue);
  };
  const onSubmitHandler = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const value = e.target.elements.projectName.value;
    setNewProject('name', '');
    setNewProject('fileSize', '');
    setNewProject('impBusinessObjFile', '');
    setNewProject('selectedSheet', '');
    if (value === '') {
      setProjectExists(undefined);
      return;
    }
    const isProjectExists = projects[value];
    const isExists = !!isProjectExists;
    if (!isExists) {
      setNewProject('name', value);
    }
    setProjectExists(isExists);
  };
  //ToDo
  /* const onClickCreateProject = async (): Promise<void> => {
    try {
      if (newProject?.name && newProject?.impBusinessObjFile) {
        const nameAndExtension = window.api.fileNameWithExtension(newProject?.impBusinessObjFile);
        const volumeFilePath = volumeName + '/excelDir/' + nameAndExtension;
        const { data } = await axios.post('/api/receive-json', {
          data_name: volumeFilePath,
          input_data_type: 'file',
          operation: 'store_data_in_db',
          sheet_name: selectedSheet, //'Sheet1', //EXCEL,
          db_location: `${volumeName}/collections`,
        });
        const appPath = await window.api.appStoragePath();
        const actualPath = appPath + '/excelDir/' + nameAndExtension;
        if (data?.return_value === 'success') {
        
          const dbName = window.api.fileNameWithExtension(data?.db_name);

          window.api
            .executeQuery(CONFIGURATION, insertIntoProject, [
              dbName,
              data?.data_name,
              data?.sheet_name,
              newProject?.fileSize,
              new Date().toISOString(),
              new Date().toISOString(),
              1,
            ])
            .then(async () => {
              await outputTable(dbName);
              setNewProject('name', '');
              setNewProject('fileSize', '');
              setNewProject('impBusinessObjFile', '');
              setNewProject('selectedSheet', '');
              setFile(undefined);
              setSelectedSheet('');
              setProjectExists(undefined);
              setFileSize(0);
              setSheets([]);

              window.api.deleteFile(actualPath);
              getConfigurations();
              props.closeModal();
            })
            .catch((error) => {
              window.api.deleteFile(actualPath);
              window.api.log('error', error);
              toast.error({
                body: t('fileAndProjectNameError', { ns: 'errors' }),
              });
            });
        } else {
          window.api.deleteFile(actualPath);
          toast.error({
            body: data.error,
          });
          window.api.log('error', data.error);
          props.closeModal();
        }
      } else {
        throw new Error(t('fileAndProjectNameError', { ns: 'errors' }));
      }
    } catch (error: any) {
      toast.error({ body: error.message });
    }
  };
*/
  const okDisabled = !!file && newProject?.name && newProject?.name !== '';
  return (
    <Modal
      modalType="alert"
      {...props}
      cancelLabel={t('close', { ns: 'common' })}
      okLabel={t('createProject', { ns: 'common' })}
      title={t('workspace', { ns: 'common' })}
      ok={{
        disabled: !okDisabled,
        // onClick: onClickCreateProject,
        icon: loading ? <Spinner size="tiny" /> : null,
        disabledFocusable: loading,
      }}
    >
      <div className={classes.wrapper}>
        <form onSubmit={onSubmitHandler}>
          <Field
            label={t('projectName', { ns: 'common' })}
            validationState={
              projectExists === true ? 'warning' : projectExists === false ? 'success' : 'none'
            }
            validationMessage={
              projectExists === true
                ? t('projectExistsError', { ns: 'errors' })
                : projectExists === false
                  ? t('projectNameIsAvailableMsg', { ns: 'success' })
                  : ''
            }
          >
            <Input
              name="projectName"
              placeholder={t('projectPlaceHolder', { ns: 'common' })}
              contentAfter={
                <Button
                  type="submit"
                  color="primary"
                  appearance="transparent"
                  size="small"
                  icon={<BiPlayCircle />}
                />
              }
            />
          </Field>
        </form>
        <fieldset className={classes.fieldset} disabled={projectExists}>
          <Field
            label={t('browseImportBusinessObject', { ns: 'common' })}
            validationState={file !== '' ? 'success' : 'none'}
            validationMessage={
              loading
                ? t('workbookLoading', { ns: 'common' }) + new Date()
                : file !== ''
                  ? t('browseFileInformation', { mb: mb(fileSize) })
                  : ''
            }
          >
            <Input
              disabled
              value={file ?? ''}
              contentAfter={
                <Button
                  disabled={loading}
                  className={classes.iconHover}
                  appearance="transparent"
                  size="small"
                  color="primary"
                  onClick={onBrowseFileHandler}
                  icon={<BiDotsHorizontalRounded />}
                />
              }
            />
            <input
              type="file"
              ref={fileHandler}
              style={{ display: 'none' }}
              accept={browseFile.acceptFiles.join(',')}
              // onChange={onChangeFile}
            />
          </Field>
        </fieldset>
        {file !== '' && (
          <Field label={t('worksheets')}>
            <Dropdown
              value={selectedSheet}
              placeholder={t('worksheetPlaceholder', { ns: 'common' })}
              onOptionSelect={onOpenChangeHandler}
            >
              {sheets?.map((sheet: string) => (
                <Option
                  key={sheet}
                  value={sheet}
                  placeholder={t('worksheetPlaceholder', { ns: 'common' })}
                  disabled={sheet === selectedSheet}
                >
                  {sheet}
                </Option>
              ))}
            </Dropdown>
          </Field>
        )}
      </div>
    </Modal>
  );
};
