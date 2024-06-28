import DB from '@tauri-apps/plugin-sql';
import { join } from '@tauri-apps/api/path';
import { homeDirectory } from './app-apis';

export class Database {
  private db: Promise<DB>;
  constructor(dbName: string) {
    this.db = this.loadSqlLiteFile(dbName);
  }
  //To loading database file
  private async loadSqlLiteFile(dbName: string) {
    const appFolder = await homeDirectory();
    const dbFile = await join(appFolder, 'collections', dbName);
    console.log('dbFile===>', dbFile);
    return await DB.load(`sqlite:${dbFile}`);
  }

  //To Execute transaction queries
  public async executeQuery(query: string, parameters?: Array<any>): Promise<any> {
    if (query === '') {
      return Promise.reject('Query can not be empty');
    }
    console.log('query===>', query);
    return (await this.db).execute(query, parameters);
  }
  //To Execute selections queries
  public async selectQuery(query: string, parameters?: Array<any>): Promise<any> {
    if (query === '') {
      return Promise.reject('Query can not be empty');
    }
    return (await this.db).select(query, parameters);
  }
}
