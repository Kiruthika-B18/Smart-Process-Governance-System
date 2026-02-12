import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'Employee') navigate('/dashboard');
            else if (user.role === 'Manager' || user.role === 'BackupManager') navigate('/manager-dashboard');
            else if (user.role === 'Administrator') navigate('/admin-dashboard');
            else navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            toast.success("Welcome back!");
        } catch (err) {
            console.error(err);
            toast.error('Invalid credentials');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Sign in to access your dashboard</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '12px' }}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
