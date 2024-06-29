import { StartProProvider } from './providers';
import { BaseComponent } from './screens/base';

const App = () => {
  return (
    <StartProProvider>
      <BaseComponent />
    </StartProProvider>
  );
};

export default App;
