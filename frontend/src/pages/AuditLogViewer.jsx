import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateSafe } from '../utils/dateUtils';

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(0);
    const LIMIT = 20;
    const navigate = useNavigate();

    const fetchLogs = async () => {
        try {
            const res = await api.get(`/admin/audit-logs?skip=${page * LIMIT}&limit=${LIMIT}`);
            setLogs(res.data);
        } catch (err) {
            toast.error("Failed to load audit logs");
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page]);

    return (
        <div className="animation-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
            <div className="dashboard-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    System Audit Logs
                </h1>
                <button onClick={() => navigate('/admin-dashboard')} className="btn" style={{ marginLeft: 'auto', border: '1px solid var(--border-color)' }}>
                    <ArrowLeft size={16} style={{ marginRight: '4px' }} /> Back to Dashboard
                </button>
            </div>

            <div className="table-container">
                <div className="table-header" style={{ justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Events</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            className="btn"
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            style={{ padding: '4px 8px' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Page {page + 1}</span>
                        <button
                            className="btn"
                            disabled={!logs || logs.length < LIMIT}
                            onClick={() => setPage(p => p + 1)}
                            style={{ padding: '4px 8px' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Ref ID</th>
                                <th>Timestamp</th>
                                <th>System Action</th>
                                <th>Values / Details</th>
                                <th>Actor ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td style={{ color: 'var(--text-secondary)' }}>{log.request_id}</td>
                                    <td style={{ fontSize: '0.875rem' }}>{formatDateSafe(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}</td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                            backgroundColor: log.action === 'ESCALATED' ? '#fee2e2' : '#f3f4f6',
                                            color: log.action === 'ESCALATED' ? '#b91c1c' : '#374151'
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{log.details}</td>
                                    <td>{log.actor_id || 'System'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogViewer;
