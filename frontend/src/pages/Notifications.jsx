import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, AlertCircle, Clock, Trash2, CheckCheck, RefreshCw, Search } from 'lucide-react';

const Notifications = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [api]);

    const markAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const clearAll = async () => {
        if (window.confirm('Are you sure you want to delete all notifications?')) {
            try {
                await api.delete('/notifications');
                setNotifications([]);
            } catch (error) {
                console.error('Error clearing notifications:', error);
            }
        }
    };

    const handleNotificationClick = (notif) => {
        if (notif.is_read === 0) {
            markAsRead(notif.id);
        }
        
        // Navigate based on type
        if (notif.post_id) {
            navigate(`/create-post?edit=${notif.post_id}`);
        } else if (notif.type === 'account_warning') {
            navigate('/connected-accounts');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'published': return <CheckCircle2 size={24} color="#22c55e" />;
            case 'failed': return <AlertCircle size={24} color="#ef4444" />;
            case 'partially_published': return <AlertCircle size={24} color="#f97316" />;
            case 'scheduled': 
            case 'rescheduled': 
            case 'unscheduled': return <Clock size={24} color="#eab308" />;
            case 'reminder_30m':
            case 'reminder_10m':
            case 'reminder_1m': return <Bell size={24} color="#3b82f6" />;
            default: return <Bell size={24} color="#94a3b8" />;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'Unread' && n.is_read === 1) return false;
        if (filter === 'Posts' && !n.post_id) return false;
        if (filter === 'Accounts' && n.type !== 'account_warning') return false;
        if (filter === 'System' && n.post_id && n.type !== 'account_warning') return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!n.title.toLowerCase().includes(query) && !n.message.toLowerCase().includes(query)) {
                return false;
            }
        }
        return true;
    });

    const timeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div style={{ padding: '2rem', color: '#f8fafc', animation: 'fadeIn 0.5s ease', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Notifications</h1>
                    <p style={{ color: '#cbd5e1', margin: 0, fontSize: '1rem' }}>Stay updated with your posts and connected accounts.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={markAllAsRead} className="btn-secondary">
                        <CheckCheck size={18} /> Mark all read
                    </button>
                    <button onClick={clearAll} className="btn-danger">
                        <Trash2 size={18} /> Clear all
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input 
                        type="text" 
                        placeholder="Search notifications..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            background: '#0f172a', border: '1px solid #334155', color: '#fff', width: '100%',
                            padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', outline: 'none'
                        }}
                    />
                </div>
                
                <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                    {['All', 'Unread', 'Posts', 'Accounts', 'System'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            background: filter === f ? '#3b82f6' : 'transparent',
                            color: filter === f ? '#fff' : '#94a3b8',
                            border: 'none', padding: '0.6rem 1rem', cursor: 'pointer',
                            fontWeight: 600, transition: 'all 0.2s'
                        }}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#cbd5e1' }}>
                        <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <div>Loading your notifications...</div>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div style={{ 
                        padding: '4rem', textAlign: 'center', background: '#1e293b', 
                        borderRadius: '16px', border: '1px dashed #475569', color: '#94a3b8' 
                    }}>
                        <Bell size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>No notifications yet.</h3>
                        <p style={{ margin: 0 }}>You'll see updates about your posts and accounts here.</p>
                    </div>
                ) : (
                    filteredNotifications.map(notif => (
                        <div key={notif.id} onClick={() => handleNotificationClick(notif)} style={{ 
                            background: notif.is_read ? '#1e293b' : 'rgba(59, 130, 246, 0.1)', 
                            borderRadius: '12px', border: `1px solid ${notif.is_read ? '#334155' : '#3b82f6'}`,
                            padding: '1.25rem', display: 'flex', gap: '1.25rem', cursor: 'pointer',
                            transition: 'all 0.2s', position: 'relative'
                        }} className="notif-card">
                            <div style={{ flexShrink: 0, marginTop: '2px' }}>
                                {getIcon(notif.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: notif.is_read ? '#cbd5e1' : '#fff' }}>
                                        {notif.title}
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                        {timeAgo(notif.created_at)}
                                    </span>
                                </div>
                                <p style={{ margin: '0 0 1rem 0', color: notif.is_read ? '#94a3b8' : '#cbd5e1' }}>
                                    {notif.message}
                                </p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {notif.is_read === 0 && (
                                        <button onClick={(e) => markAsRead(notif.id, e)} className="btn-sm">
                                            Mark as read
                                        </button>
                                    )}
                                    <button onClick={(e) => deleteNotification(notif.id, e)} className="btn-sm btn-sm-danger">
                                        Delete
                                    </button>
                                </div>
                            </div>
                            {notif.is_read === 0 && (
                                <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '4px', height: '60%', background: '#3b82f6', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }} />
                            )}
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .btn-secondary { background: transparent; border: 1px solid #475569; color: #cbd5e1; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; transition: all 0.2s; }
                .btn-secondary:hover { background: #334155; }
                .btn-danger { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; transition: all 0.2s; }
                .btn-danger:hover { background: rgba(239, 68, 68, 0.25); }
                .btn-sm { background: transparent; border: 1px solid #3b82f6; color: #3b82f6; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
                .btn-sm:hover { background: #3b82f6; color: #fff; }
                .btn-sm-danger { background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
                .btn-sm-danger:hover { background: #ef4444; color: #fff; }
                .notif-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); border-color: #475569 !important; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Notifications;
