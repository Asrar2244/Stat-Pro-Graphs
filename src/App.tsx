import { StartProProvider } from './providers';
import { BaseComponent } from './screens/base';
import { Dialog } from '@libs/dialog/dialog';
// import "../css/jspreadsheet.css"
// import "../css/jspreadsheet.themes.css"
// import "../css/fonts/icons.css"
import "../css/preset-sheets-core.css"
import "../css/find-replace.css"
import "../css/ExcelSpreadsheet.css"

const App = () => {
  return (
    <StartProProvider>
      <BaseComponent />
      <Dialog />
    </StartProProvider>
  );
};

export default App;
