import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import './auth.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(username, password);
            navigate('/');
        } catch (err) {
            setError('登録に失敗しました。ユーザー名が既に使用されている可能性があります。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo-icon-large">AI</div>
                    <h2>新規登録</h2>
                    <p>アカウントを作成して始める</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>ユーザー名</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>パスワード</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="btn-primary full-width" disabled={loading}>
                        <UserPlus size={18} />
                        <span>{loading ? '登録中...' : 'アカウント作成'}</span>
                    </button>
                </form>

                <div className="auth-footer">
                    既にアカウントをお持ちですか？ <Link to="/login">ログイン</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
