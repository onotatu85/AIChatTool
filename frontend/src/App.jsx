import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/Layout/AppShell';
import IssueList from './pages/IssueList';
import IssueDetail from './pages/IssueDetail';
import IssueForm from './pages/IssueForm';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/global.css';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="issues" element={<IssueList />} />
              <Route path="issues/new" element={<IssueForm />} />
              <Route path="issues/:id" element={<IssueDetail />} />
              <Route path="issues/:id/edit" element={<IssueForm />} />
              <Route path="chat" element={<Chat />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
