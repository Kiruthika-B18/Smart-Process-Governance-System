import { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import { formatDistanceToNow, format, formatDistance } from 'date-fns';
import { PlusCircle, Clock, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [urgency, setUrgency] = useState('Medium');
    const [targetManagerId, setTargetManagerId] = useState('');
    const [managers, setManagers] = useState([]);
    const [editingRequestId, setEditingRequestId] = useState(null);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load requests");
        }
    };

    const fetchManagers = async () => {
        try {
            const res = await api.get('/auth/managers');
            setManagers(res.data);
        } catch (err) {
            console.error("Failed to load managers", err);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchManagers();
        const interval = setInterval(fetchRequests, 30000); // Auto refresh
        return () => clearInterval(interval);
    }, []);

    const handleEditClick = (req) => {
        setTitle(req.title);
        setDesc(req.description);
        setUrgency(req.urgency || 'Medium');
        setTargetManagerId(req.current_handler_id || ''); // This might need adjustment if logic differentiates handler vs target
        setEditingRequestId(req.id);
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setTitle('');
        setDesc('');
        setUrgency('Medium');
        setTargetManagerId('');
        setEditingRequestId(null);
        setIsFormOpen(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { title, description: desc, urgency };
            if (targetManagerId) {
                payload.target_manager_id = parseInt(targetManagerId);
            }

            if (editingRequestId) {
                await api.put(`/requests/${editingRequestId}`, payload);
                toast.success("Request updated successfully!");
            } else {
                await api.post('/requests', payload);
                toast.success("Request submitted successfully!");
            }

            fetchRequests();
            resetForm();
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;
            const msg = typeof detail === 'string' ? detail : JSON.stringify(detail) || 'Failed to submit request';
            toast.error(msg);
        }
    };

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'Pending').length,
        approved: requests.filter(r => r.status === 'Approved').length,
        rejected: requests.filter(r => r.status === 'Rejected').length,
    };

    return (
        <div className="animation-fade-in">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">My Dashboard</h1>
                    <p className="page-subtitle">Overview of your request activities</p>
                </div>
                {!isFormOpen && (
                    <button onClick={() => setIsFormOpen(true)} className="btn btn-primary">
                        <PlusCircle size={20} /> New Request
                    </button>
                )}
            </div>

            <div className="stats-grid">
                <StatCard title="Total Requests" value={stats.total} icon={Clock} color="bg-gray-400" />
                <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-blue-500" />
                <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="bg-green-500" />
                <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="bg-red-500" />
            </div>

            {isFormOpen && (
                <div style={{
                    backgroundColor: 'var(--surface-color)',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border-color)',
                    marginBottom: 'var(--spacing-lg)'
                }} className="animation-fade-in">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                        {editingRequestId ? 'Edit Request' : 'Submit New Request'}
                    </h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Title</label>
                                <input className="input-field" placeholder="Enter request title" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Urgency</label>
                                <div style={{ position: 'relative' }}>
                                    <select className="input-field" value={urgency} onChange={e => setUrgency(e.target.value)} style={{ appearance: 'none', backgroundColor: 'white' }}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Description</label>
                            <textarea className="input-field" rows="3" placeholder="Enter details..." value={desc} onChange={e => setDesc(e.target.value)} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Assign to Manager (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    className="input-field"
                                    value={targetManagerId}
                                    onChange={e => setTargetManagerId(e.target.value)}
                                    style={{ appearance: 'none', backgroundColor: 'white' }}
                                >
                                    <option value="">Default (Auto-assign)</option>
                                    {managers.map(mgr => (
                                        <option key={mgr.id} value={mgr.id}>
                                            {mgr.username} (ID: {mgr.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Select a specific manager or leave as Default to use your assigned manager.</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary">{editingRequestId ? 'Update Request' : 'Submit Request'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                <div className="table-header">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Requests</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Urgency</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Submitted</th>
                                <th>Actioned</th>
                                <th>Actioned By</th>
                                <th>Wait Time</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td style={{ color: 'var(--text-secondary)' }}>#{req.id}</td>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{req.title}</td>
                                    <td><UrgencyBadge level={req.urgency} /></td>
                                    <td>
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {req.handler_username || 'Unassigned'}
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{format(new Date(req.created_at), 'MMM d, p')}</td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {(req.status === 'Approved' || req.status === 'Rejected')
                                            ? format(new Date(req.updated_at), 'MMM d, p')
                                            : '-'}
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {req.actioned_by_username || '-'}
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                        {(req.status === 'Approved' || req.status === 'Rejected')
                                            ? formatDistance(new Date(req.created_at), new Date(req.updated_at))
                                            : formatDistanceToNow(new Date(req.created_at))
                                        }
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--danger-color)' }}>{req.rejection_reason || '-'}</td>
                                    <td>
                                        {req.status === 'Pending' && (
                                            <button
                                                onClick={() => handleEditClick(req)}
                                                className="btn"
                                                style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
                                                title="Edit Request"
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {requests.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No requests found. Start by creating one!</div>}
                </div>
            </div>
        </div>
    );
};
export default EmployeeDashboard;
