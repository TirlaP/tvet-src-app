import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import OtpViewer from './components/debug/OtpViewer';

function App() {
  const isDevOrTesting = import.meta.env.DEV || window.location.hostname.includes('localhost');
  
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        {isDevOrTesting && <OtpViewer />}
      </Router>
    </AuthProvider>
  );
}

export default App;