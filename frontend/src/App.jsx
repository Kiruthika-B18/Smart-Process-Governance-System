import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuditLogViewer from './pages/AuditLogViewer';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import GlobalError from './components/GlobalError';

function App() {
  return (
    <GlobalError>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Wrap protected routes in Layout */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={
                <PrivateRoute roles={['Farmer']}>
                  <EmployeeDashboard />
                </PrivateRoute>
              } />
              <Route path="/village-dashboard" element={
                <PrivateRoute roles={['VillageOfficer']}>
                  <ManagerDashboard />
                </PrivateRoute>
              } />
              <Route path="/block-dashboard" element={
                <PrivateRoute roles={['BlockOfficer']}>
                  <ManagerDashboard />
                </PrivateRoute>
              } />
              <Route path="/district-dashboard" element={
                <PrivateRoute roles={['DistrictOfficer']}>
                  <ManagerDashboard />
                </PrivateRoute>
              } />
              <Route path="/escalated-requests" element={
                <PrivateRoute roles={['VillageOfficer', 'BlockOfficer']}>
                  <ManagerDashboard viewType="escalated" />
                </PrivateRoute>
              } />
              <Route path="/rejected-requests" element={
                <PrivateRoute roles={['VillageOfficer', 'BlockOfficer', 'DistrictOfficer']}>
                  <ManagerDashboard viewType="rejected" />
                </PrivateRoute>
              } />
              <Route path="/admin-dashboard" element={
                <PrivateRoute roles={['Director']}>
                  <AdminDashboard />
                </PrivateRoute>
              } />
              <Route path="/audit-logs" element={
                <PrivateRoute roles={['Director']}>
                  <AuditLogViewer />
                </PrivateRoute>
              } />
            </Route>

            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GlobalError>
  );
}

export default App;
