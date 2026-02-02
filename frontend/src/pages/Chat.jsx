import React, { useState } from 'react';
import client from '../api/client';
import { Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'こんにちは。何かお困りですか？過去の懸案から解決策を探します。' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await client.post('/api/chat/question', { question: userMsg.text });
            const botMsg = {
                role: 'assistant',
                text: response.data.answer,
                references: response.data.references
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', text: 'すみません、エラーが発生しました。' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container fade-in">
            <div className="chat-history">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-wrapper ${msg.role}`}>
                        <div className="message-bubble">
                            <div className="message-icon">
                                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                            </div>
                            <div className="message-content">
                                <div className="message-text markdown-body">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                                {msg.references && msg.references.length > 0 && (
                                    <div className="references">
                                        <p className="ref-title">参考資料:</p>
                                        <ul>
                                            {msg.references.map(ref => (
                                                <li key={ref.issue_id}>#{ref.issue_id} {ref.title}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message-wrapper assistant">
                        <div className="message-bubble">
                            <div className="message-icon"><Bot size={16} /></div>
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="chat-input-area">
                <form onSubmit={handleSend} className="input-wraper">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="質問を入力してください..."
                        disabled={loading}
                    />
                    <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
