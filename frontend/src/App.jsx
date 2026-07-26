import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SchoolProvider } from './contexts/SchoolContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <SchoolProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SchoolProvider>
    </BrowserRouter>
  );
}

export default App;
