import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" />;

    if (roles && !roles.includes(user.role)) {
        console.log(`PrivateRoute Redirect: User role '${user.role}' not in allowed roles:`, roles);
        // Redirect to appropriate dashboard based on role
        if (user.role === 'Farmer') return <Navigate to="/dashboard" />;
        if (user.role === 'VillageOfficer') return <Navigate to="/village-dashboard" />;
        if (user.role === 'BlockOfficer') return <Navigate to="/block-dashboard" />;
        if (user.role === 'DistrictOfficer') return <Navigate to="/district-dashboard" />;
        if (user.role === 'Director') return <Navigate to="/admin-dashboard" />;
        return <Navigate to="/" />; // Default fallback
    }

    return children;
};
export default PrivateRoute;
