import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Tractor, ShieldAlert, RefreshCw, KeyRound, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const Login = () => {
    const [loginType, setLoginType] = useState('farmer'); // 'farmer' or 'officer'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [captchaId, setCaptchaId] = useState('');
    const [captchaImage, setCaptchaImage] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchCaptcha = async () => {
        try {
            console.log("Fetching CAPTCHA...");
            const res = await api.get('/auth/captcha');
            console.log("CAPTCHA Response:", res.data);
            setCaptchaId(res.data.captcha_id);
            setCaptchaImage(res.data.image_data);
            setCaptchaInput('');
        } catch (error) {
            console.error("Failed to load CAPTCHA! Full error:", error);
            if (error.response) {
                console.error("Error Response:", error.response.status, error.response.data);
            }
            toast.error("Security core offline. Re-initializing...");
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, []);

    useEffect(() => {
        if (user) {
            if (user.role === 'Farmer') navigate('/dashboard');
            else if (user.role === 'VillageOfficer') navigate('/village-dashboard');
            else if (user.role === 'BlockOfficer') navigate('/block-dashboard');
            else if (user.role === 'DistrictOfficer') navigate('/district-dashboard');
            else if (user.role === 'Director') navigate('/admin-dashboard');
            else navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password, captchaId, captchaInput);
            toast.success("Welcome back!");
        } catch (err) {
            console.error(err);
            if (err.response?.data?.detail?.toLowerCase().includes("captcha")) {
                toast.error(err.response.data.detail);
            } else {
                toast.error(loginType === 'farmer' ? 'Invalid Name or Aadhar' : 'Invalid Option/Credentials');
            }
            // Always refresh captcha on failure
            fetchCaptcha();
        }
    };

    const toggleLoginType = () => {
        setLoginType(prev => prev === 'farmer' ? 'officer' : 'farmer');
        setUsername('');
        setPassword('');
        setCaptchaInput('');
        fetchCaptcha();
    };

    return (
        <div className="login-container">
            <div className="login-card">

                {/* Clickable Logo switches the form mode */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <button
                        onClick={toggleLoginType}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
                        title={`Switch to ${loginType === 'farmer' ? 'Officer' : 'Farmer'} Login`}
                    >
                        {loginType === 'farmer' ? <Tractor size={48} /> : <ShieldAlert size={48} />}
                    </button>
                </div>

                <div className="login-header">
                    <h2 className="login-title">
                        {loginType === 'farmer' ? 'Farmer Portal' : 'Officer Portal'}
                    </h2>
                    <p className="login-subtitle">
                        {loginType === 'farmer' ? 'Sign in with Name and Aadhar' : 'Authorized Personnel Only'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{loginType === 'farmer' ? 'Farmer Name' : 'Username'}</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                type="text"
                                placeholder={loginType === 'farmer' ? 'Enter your name (e.g., farmer_ravi)' : 'Enter your official username'}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{loginType === 'farmer' ? 'Aadhar Card Number' : 'Password'}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                                type={loginType === 'farmer' || showPassword ? 'text' : 'password'}
                                placeholder={loginType === 'farmer' ? '12-digit Aadhar (Password)' : 'Enter your password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                maxLength={loginType === 'farmer' ? 12 : undefined}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* CAPTCHA Section */}
                    <div className="form-group" style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label className="form-label" style={{ margin: 0 }}>Security Verification</label>
                            <button
                                type="button"
                                onClick={fetchCaptcha}
                                title="Refresh Verification Code"
                                className="btn-icon"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', padding: '4px' }}
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#f9fafb', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            {captchaImage ? (
                                <img src={captchaImage} alt="CAPTCHA" style={{ borderRadius: '4px', border: '1px solid #e5e7eb', height: '45px', objectFit: 'contain' }} />
                            ) : (
                                <div style={{ height: '45px', width: '120px', backgroundColor: '#e5e7eb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#6b7280' }}>Loading...</div>
                            )}

                            <div style={{ position: 'relative', flex: 1 }}>
                                <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '36px', height: '45px' }}
                                    type="text"
                                    placeholder="Enter text"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    required
                                    maxLength={5}
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '12px' }}>
                        {loginType === 'farmer' ? 'Access Services' : 'Secure Sign In'}
                    </button>

                    {loginType === 'farmer' && (
                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                                New Farmer? Register Here
                            </Link>
                        </div>
                    )}
                </form>

            </div>
        </div>
    );
};

export default Login;
