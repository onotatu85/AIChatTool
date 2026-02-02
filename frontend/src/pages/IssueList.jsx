import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Search, Plus, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import './IssueList.css';

const IssueList = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, resolved, open

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

    const isResolved = (issue) => issue.resolution && issue.resolution.trim() !== '';

    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase()) ||
            (issue.tags && issue.tags.toLowerCase().includes(search.toLowerCase()));

        const resolved = isResolved(issue);
        const matchesFilter =
            filterStatus === 'all' ? true :
                filterStatus === 'resolved' ? resolved :
                    !resolved; // open

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="課題を検索..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="filter-dropdown">
                    <Filter size={18} className="filter-icon" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">すべて</option>
                        <option value="resolved">解決済み</option>
                        <option value="open">未解決</option>
                    </select>
                </div>

                <button className="btn-primary" onClick={() => navigate('/issues/new')}>
                    <Plus size={18} />
                    <span>新規作成</span>
                </button>
            </div>

            <div className="issues-grid">
                {loading ? (
                    <p className="loading-text">読み込み中...</p>
                ) : filteredIssues.length > 0 ? (
                    filteredIssues.map(issue => {
                        const resolved = isResolved(issue);
                        return (
                            <div
                                key={issue.issue_id}
                                className="issue-card"
                                onClick={() => navigate(`/issues/${issue.issue_id}`)}
                                style={{ cursor: 'pointer', borderLeft: resolved ? '4px solid #10b981' : '4px solid #f59e0b' }}
                            >
                                <div className="issue-header">
                                    <div className="header-left">
                                        <h3 className="issue-title">{issue.title}</h3>
                                        {resolved ?
                                            <span className="status-badge success"><CheckCircle size={12} /> 解決済</span> :
                                            <span className="status-badge warning"><AlertCircle size={12} /> 未解決</span>
                                        }
                                    </div>
                                    {issue.tags && <span className="issue-tag">{issue.tags}</span>}
                                </div>
                                <p className="issue-desc">{issue.description || '説明はありません。'}</p>
                                <div className="issue-footer">
                                    <span className="issue-date">{new Date(issue.created_at).toLocaleDateString()}</span>
                                    <span className="issue-date">{issue.creator ? `by ${issue.creator.username}` : ''}</span>
                                    <span className="issue-id">#{issue.issue_id}</span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="empty-text">課題が見つかりません。</p>
                )}
            </div>
        </div>
    );
};

export default IssueList;
