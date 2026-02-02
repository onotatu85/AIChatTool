import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { ArrowLeft, Save } from 'lucide-react';
import './IssueForm.css';

const IssueForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        resolution: '',
        tags: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            fetchIssue();
        }
    }, [id]);

    const fetchIssue = async () => {
        try {
            const response = await client.get(`/api/issues/${id}`);
            const { title, description, resolution, tags } = response.data;
            setFormData({
                title: title || '',
                description: description || '',
                resolution: resolution || '',
                tags: tags || ''
            });
        } catch (error) {
            console.error('Failed to fetch issue:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await client.put(`/api/issues/${id}`, formData);
            } else {
                await client.post('/api/issues/', formData);
            }
            navigate(isEdit ? `/issues/${id}` : '/issues');
        } catch (error) {
            console.error('Failed to save issue:', error);
            alert('保存に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <button className="btn-secondary" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                    <span>戻る</span>
                </button>
                <div className="header-title">
                    {isEdit ? '課題を編集' : '新規課題作成'}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="issue-form">
                <div className="form-group">
                    <label>タイトル *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>詳細説明</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        className="form-textarea"
                    />
                </div>

                <div className="form-group">
                    <label>解決策</label>
                    <textarea
                        name="resolution"
                        value={formData.resolution}
                        onChange={handleChange}
                        rows={5}
                        className="form-textarea"
                    />
                </div>

                <div className="form-group">
                    <label>タグ (カンマ区切り)</label>
                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="例: server, error, login"
                        className="form-input"
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                        キャンセル
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        <Save size={18} />
                        <span>{loading ? '保存中...' : '保存'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IssueForm;
