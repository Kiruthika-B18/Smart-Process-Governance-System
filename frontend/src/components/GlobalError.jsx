import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class GlobalError extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: 'var(--background-color)',
                    color: 'var(--text-primary)'
                }}>
                    <div className="animation-fade-in" style={{ maxWidth: '500px' }}>
                        <AlertTriangle size={64} color="var(--status-rejected-text)" style={{ marginBottom: '24px' }} />
                        <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Something went wrong</h1>
                        <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
                            The application encountered an unexpected error.
                        </p>

                        {this.state.error && (
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                textAlign: 'left',
                                overflow: 'auto',
                                maxHeight: '200px',
                                fontSize: '0.875rem',
                                fontFamily: 'monospace'
                            }}>
                                {this.state.error.toString()}
                            </div>
                        )}

                        <button
                            onClick={this.handleReload}
                            className="btn btn-primary"
                            style={{ margin: '0 auto' }}
                        >
                            <RefreshCw size={18} style={{ marginRight: '8px' }} />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalError;
