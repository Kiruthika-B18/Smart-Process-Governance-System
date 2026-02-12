import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api';
import { formatDistanceToNow, format, isValid } from 'date-fns';
import { CheckSquare, AlertTriangle, Clock, CheckCircle, Eye } from 'lucide-react';
import RejectionModal from '../components/RejectionModal';
import RequestDetailsModal from '../components/RequestDetailsModal';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const formatDateSafe = (dateString, formatStr) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, formatStr) : 'Invalid Date';
};

const formatDistanceSafe = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '';
};

const ManagerDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch requests");
        }
    };

    useEffect(() => {
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
            toast.error("Failed to approve");
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
            toast.error("Failed to reject");
        }
    };

    const handleViewDetails = (request) => {
        setSelectedRequestDetails(request);
        setIsDetailsModalOpen(true);
    };

    const stats = {
        pending: Array.isArray(requests) ? requests.filter(r => r.status === 'Pending').length : 0,
        urgent: Array.isArray(requests) ? requests.filter(r => r.status === 'Pending' && new Date(r.sla_deadline) < new Date(Date.now() + 3600000)).length : 0, // < 1 hour left
        escalated: Array.isArray(requests) ? requests.filter(r => r.status === 'Escalated').length : 0,
        processed: Array.isArray(requests) ? requests.filter(r => ['Approved', 'Rejected'].includes(r.status)).length : 0
    };

    return (
        <div className="animation-fade-in">
            <div className="dashboard-header">
                <h1 className="page-title">Manager Dashboard</h1>
            </div>

            <div className="stats-grid">
                <StatCard title="Pending Approvals" value={stats.pending} icon={Clock} color="bg-blue-500" />
                <StatCard title="Urgent ( < 1h )" value={stats.urgent} icon={AlertTriangle} color="bg-orange-500" />
                <StatCard title="Escalated" value={stats.escalated} icon={AlertTriangle} color="bg-red-500" />
                <StatCard title="Processed Today" value={stats.processed} icon={CheckCircle} color="bg-green-500" />
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Request Queue</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Req ID</th>
                                <th>Details</th>
                                <th>Submitter</th>
                                <th>SLA Deadline</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(requests) && requests.map(req => (
                                <tr key={req.id}>
                                    <td style={{ color: 'var(--text-secondary)' }}>#{req.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{req.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDateSafe(req.created_at, 'MMM d, p')}</div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{req.submitter_username || `Use #${req.submitter_id}`}</td>
                                    <td>
                                        <div style={{ color: 'var(--text-primary)' }}>{formatDateSafe(req.sla_deadline, 'p')}</div>
                                        {req.status === 'Pending' && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--warning-color)', fontWeight: 500 }}>
                                                {formatDistanceSafe(req.sla_deadline)}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <StatusBadge status={req.status} />
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
                                            {['Pending', 'Escalated'].includes(req.status) && (
                                                <>
                                                    <button onClick={() => handleApprove(req.id)} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>Approve</button>
                                                    <button onClick={() => handleRejectClick(req)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>Reject</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {requests.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>All caught up! No pending requests.</div>}
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
export default ManagerDashboard;
