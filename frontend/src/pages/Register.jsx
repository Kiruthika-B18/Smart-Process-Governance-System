import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Tractor, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Aadhar numbers (passwords) do not match!");
            return;
        }

        if (password.length < 8) {
            toast.error("Aadhar number must be exactly 12 digits");
            return;
        }

        if (password.length !== 12 || !/^\d+$/.test(password)) {
            toast.error("Please enter a valid 12-digit Aadhar number");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                username: username,
                password: password,
                role: "Farmer"
            };

            await api.post('/auth/register', payload);
            toast.success("Registration successful! You may now log in.");
            navigate('/login');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Registration failed. Username may already exist.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--primary-color)' }}>
                    <ShieldCheck size={48} />
                </div>

                <div className="login-header">
                    <h2 className="login-title">Farmer Registration</h2>
                    <p className="login-subtitle">Enroll to submit agricultural requests</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                type="text"
                                placeholder="E.g., farmer_ravi"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Aadhar Card Number</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="12-digit Aadhar"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                maxLength={12}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                title={showPassword ? 'Hide' : 'Show'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Aadhar Card</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Re-enter 12-digit Aadhar"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                maxLength={12}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                title={showConfirmPassword ? 'Hide' : 'Show'}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '12px' }} disabled={isLoading}>
                        {isLoading ? 'Registering...' : 'Register Account'}
                    </button>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                            Already registered? Return to Login
                        </Link>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default Register;
