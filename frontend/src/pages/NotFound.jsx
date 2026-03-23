import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: 'var(--background-color)',
            textAlign: 'center',
            padding: '24px'
        }}>
            <div className="animation-fade-in">
                <AlertTriangle size={64} color="var(--status-escalated-text)" style={{ marginBottom: '24px' }} />
                <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>404</h1>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Page Not Found</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px' }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontSize: '1rem' }}
                >
                    <Home size={20} style={{ marginRight: '8px' }} />
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default NotFound;
