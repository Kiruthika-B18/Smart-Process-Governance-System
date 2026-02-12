import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" />;

    if (roles && !roles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'Employee') return <Navigate to="/dashboard" />;
        if (user.role === 'Manager' || user.role === 'BackupManager') return <Navigate to="/manager-dashboard" />;
        if (user.role === 'Administrator') return <Navigate to="/admin-dashboard" />;
        return <Navigate to="/" />; // Default fallback
    }

    return children;
};
export default PrivateRoute;
