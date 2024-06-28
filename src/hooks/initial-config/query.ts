import { CONFIGURATION_TABLE, PROJECTS_TABLE } from '@constants';

export const CREATE_CONFIG_QUERY = `CREATE TABLE IF NOT EXISTS ${CONFIGURATION_TABLE} (
    id INTEGER PRIMARY KEY   AUTOINCREMENT,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    types TEXT NOT NULL,
    description TEXT NOT NULL,
    createdDateTime TEXT NOT NULL,
    modifiedDateTime TEXT NOT NULL
  )`;

export const CREATE_PROJECT_QUERY = `CREATE TABLE IF NOT EXISTS ${PROJECTS_TABLE} (
    id INTEGER PRIMARY KEY   AUTOINCREMENT,
    projectName TEXT NOT NULL,
    businessObjectPath TEXT NULL,
    sheetId TEXT NOT NULL DEFAULT '',
    fileSize TEXT NULL DEFAULT 0,
    isActive SMALLINT NOT NULL DEFAULT 1,
    isOpenedData  SMALLINT NOT NULL DEFAULT 0,
    isOpenedOutput  SMALLINT NOT NULL DEFAULT 0,
    createdDateTime TEXT NOT NULL,
    modifiedDateTime TEXT NOT NULL
  )`;
