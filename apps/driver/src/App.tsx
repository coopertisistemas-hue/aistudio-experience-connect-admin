import { BrowserRouter } from 'react-router-dom';
import { DriverAuthProvider } from '@/providers/DriverAuth';
import { AppRouter } from '@/router/config';

function App() {
  return (
    <BrowserRouter>
      <DriverAuthProvider>
        <AppRouter />
      </DriverAuthProvider>
    </BrowserRouter>
  );
}

export default App;
