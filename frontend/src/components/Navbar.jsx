import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <div className="font-bold text-xl">SPGS</div>
            <div className="flex gap-4 items-center">
                <span className="text-gray-300 text-sm">Welcome, {user.sub} ({user.role})</span>
                {user.role === 'Employee' && <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>}
                {(user.role === 'Manager' || user.role === 'BackupManager') && <Link to="/manager-dashboard" className="hover:text-gray-300">Manager Dashboard</Link>}
                {user.role === 'Administrator' && <Link to="/admin-dashboard" className="hover:text-gray-300">Admin</Link>}
                <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
            </div>
        </nav>
    );
};
export default Navbar;
