import { X, Check } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const DocumentVerificationModal = ({ isOpen, onClose, request, onVerified }) => {
    if (!isOpen || !request) return null;

    const handleVerifyClick = async () => {
        try {
            await api.put(`/requests/${request.id}/verify`);
            toast.success("Documents marked as verified!");
            onVerified();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to verify documents");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animation-fade-in" style={{ maxWidth: '600px', width: '90%' }}>
                <div className="modal-header">
                    <h2>Document Number Verification: #{request.id}</h2>
                    <button onClick={onClose} className="btn" style={{ padding: '4px' }} title="Close">
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Farmer Name</span>
                            <div style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{request.farmer_name || request.submitter_username}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aadhar Number</span>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', fontFamily: 'monospace', padding: '8px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px' }}>{request.aadhar_number || '-'}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PAN Number</span>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', fontFamily: 'monospace', padding: '8px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px' }}>{request.pan_number || '-'}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Survey Number</span>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', fontFamily: 'monospace', padding: '8px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px' }}>{request.survey_number || '-'}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Land Acreage</span>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', padding: '8px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px' }}>{request.land_acreage ? `${request.land_acreage} Acres` : '-'}</div>
                            </div>
                        </div>
                    </div>

                    {request.documents_verified ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', fontWeight: 600 }}>
                            <Check size={20} />
                            Numbers have already been verified.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                            <button className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button className="btn btn-success" onClick={handleVerifyClick} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Check size={18} /> Mark as Verified
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentVerificationModal;
