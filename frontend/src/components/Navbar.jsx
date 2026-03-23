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
            <div className="font-bold text-xl">FPO Governance System</div>
            <div className="flex gap-4 items-center">
                <span className="text-gray-300 text-sm">Welcome, {user.sub} ({user.role})</span>
                <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
            </div>
        </nav>
    );
};
export default Navbar;
