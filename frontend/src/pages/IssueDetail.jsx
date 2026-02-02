import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import './IssueDetail.css';

const IssueDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIssue();
    }, [id]);

    const fetchIssue = async () => {
        try {
            const response = await client.get(`/api/issues/${id}`);
            setIssue(response.data);
        } catch (error) {
            console.error('Failed to fetch issue:', error);
            // Optionally redirect or show error
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('本当に削除しますか？')) return;
        try {
            await client.delete(`/api/issues/${id}`);
            navigate('/issues');
        } catch (error) {
            console.error('Failed to delete issue:', error);
            alert('削除に失敗しました');
        }
    };

    if (loading) return <div className="page-container">読み込み中...</div>;
    if (!issue) return <div className="page-container">課題が見つかりません</div>;

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <button className="btn-secondary" onClick={() => navigate('/issues')}>
                    <ArrowLeft size={18} />
                    <span>戻る</span>
                </button>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => navigate(`/issues/${id}/edit`)}>
                        <Edit size={18} />
                        <span>編集</span>
                    </button>
                    <button className="btn-danger" onClick={handleDelete}>
                        <Trash2 size={18} />
                        <span>削除</span>
                    </button>
                </div>
            </div>

            <div className="issue-detail-card">
                <h1 className="detail-title">{issue.title}</h1>
                <div className="detail-meta">
                    <span className="meta-item">ID: #{issue.issue_id}</span>
                    <span className="meta-item">作成者: {issue.creator ? issue.creator.username : '不明'}</span>
                    <span className="meta-item">作成日時: {new Date(issue.created_at).toLocaleString()}</span>
                    {issue.tags && <span className="meta-tag">{issue.tags}</span>}
                </div>

                <div className="detail-section">
                    <h3>詳細</h3>
                    <div className="detail-content">{issue.description || '説明なし'}</div>
                </div>

                <div className="detail-section">
                    <h3>解決策</h3>
                    <div className="detail-content">{issue.resolution || '解決策なし'}</div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;
