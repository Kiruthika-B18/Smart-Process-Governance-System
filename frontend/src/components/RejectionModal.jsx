import { useState } from 'react';

const RejectionModal = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(reason);
        setReason('');
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(2px)'
    };

    const modalStyle = {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        animation: 'fadeIn 0.2s ease-out'
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: 'var(--danger-color)' }}>Reject Request</h2>
                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Reason for Rejection</label>
                    <textarea
                        className="input-field"
                        rows="4"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please explain why this request is being rejected..."
                        required
                        style={{ marginBottom: '16px' }}
                    ></textarea>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-danger"
                        >
                            Reject Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RejectionModal;
