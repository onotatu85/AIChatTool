import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MessageSquare, List, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AppShell.css';

const AppShell = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="logo-area">
                    <div className="logo-icon">AI</div>
                    <span className="logo-text">Local Chat</span>
                </div>
                <nav className="nav-menu">
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>ダッシュボード</span>
                    </NavLink>
                    <NavLink to="/issues" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <List size={20} />
                        <span>課題一覧</span>
                    </NavLink>
                    <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <MessageSquare size={20} />
                        <span>チャット</span>
                    </NavLink>
                </nav>
                <div className="sidebar-footer">
                    <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Settings size={20} />
                        <span>設定</span>
                    </NavLink>
                    <button onClick={handleLogout} className="nav-item logout-btn" style={{ width: '100%', border: 'none', background: 'transparent', marginTop: '0.5rem' }}>
                        <LogOut size={20} />
                        <span>ログアウト</span>
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <header className="top-bar">
                    <h1 className="page-title">ワークスペース</h1>
                    <div className="user-profile">
                        <div className="avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
                        <span style={{ marginLeft: '10px', fontSize: '0.9rem' }}>{user?.username}</span>
                    </div>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppShell;
