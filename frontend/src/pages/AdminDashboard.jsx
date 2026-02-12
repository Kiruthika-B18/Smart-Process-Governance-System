import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { Settings, UserPlus, Save, List, Eye } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { format, isValid } from 'date-fns';
import RejectionModal from '../components/RejectionModal';
import RequestDetailsModal from '../components/RequestDetailsModal';

const formatDateSafe = (dateString, formatStr) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, formatStr) : 'Invalid Date';
};

const AdminDashboard = () => {
    const [sla, setSla] = useState(1440);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Employee');
    const [managerId, setManagerId] = useState('');
    const [managers, setManagers] = useState([]);
    const [requests, setRequests] = useState([]);

    // Request handling state
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const fetchManagers = async () => {
        try {
            const res = await api.get('/auth/managers');
            setManagers(res.data);
        } catch (err) {
            toast.error("Failed to load managers help");
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests');
            setRequests(res.data);
        } catch (err) {
            toast.error("Failed to load requests");
        }
    };

    useEffect(() => {
        fetchManagers();
        fetchRequests();
        const interval = setInterval(fetchRequests, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.put(`/requests/${id}/status`, { status: "Approved" });
            fetchRequests();
            toast.success(`Request #${id} Approved`);
        } catch (err) {
            toast.error("Failed to approve request");
        }
    };

    const handleRejectClick = (req) => {
        setSelectedRequest(req);
        setIsRejectionModalOpen(true);
    };

    const handleRejectConfirm = async (reason) => {
        try {
            await api.put(`/requests/${selectedRequest.id}/status`, { status: "Rejected", rejection_reason: reason });
            setIsRejectionModalOpen(false);
            fetchRequests();
            toast.success(`Request #${selectedRequest.id} Rejected`);
        } catch (err) {
            toast.error("Failed to reject request");
        }
    };

    const handleViewDetails = (request) => {
        setSelectedRequestDetails(request);
        setIsDetailsModalOpen(true);
    };

    const handleSetSla = async () => {
        try {
            await api.post(`/admin/config/sla?minutes=${sla}`);
            toast.success(`Default SLA set to ${sla} minutes`);
        } catch (err) {
            toast.error('Failed to update SLA');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', {
                username,
                password,
                role,
                manager_id: managerId ? parseInt(managerId) : null
            });
            toast.success(`User ${username} created successfully!`);
            setUsername('');
            setPassword('');
            setManagerId('');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to create user');
        }
    };

    return (
        <div className="animation-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="dashboard-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings style={{ color: 'var(--text-secondary)' }} /> Admin Dashboard
                </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>

                {/* SLA Configuration Card */}
                <div style={{ backgroundColor: 'var(--surface-color)', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', height: 'fit-content' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>System Configuration</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Default SLA Duration (minutes)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="number" className="input-field" value={sla} onChange={e => setSla(e.target.value)} />
                                <button onClick={handleSetSla} className="btn btn-primary">
                                    <Save size={18} /> Save
                                </button>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Adjusting this affects new requests only.</p>
                        </div>
                    </div>
                </div>

                {/* Create User Card */}
                <div style={{ backgroundColor: 'var(--surface-color)', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserPlus size={20} style={{ color: 'var(--primary-color)' }} /> Create New User
                    </h2>
                    <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Username</label>
                            <input className="input-field" placeholder="e.g. john_doe" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Password</label>
                            <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Role</label>
                            <div style={{ position: 'relative' }}>
                                <select className="input-field" value={role} onChange={e => setRole(e.target.value)} style={{ appearance: 'none', backgroundColor: 'white' }}>
                                    <option value="Employee">Employee</option>
                                    <option value="Manager">Manager</option>
                                    <option value="BackupManager">Backup Manager</option>
                                    <option value="Administrator">Administrator</option>
                                </select>
                            </div>
                        </div>
                        {role === 'Employee' && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Assign Manager</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        className="input-field"
                                        value={managerId}
                                        onChange={e => setManagerId(e.target.value)}
                                        style={{ appearance: 'none', backgroundColor: 'white' }}
                                    >
                                        <option value="">Select a Manager...</option>
                                        {managers.map(mgr => (
                                            <option key={mgr.id} value={mgr.id}>
                                                {mgr.username} (ID: {mgr.id})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }}>
                            Create Account
                        </button>
                    </form>
                </div>
            </div>

            {/* Requests List */}
            <div className="table-container" style={{ marginTop: '24px' }}>
                <div className="table-header">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <List size={20} /> All Requests
                    </h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Submitter</th>
                                <th>Handler</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!requests || requests.length === 0) ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                                        No requests found
                                    </td>
                                </tr>
                            ) : (
                                Array.isArray(requests) && requests.map(req => (
                                    <tr key={req.id}>
                                        <td style={{ color: 'var(--text-secondary)' }}>#{req.id}</td>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{req.title}</td>
                                        <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{req.submitter_username || `User #${req.submitter_id}`}</td>
                                        <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {req.handler_username || 'Unassigned'}
                                        </td>
                                        <td>
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {formatDateSafe(req.created_at, 'MMM d, p')}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => handleViewDetails(req)}
                                                    className="btn"
                                                    style={{ padding: '6px', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {req.status === 'Pending' && (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handleApprove(req.id)}
                                                            className="btn btn-success"
                                                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectClick(req)}
                                                            className="btn btn-danger"
                                                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <RejectionModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                onSubmit={handleRejectConfirm}
            />

            <RequestDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                request={selectedRequestDetails}
            />
        </div>
    );
};
export default AdminDashboard;
