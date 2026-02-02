import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            // Set default header
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await client.get('/api/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            delete client.defaults.headers.common['Authorization'];
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await client.post('/api/auth/token', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        client.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        await checkAuth(); // Fetch user details
        return true;
    };

    const register = async (username, password) => {
        await client.post('/api/auth/register', { username, password });
        // Auto login after register
        return await login(username, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete client.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
