import { Database } from '@utils';
import { CONFIGURATION_DB } from '@constants';

export const db = new Database(CONFIGURATION_DB);
