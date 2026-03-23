import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    // Access token expired — the api interceptor will handle refresh on next request
                    // But we still restore user state from the decoded data
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (!refreshToken) {
                        logout();
                    } else {
                        setUser(decoded);
                    }
                } else {
                    setUser(decoded);
                }
            } catch (e) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password, captchaId, captchaValue) => {
        try {
            const response = await api.post('/auth/login', new URLSearchParams({
                'username': username,
                'password': password
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-captcha-id': captchaId,
                    'x-captcha-value': captchaValue
                }
            });
            const { access_token, refresh_token } = response.data;
            localStorage.setItem('token', access_token);
            if (refresh_token) {
                localStorage.setItem('refresh_token', refresh_token);
            }
            const decoded = jwtDecode(access_token);
            setUser(decoded);
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
