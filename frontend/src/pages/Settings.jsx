import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Server, Activity, Cpu, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const response = await client.get('/api/settings/status');
            setStatus(response.data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setStatus({ error: true });
        } finally {
            setLoading(false);
        }
    };

    const handleConnectionTest = async () => {
        setTesting(true);
        // Re-fetch status which triggers the check in backend
        await fetchStatus();
        setTesting(false);
    };

    if (loading && !status) return <div className="page-container"><p>読み込み中...</p></div>;

    return (
        <div className="page-container fade-in">
            <h2 className="page-title">システム設定</h2>

            <div className="settings-grid">
                {/* AI Model Settings Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <Cpu className="card-icon" />
                        <h3>AIモデル設定</h3>
                    </div>
                    <div className="card-content">
                        <div className="setting-item">
                            <label>使用モデル</label>
                            <div className="value-display">
                                {status?.llm_model || '不明'}
                            </div>
                        </div>
                        <div className="setting-item">
                            <label>Ollama エンドポイント</label>
                            <div className="value-display code-font">
                                {status?.ollama_url || '不明'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Status Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <Activity className="card-icon" />
                        <h3>システムステータス</h3>
                    </div>
                    <div className="card-content">
                        <div className="status-indicator">
                            <label>AIサーバー接続</label>
                            <div className={`status-badge ${status?.ollama_status === 'ok' ? 'success' : 'error'}`}>
                                {status?.ollama_status === 'ok' ? (
                                    <><CheckCircle size={16} /> 接続OK</>
                                ) : (
                                    <><AlertCircle size={16} /> 接続エラー</>
                                )}
                            </div>
                        </div>

                        {status?.message && (
                            <div className="status-message">
                                {status.message}
                            </div>
                        )}

                        <div className="action-area">
                            <button
                                className="btn-secondary"
                                onClick={handleConnectionTest}
                                disabled={testing}
                            >
                                <RefreshCw size={16} className={testing ? 'spin' : ''} />
                                <span>{testing ? 'テスト中...' : '接続テスト'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* App Info Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <Server className="card-icon" />
                        <h3>アプリケーション情報</h3>
                    </div>
                    <div className="card-content">
                        <div className="setting-item">
                            <label>バージョン</label>
                            <div>v1.0.0</div>
                        </div>
                        <div className="setting-item">
                            <label>環境</label>
                            <div>Development (Local)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
