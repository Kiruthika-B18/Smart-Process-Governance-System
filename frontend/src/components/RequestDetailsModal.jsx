import { X, Clock, User, FileText, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import StatusBadge from './StatusBadge';
import UrgencyBadge from './UrgencyBadge';

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

const RequestDetailsModal = ({ isOpen, onClose, request }) => {
    if (!isOpen || !request) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '600px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                animation: 'modalSlideIn 0.3s ease-out'
            }}>
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f9fafb'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Request Details</h3>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>#{request.id}</div>
                    </div>
                    <button onClick={onClose} className="btn-icon" style={{
                        color: 'var(--text-secondary)',
                        padding: '8px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                    }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>

                    {/* Header Info */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Title</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{request.title}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Status</div>
                            <StatusBadge status={request.status} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Urgency</div>
                            <UrgencyBadge level={request.urgency} />
                        </div>
                    </div>

                    {/* Description Section */}
                    <div style={{ marginBottom: '24px', backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={16} /> Description
                        </div>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {request.description}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>

                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Submitter</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                                    <User size={14} />
                                </div>
                                {request.submitter_username || `User #${request.submitter_id}`}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Assigned To</div>
                            <div style={{ color: 'var(--text-primary)' }}>
                                {request.handler_username ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {request.handler_username.charAt(0).toUpperCase()}
                                        </div>
                                        {request.handler_username}
                                    </span>
                                ) : 'Unassigned'}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Submission Time</div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                {formatDateSafe(request.created_at, 'MMM d, yyyy h:mm a')}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>SLA Deadline</div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                {formatDateSafe(request.sla_deadline, 'MMM d, yyyy h:mm a')}
                                {request.status === 'Pending' && (
                                    <div style={{ color: 'var(--warning-color)', fontSize: '0.75rem', marginTop: '2px' }}>
                                        {formatDistanceSafe(request.sla_deadline)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {(request.status === 'Approved' || request.status === 'Rejected') && (
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                    {request.status} By
                                </div>
                                <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                    {request.actioned_by_username || 'Unknown'}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                    {formatDateSafe(request.updated_at, 'MMM d, yyyy h:mm a')}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rejection Reason */}
                    {request.status === 'Rejected' && request.rejection_reason && (
                        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                            <div style={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertCircle size={16} /> Rejection Reason
                            </div>
                            <div style={{ color: '#7f1d1d', fontSize: '0.875rem' }}>
                                {request.rejection_reason}
                            </div>
                        </div>
                    )}

                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f9fafb' }}>
                    <button onClick={onClose} className="btn" style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestDetailsModal;
