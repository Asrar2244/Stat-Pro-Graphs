import { PROJECTS_TABLE } from '@constants';

export const insertIntoProject = `INSERT INTO ${PROJECTS_TABLE}(projectName,businessObjectPath,sheetId,fileSize,
    createdDateTime,modifiedDateTime,isActive,workspacePath)
   VALUES(?,?,?,?,?,?,?,?)`;

export const selectFromProject = `SELECT id, projectName,fileSize,isOpenedData,
isOpenedOutput,isActive,modifiedDateTime,createdDateTime,workspacePath FROM ${PROJECTS_TABLE}`;

export const updateDataFromProject = `UPDATE ${PROJECTS_TABLE} SET isOpenedData=1 WHERE id=?`;

export const updateOutputFromProject = `UPDATE ${PROJECTS_TABLE} SET isOpenedOutput=1 WHERE id=?`;

export const updateDataProjectClose = `UPDATE ${PROJECTS_TABLE} SET isOpenedData=0 where id=?`;

export const updateOutputProjectClose = `UPDATE ${PROJECTS_TABLE} SET isOpenedOutput=0 where id=?`;
