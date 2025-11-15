import { StartProProvider } from './providers';
import { BaseComponent } from './screens/base';
import { Dialog } from '@libs/dialog/dialog';
import "../css/jspreadsheet.css"
import "../css/jspreadsheet.themes.css"
import "../css/fonts/icons.css"

const App = () => {
  return (
    <StartProProvider>
      <BaseComponent />
      <Dialog />
    </StartProProvider>
  );
};

export default App;
