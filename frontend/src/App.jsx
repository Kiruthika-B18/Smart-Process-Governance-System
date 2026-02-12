import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Wrap protected routes in Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={
              <PrivateRoute roles={['Employee']}>
                <EmployeeDashboard />
              </PrivateRoute>
            } />
            <Route path="/manager-dashboard" element={
              <PrivateRoute roles={['Manager', 'BackupManager']}>
                <ManagerDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin-dashboard" element={
              <PrivateRoute roles={['Administrator']}>
                <AdminDashboard />
              </PrivateRoute>
            } />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
