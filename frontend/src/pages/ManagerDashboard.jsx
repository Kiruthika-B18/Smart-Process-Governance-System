import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api';

import { CheckSquare, AlertTriangle, Clock, CheckCircle, Eye } from 'lucide-react';
import RejectionModal from '../components/RejectionModal';
import RequestDetailsModal from '../components/RequestDetailsModal';
import ExpectedDateModal from '../components/ExpectedDateModal';
import DocumentVerificationModal from '../components/DocumentVerificationModal';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

import { formatDateSafe, formatDistanceSafe } from '../utils/dateUtils';

const ManagerDashboard = ({ viewType = "queue" }) => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [isDocVerifyModalOpen, setIsDocVerifyModalOpen] = useState(false);
    const [selectedDocRequest, setSelectedDocRequest] = useState(null);

    const fetchRequests = async () => {
        try {
            const [reqRes, histRes] = await Promise.all([
                api.get('/requests'),
                api.get('/requests/history')
            ]);
            setRequests(reqRes.data);
            setHistory(histRes.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch dashboard data");
        }
    };

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleApproveClick = async (req) => {
        if (user.role === 'DistrictOfficer' || user.role === 'Director') {
            setSelectedRequest(req);
            setIsDateModalOpen(true);
        } else {
            // Village and Block officers don't need a date
            handleApproveConfirm(req.id, null);
        }
    };

    const handleApproveConfirm = async (id, dateStr) => {
        try {
            const payload = { action: "APPROVE" };
            if (dateStr) {
                payload.expected_delivery_date = new Date(dateStr).toISOString();
            }
            await api.put(`/requests/${id}/status`, payload);
            setIsDateModalOpen(false);
            fetchRequests();
            toast.success(`Request #${id} Approved`);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to approve");
        }
    };

    const handleRejectClick = (req) => {
        setSelectedRequest(req);
        setIsRejectionModalOpen(true);
    };

    const handleRejectConfirm = async (reason) => {
        try {
            await api.put(`/requests/${selectedRequest.id}/status`, { action: "REJECT", rejection_reason: reason });
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

    const handleVerifyDocuments = (req) => {
        setSelectedDocRequest(req);
        setIsDocVerifyModalOpen(true);
    };

    const isPending = (status) => status && status.startsWith('Pending_');

    const activeRequests = Array.isArray(requests) ? requests.filter(r => {
        if (viewType === 'escalated') {
            return isPending(r.status) && r.current_handler_id !== user.id;
        }
        return isPending(r.status) && (user.role === 'Director' || r.current_handler_id === user.id);
    }) : [];

    const rejectedRequests = Array.isArray(history) ? history.filter(r =>
        r.status === 'Rejected' && r.actioned_by_username === user.sub
    ) : [];

    const getFilteredRequests = () => {
        let baseRequests = viewType === 'rejected' ? rejectedRequests : activeRequests;
        if (filterStatus === 'Urgent') return baseRequests.filter(r => r.sla_deadline && new Date(r.sla_deadline) < new Date(Date.now() + 3600000));
        if (filterStatus === 'Approved Requests') return [];
        return baseRequests;
    };

    const getFilteredHistory = () => {
        if (!Array.isArray(history)) return [];
        if (filterStatus === 'Approved Requests') return history.filter(r => r.status === 'Approved' || r.status === 'Rejected');
        if (filterStatus === 'Pending Approvals' || filterStatus === 'Urgent') return [];
        return history;
    };

    const displayRequests = getFilteredRequests();
    const displayHistory = getFilteredHistory();

    const stats = {
        pending: activeRequests.length,
        urgent: activeRequests.filter(r => r.sla_deadline && new Date(r.sla_deadline) < new Date(Date.now() + 3600000)).length, // < 1 hour left, handle nulls
        total: activeRequests.length + (Array.isArray(history) ? history.length : 0),
        processed: Array.isArray(history) ? history.filter(r => r.status === 'Approved' || r.status === 'Rejected').length : 0
    };

    const getDashboardTitle = () => {
        if (viewType === 'escalated') return 'Escalated Requests View';
        if (viewType === 'rejected') return 'Rejected Requests View';
        if (!user || (!user.role)) return 'Manager Dashboard';
        if (user.role === 'VillageOfficer') return 'Village Officer Dashboard';
        if (user.role === 'BlockOfficer') return 'Block Officer Dashboard';
        if (user.role === 'DistrictOfficer') return 'District Officer Dashboard';
        if (user.role === 'Director') return 'Director Dashboard';
        return `${user.role} Dashboard`;
    };

    return (
        <div className="animation-fade-in">
            <div className="dashboard-header">
                <h1 className="page-title">{getDashboardTitle()}</h1>
            </div>

            {viewType !== 'escalated' && viewType !== 'rejected' && (
                <div className="stats-grid">
                    <StatCard title="Total Requests" value={stats.total} icon={CheckSquare} color="bg-gray-400" onClick={() => setFilterStatus(filterStatus === 'Total Requests' ? 'All' : 'Total Requests')} isActive={filterStatus === 'Total Requests'} />
                    <StatCard title="Pending Approvals" value={stats.pending} icon={Clock} color="bg-blue-500" onClick={() => setFilterStatus(filterStatus === 'Pending Approvals' ? 'All' : 'Pending Approvals')} isActive={filterStatus === 'Pending Approvals'} />
                    <StatCard title="Urgent ( < 1h )" value={stats.urgent} icon={AlertTriangle} color="bg-orange-500" onClick={() => setFilterStatus(filterStatus === 'Urgent' ? 'All' : 'Urgent')} isActive={filterStatus === 'Urgent'} />
                    <StatCard title="Approved Requests" value={stats.processed} icon={CheckCircle} color="bg-green-500" onClick={() => setFilterStatus(filterStatus === 'Approved Requests' ? 'All' : 'Approved Requests')} isActive={filterStatus === 'Approved Requests'} />
                </div>
            )}

            <div className="table-container">
                <div className="table-header">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {viewType === 'escalated' ? 'Requests Escalated by You (Currently Pending at Higher Level)' : viewType === 'rejected' ? 'Requests Rejected by You' : 'Request Queue'}
                    </h2>
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
                            {displayRequests.map(req => (
                                <tr key={req.id}>
                                    <td style={{ color: 'var(--text-secondary)' }}>{req.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{req.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDateSafe(req.created_at, 'MMM d, p')}</div>
                                    </td>
                                    <td>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{req.farmer_name || req.submitter_username || `User ${req.submitter_id}`}</div>
                                    </td>
                                    <td>
                                        <div style={{ color: 'var(--text-primary)' }}>{req.sla_deadline ? formatDateSafe(req.sla_deadline, 'p') : 'N/A'}</div>
                                        {isPending(req.status) && req.sla_deadline && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--warning-color)', fontWeight: 500 }}>
                                                {formatDistanceSafe(req.sla_deadline)}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <StatusBadge status={req.status} />
                                        {req.documents_verified ? (
                                            <div style={{ marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                                                <CheckCircle size={12} /> Docs Verified
                                            </div>
                                        ) : null}
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
                                            {isPending(req.status) && viewType !== 'escalated' && viewType !== 'rejected' && (
                                                <>
                                                    {user.role === 'VillageOfficer' && (
                                                        <button
                                                            onClick={() => handleVerifyDocuments(req)}
                                                            className="btn"
                                                            style={{ padding: '6px 12px', fontSize: '0.875rem', backgroundColor: req.documents_verified ? '#f1f5f9' : '#0ea5e9', color: req.documents_verified ? '#64748b' : 'white', border: 'none' }}
                                                        >
                                                            {req.documents_verified ? 'View Docs' : 'Verify Docs'}
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleApproveClick(req)} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>Approve</button>
                                                    <button onClick={() => handleRejectClick(req)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>Reject</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {displayRequests.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>{viewType === 'escalated' ? 'No escalated requests pending.' : viewType === 'rejected' ? 'No datas or request found' : 'All caught up! No pending requests.'}</div>}
                </div>
            </div>

            {/* History Table */}
            {viewType !== 'escalated' && viewType !== 'rejected' && (
                <div className="table-container" style={{ marginTop: '32px' }}>
                    <div className="table-header" style={{ backgroundColor: '#f3f4f6' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckSquare size={20} /> My Processed Requests
                        </h2>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Req ID</th>
                                    <th>Details</th>
                                    <th>Submitter</th>
                                    <th>Current Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayHistory.map(req => (
                                    <tr key={req.id}>
                                        <td style={{ color: 'var(--text-secondary)' }}>{req.id}</td>
                                        <td>
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{req.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDateSafe(req.created_at, 'MMM d, p')}</div>
                                        </td>
                                        <td>
                                            <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{req.farmer_name || req.submitter_username || `User ${req.submitter_id}`}</div>
                                        </td>
                                        <td><StatusBadge status={req.status} /></td>
                                        <td>
                                            <button onClick={() => handleViewDetails(req)} className="btn" style={{ padding: '6px 12px', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!history || history.length === 0) && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>You haven't processed any requests yet.</div>}
                    </div>
                </div>
            )}

            <RejectionModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                onSubmit={handleRejectConfirm}
            />

            <ExpectedDateModal
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                onSubmit={(date) => handleApproveConfirm(selectedRequest?.id, date)}
            />

            <RequestDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                request={selectedRequestDetails}
            />

            <DocumentVerificationModal
                isOpen={isDocVerifyModalOpen}
                onClose={() => setIsDocVerifyModalOpen(false)}
                request={selectedDocRequest}
                onVerified={() => {
                    setIsDocVerifyModalOpen(false);
                    fetchRequests();
                }}
            />

        </div>
    );
};
export default ManagerDashboard;
