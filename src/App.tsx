import { StartProProvider } from './providers';
import { BaseComponent } from './screens/base';
import { Dialog } from '@libs/dialog/dialog';

const App = () => {
  return (
    <StartProProvider>
      <BaseComponent />
      <Dialog />
    </StartProProvider>
  );
};

export default App;
