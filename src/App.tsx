import { Textarea } from '@fluentui/react-components';

function App() {
  return (
    <div>
      <Textarea
        rows={4}
        defaultValue={`
        CREATE TABLE IF NOT EXISTS "PROJECTS" (
    id INTEGER PRIMARY KEY   AUTOINCREMENT,
    projectName TEXT NOT NULL,
    businessObjectPath TEXT NULL,
    sheetId TEXT NOT NULL DEFAULT '',
    fileSize TEXT NULL DEFAULT 0,
    isActive SMALLINT NOT NULL DEFAULT 1,
    isOpenedData  SMALLINT NOT NULL DEFAU
      `}
      />
    </div>
  );
}

export default App;
