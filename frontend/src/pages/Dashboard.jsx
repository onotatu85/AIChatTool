import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Activity, CheckCircle, Clock } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const response = await client.get('/api/issues/');
            setIssues(response.data);
        } catch (error) {
            console.error('Failed to fetch issues:', error);
        } finally {
            setLoading(false);
        }
    };

    const recentIssues = [...issues].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
    const totalCount = issues.length;
    const resolvedCount = issues.filter(issue => issue.resolution && issue.resolution.trim() !== '').length;

    return (
        <div className="dashboard-container fade-in">
            <h2 className="dashboard-title">ダッシュボード</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-bg purple">
                        <Activity size={24} color="#8b5cf6" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">総件数</span>
                        <span className="stat-value">{totalCount}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-bg green">
                        <CheckCircle size={24} color="#10b981" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">解決済み</span>
                        <span className="stat-value">{resolvedCount}</span>
                    </div>
                </div>
            </div>

            <div className="recent-section">
                <h3 className="section-title">
                    <Clock size={20} />
                    <span>最近の更新</span>
                </h3>
                <div className="recent-list">
                    {loading ? (
                        <p>読み込み中...</p>
                    ) : recentIssues.length > 0 ? (
                        recentIssues.map(issue => (
                            <div key={issue.issue_id} className="recent-item" onClick={() => navigate(`/issues/${issue.issue_id}`)}>
                                <div className="recent-item-header">
                                    <span className="recent-id">#{issue.issue_id}</span>
                                    <span className="recent-title">{issue.title}</span>
                                </div>
                                <span className="recent-date">{new Date(issue.created_at).toLocaleDateString()}</span>
                            </div>
                        ))
                    ) : (
                        <p className="empty-text">データがありません</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
