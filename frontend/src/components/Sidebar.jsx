import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LayoutDashboard, FileText, CheckSquare, Users, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label }) => (
        <Link to={to} className={`nav-item ${isActive(to) ? 'active' : ''}`}>
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h1 className="brand-logo">
                    <LayoutDashboard size={28} /> SPGS
                </h1>
                <p className="brand-subtitle">Smart Process Governance</p>
            </div>

            <div className="nav-menu">
                {user.role === 'Employee' && (
                    <NavItem to="/dashboard" icon={FileText} label="My Requests" />
                )}
                {(user.role === 'Manager' || user.role === 'BackupManager') && (
                    <NavItem to="/manager-dashboard" icon={CheckSquare} label="Approvals" />
                )}
                {user.role === 'Administrator' && (
                    <NavItem to="/admin-dashboard" icon={Settings} label="System Admin" />
                )}
            </div>

            <div className="user-profile-section">
                <div className="user-info">
                    <div className="avatar">
                        {user.sub && user.sub.length > 0 ? user.sub[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                        <p style={{ fontWeight: 600 }}>{user.sub}</p>
                        <p style={{ fontSize: '0.75rem', color: '#6c757d' }}>{user.role}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
