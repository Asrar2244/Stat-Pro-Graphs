import { FC, FormEvent, useState } from 'react';
import { Field, Input, Button, Dropdown, Option, Spinner } from '@fluentui/react-components';
import { BiDotsHorizontalRounded, BiPlayCircle } from 'react-icons/bi';
import { Modal, ITranslate } from '@libs';
import { open } from '@tauri-apps/plugin-dialog';

import { IModal, useFileSize, useGetInitialConfig, useAxios, useToaster } from '@hooks';
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
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [projectExists, setProjectExists] = useState<boolean | undefined>(undefined);
  const [fileSize, setFileSize] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [sheets, setSheets] = useState<string[]>([]);
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
        const { path, size, name }: any = openedFile;
        setFile(path);
        setLoading(true);
        setFileSize(size);
        setNewProject('impBusinessObjFile', path);
        setNewProject('fileSize', size.toString());

        copyExcelFileToVolume(path, name as string)
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
                const extension = await getExtension(path);
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
                toast.error({ body: ` ${error?.message}` });
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
            console.error('Error===>', error);
            toast.error({ body: ` ${error?.message}` });
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
  const onClickCreateProject = async (): Promise<void> => {
    try {
      if (newProject?.name && newProject?.impBusinessObjFile) {
        const volumeFilePath = await volumeExcelFilePath(file as string);
        const collectionsDir = await collectionsLocation();
        const { data } = await axios.post(`api/${API.analysis}`, {
          data_name: convertToLinuxPath(volumeFilePath),
          input_data_type: 'file',
          operation: 'store_data_in_db',
          sheet_name: selectedSheet,
          db_location: convertToLinuxPath(collectionsDir),
        });
        if (data.error) {
          throw new Error(data.error);
        }
        const actualPath = await volumeExcelFilePath(file as string);
        if (data?.return_value === 'success') {
          const dbName = await fileNameWithExtension(data?.db_name);
          const db = new Database(CONFIGURATION_DB);
          db.executeQuery(insertIntoProject, [
            dbName,
            data?.data_name,
            data?.sheet_name,
            newProject?.fileSize,
            new Date().toISOString(),
            new Date().toISOString(),
            1,
          ])
            .then(async () => {
              // await outputTable(dbName);
              setNewProject('name', '');
              setNewProject('fileSize', '');
              setNewProject('impBusinessObjFile', '');
              setNewProject('selectedSheet', '');
              setFile(undefined);
              setSelectedSheet('');
              setProjectExists(undefined);
              setFileSize(0);
              setSheets([]);
              getConfigurations();
              toast.success({
                body: data.error,
              });
              props.closeModal();
            })
            .catch((error) => {
              console.error('error==>', error);
              toast.error({
                body: t('fileAndProjectNameError', { ns: 'errors' }),
              });
            })
            .finally(() => {
              removeExcelFileFromVolume(actualPath);
            });
        } else {
          removeExcelFileFromVolume(actualPath);
          toast.error({
            body: data.error,
          });
          console.error('error==>', data.error);
          props.closeModal();
        }
      } else {
        throw new Error(t('fileAndProjectNameError', { ns: 'errors' }));
      }
    } catch (error: any) {
      toast.error({ body: error.message });
    }
  };

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
