import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
    });

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/user/profile');
                    setUser(data);
                } catch (error) {
                    console.error("Token invalid or expired");
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser({ id: data.id, full_name: data.full_name, email: data.email, profile_pic: data.profile_pic });
        return data;
    };

    const register = async (full_name, email, password) => {
        const { data } = await api.post('/auth/register', { full_name, email, password });
        localStorage.setItem('token', data.token);
        setUser({ id: data.id, full_name: data.full_name, email: data.email, profile_pic: data.profile_pic });
        return data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // ignore
        }
        localStorage.removeItem('token');
        setUser(null);
    };

    const forgotPassword = async (email) => {
        return await api.post('/auth/forgot-password', { email });
    };

    const resetPassword = async (email, token, newPassword) => {
        return await api.post('/auth/reset-password', { email, token, newPassword });
    };

    const updateProfile = async (full_name, profile_pic) => {
        const payload = { full_name };
        if (profile_pic !== undefined) payload.profile_pic = profile_pic;
        const { data } = await api.put('/user/profile', payload);
        setUser({ ...user, full_name: data.full_name, profile_pic: data.profile_pic });
        return data;
    };

    const changePassword = async (currentPassword, newPassword) => {
        return await api.put('/user/change-password', { currentPassword, newPassword });
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        api
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
