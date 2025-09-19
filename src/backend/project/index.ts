import { PROJECTS_TABLE } from '@constants';

export const insertIntoProject = `INSERT INTO ${PROJECTS_TABLE}(projectName,inputFileName,businessObjectPath,sheetId,fileSize,
    createdDateTime,modifiedDateTime,isActive,workspacePath)
   VALUES(?,?,?,?,?,?,?,?,?)`;

export const selectFromProject = `SELECT id, projectName,fileSize,isOpenedData,
isOpenedOutput,isActive,modifiedDateTime,createdDateTime,workspacePath,sheetId,inputFileName FROM ${PROJECTS_TABLE} WHERE isActive=1`;

export const updateDataFromProject = `UPDATE ${PROJECTS_TABLE} SET isOpenedData=1 WHERE id=?`;

export const updateOutputFromProject = `UPDATE ${PROJECTS_TABLE} SET isOpenedOutput=1 WHERE id=?`;

export const updateGraphsFromProject = `UPDATE ${PROJECTS_TABLE} SET isOpenedGraphs=1 WHERE id=?`;

export const updateDataProjectClose = `UPDATE ${PROJECTS_TABLE} SET isOpenedData=0 where id=?`;

export const updateOutputProjectClose = `UPDATE ${PROJECTS_TABLE} SET isOpenedOutput=0 where id=?`;

export const updateGraphsProjectClose = `UPDATE ${PROJECTS_TABLE} SET isOpenedGraphs=0 where id=?`;
