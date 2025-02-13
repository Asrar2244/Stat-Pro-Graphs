import { ChangeEvent, FC, FormEvent, useState } from 'react';
import { Field, Input, Button, Dropdown, Option, Spinner } from '@fluentui/react-components';
import { BiDotsHorizontalRounded, BiPlayCircle } from 'react-icons/bi';
import { Modal, ITranslate } from '@libs';
import { open } from '@tauri-apps/plugin-dialog';
import { getFileSize, getFileNameFromPath, getDirPath, joinPaths } from '@utils';
import { IModal, useFileSize, useGetInitialConfig, useAxios } from '@hooks';
import { useStartProStore } from '@store';
import { browseFile } from './configurations';
import { useShallow } from 'zustand/react/shallow';
import {
  copyExcelFileToVolume,
  getExtension,
  volumeExcelFilePath,
  removeExcelFileFromVolume,
  collectionsLocation,
  fileNameWithExtension,
  Database,
  convertToLinuxPath,
} from '@utils';
import { API } from '@constants';
import { CONFIGURATION_DB } from '@constants';
import { insertIntoProject } from '@backend';
import { useBrowseLayout } from './styles-hook/use-browse-style';
export const BrowseFile: FC<IModal & ITranslate> = ({ t, ...props }) => {
  const [file, setFile] = useState<string | undefined>(undefined);
  const [projectName, setProjectName] = useState<string | undefined>(undefined);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [projectExists, setProjectExists] = useState<boolean | undefined>(undefined);
  const [fileSize, setFileSize] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [sheets, setSheets] = useState<string[]>([]);
  const axios = useAxios();
  const { getConfigurations } = useGetInitialConfig();
  const { mb } = useFileSize();
  const { projects, newProject, setNewProject, setBlockUI } = useStartProStore(
    useShallow((state) => ({
      projects: state.projects,
      setNewProject: state.setNewProject,
      newProjectName: state.newProject?.name,
      newProject: state.newProject,
      setBlockUI: state.setBlockUI
    })),
  );

  const classes = useBrowseLayout();
  const onBrowseFileHandler = async (): Promise<void> => {
    try {
      const openedFile = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: 'Excel Files',
            extensions: browseFile.acceptFiles,
          },
        ],
      });

      if (openedFile) {
        const size = await getFileSize(openedFile);
        const baseName = await getFileNameFromPath(openedFile);
        const name = baseName.split('.')[0];
        // const { path, size, name }: any = openedFile;
        setFile(openedFile);
        setLoading(true);
        setFileSize(size);
        setNewProject('impBusinessObjFile', openedFile);
        setNewProject('fileSize', size.toString());
        if (openedFile && openedFile !== '') {
          const dirName = await getDirPath(openedFile);
          setNewProject('workspacePath', dirName);
        }
        copyExcelFileToVolume(openedFile, name as string)
          .then(async (savePath: string) => {
            const volumePath = await volumeExcelFilePath(savePath);
            axios
              .post(`api/${API.analysis}`, {
                data_name: convertToLinuxPath(volumePath),
                input_data_type: 'file',
                operation: 'get_timeout',
              })
              .then(async ({ data }) => {
                if (data.error) {
                  throw new Error(data.error);
                }
                const extension = await getExtension(openedFile);
                if (extension.toUpperCase() === 'CSV') {
                  setSheets(['Sheet1']);
                } else {
                  if (typeof data?.sheet_names === 'string') {
                    throw new Error('error in reading sheets');
                  }
                  setSheets(data?.sheet_names);
                }
              })
              .catch((error) => {
                console.error('Error===>', error);
                setBlockUI({ value: true, msg: error.message });
              })
              .finally(() => {
                setLoading(false);
              });
          })
          .catch((error) => {
            setLoading(false);
            setFile('');
            setNewProject('impBusinessObjFile', '');
            setNewProject('fileSize', '');
            setNewProject('workspacePath', '');
            console.error('Error===>', error);
            setBlockUI({ value: true, msg: error.message });
          });
      }
    } catch (e) {
      console.error('error==>', e);
    }
  };

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
    setNewProject('workspacePath', '');
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

  const onClickCreateProject = async (): Promise<void> => {
    try {
      if (newProject?.name && newProject?.impBusinessObjFile) {
        const volumeFilePath = await volumeExcelFilePath(file as string);
        const collectionsDir = newProject?.workspacePath ?? (await collectionsLocation());
        const dbLocation = convertToLinuxPath(collectionsDir);
        const { data } = await axios.post(`api/${API.analysis}`, {
          data_name: convertToLinuxPath(volumeFilePath),
          input_data_type: 'file',
          operation: 'store_data_in_db',
          sheet_name: selectedSheet,
          db_location: dbLocation,
        });
        if (data.error) {
          throw new Error(data.error);
        }
        const actualPath = volumeFilePath;
        if (data?.return_value === 'success') {
          const dbName = await fileNameWithExtension(data?.db_name);
          const workspacePath = await joinPaths([dbLocation, dbName]);
          const db = new Database(CONFIGURATION_DB);
          db.executeQuery(insertIntoProject, [
            projectName,
            dbName,
            data?.data_name,
            data?.sheet_name,
            newProject?.fileSize,
            new Date().toISOString(),
            new Date().toISOString(),
            1,
            workspacePath,
          ])
            .then(async () => {
              // await outputTable(dbName);
              setNewProject('name', '');
              setNewProject('fileSize', '');
              setNewProject('impBusinessObjFile', '');
              setNewProject('selectedSheet', '');
              setNewProject('workspacePath', '');
              setFile(undefined);
              setSelectedSheet('');
              setProjectExists(undefined);
              setFileSize(0);
              setSheets([]);
              getConfigurations();
              setBlockUI({ value: true, msg: data.error, });
              props.closeModal();
            })
            .catch((error) => {
              console.error('error==>', error);
              setBlockUI({ value: true, msg: t('fileAndProjectNameError', { ns: 'errors' }) });
            })
            .finally(() => {
              removeExcelFileFromVolume(actualPath);
            });
        } else {
          removeExcelFileFromVolume(actualPath);
          setBlockUI({ value: true, msg: data.error });
          console.error('error==>', data.error);
          props.closeModal();
        }
      } else {
        throw new Error(t('fileAndProjectNameError', { ns: 'errors' }));
      }
    } catch (error: any) {
      setBlockUI({ value: true, msg: error.message });
    }
  };

  const onChangeWorkSpacePath = async () => {
    const openedFolder = await open({
      multiple: false,
      directory: true,
      title: t('selectWorkspacePath', { ns: 'common' }),
    });
    if (openedFolder) {
      setNewProject('workspacePath', openedFolder);
    }
  };
  const onProjectNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setProjectName(e?.target.value)
  }
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
        onClick: onClickCreateProject,
        icon: loading ? <Spinner size="tiny" /> : null,
        disabledFocusable: loading,
      }}
      cancel={{
        onClick: () => {
          setProjectExists(undefined);
          setNewProject('name', '');
          setNewProject('fileSize', '');
          setNewProject('impBusinessObjFile', '');
          setNewProject('selectedSheet', '');
          setNewProject('workspacePath', '');
          setFile(undefined);
          setSelectedSheet('');
          setProjectExists(undefined);
          setFileSize(0);
          setSheets([]);
          props.closeModal();
        },
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
              value={projectName}
              onChange={onProjectNameChange}
              contentAfter={
                <Button
                  type="submit"
                  color="primary"
                  appearance="transparent"
                  size="small"
                  icon={<BiPlayCircle />}
                  disabled={!projectName?.trim()}
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

        <fieldset className={classes.fieldset} disabled={projectExists}>
          <Field label={t('workspacePath', { ns: 'common' })}>
            <Input
              disabled
              value={newProject?.workspacePath ?? ''}
              contentAfter={
                <Button
                  disabled={loading}
                  className={classes.iconHover}
                  appearance="transparent"
                  size="small"
                  color="primary"
                  onClick={onChangeWorkSpacePath}
                  icon={<BiDotsHorizontalRounded />}
                />
              }
            />
          </Field>
        </fieldset>
      </div>
    </Modal>
  );
};
