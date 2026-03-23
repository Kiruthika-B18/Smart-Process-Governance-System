import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LayoutDashboard, FileText, CheckSquare, Users, Settings, LogOut, XCircle } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

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
                <h1 className="brand-logo" style={{ fontSize: '1.5rem', lineHeight: '1.2' }}>
                    <LayoutDashboard size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> FPO System
                </h1>
                <p className="brand-subtitle">Governance Portal</p>
            </div>

            <div className="nav-menu">
                {user.role === 'Farmer' && (
                    <NavItem to="/dashboard" icon={FileText} label="My Requests" />
                )}
                {user.role === 'VillageOfficer' && (
                    <>
                        <NavItem to="/village-dashboard" icon={CheckSquare} label="Village Approvals" />
                        <NavItem to="/escalated-requests" icon={FileText} label="Escalated Requests" />
                        <NavItem to="/rejected-requests" icon={XCircle} label="Rejected Requests" />
                    </>
                )}
                {user.role === 'BlockOfficer' && (
                    <>
                        <NavItem to="/block-dashboard" icon={CheckSquare} label="Block Approvals" />
                        <NavItem to="/escalated-requests" icon={FileText} label="Escalated Requests" />
                        <NavItem to="/rejected-requests" icon={XCircle} label="Rejected Requests" />
                    </>
                )}
                {user.role === 'DistrictOfficer' && (
                    <>
                        <NavItem to="/district-dashboard" icon={CheckSquare} label="District Approvals" />
                        <NavItem to="/rejected-requests" icon={XCircle} label="Rejected Requests" />
                    </>
                )}
                {user.role === 'Director' && (
                    <NavItem to="/admin-dashboard" icon={Settings} label="System Admin" />
                )}
            </div>

            <LanguageSwitcher />

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
