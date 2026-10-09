import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Edit2, Trash2, Globe, AlertCircle, RefreshCw, Eye, Search, Filter } from 'lucide-react';

const FacebookIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const InstagramIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
);

const PlatformIcon = ({ platform, size }) => {
    switch (platform.toLowerCase()) {
        case 'facebook': return <FacebookIcon size={size} />;
        case 'instagram': return <InstagramIcon size={size} />;
        default: return <Globe size={size} />;
    }
};

const MyPosts = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState('All');

    // Reschedule Modal State
    const [showModal, setShowModal] = useState(false);
    const [activePost, setActivePost] = useState(null);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [timezone, setTimezone] = useState('Asia/Kolkata');

    // Interactions Modal State
    const [showInteractionsModal, setShowInteractionsModal] = useState(false);
    const [interactionType, setInteractionType] = useState('likes'); // 'likes' or 'comments'
    const [activeInteractionPost, setActiveInteractionPost] = useState(null);

    // Mock data for interactions (Since APIs usually don't give exact names without special permissions)
    const mockInteractions = {
        likes: [
            { id: 1, name: 'Santhosh Kumar', username: 'santhosh', avatar: 'S' },
            { id: 2, name: 'Priya Sharma', username: 'priya_s', avatar: 'P' },
            { id: 3, name: 'Arun Vijay', username: 'arun_v', avatar: 'A' },
            { id: 4, name: 'Karthik Raj', username: 'karthik_r', avatar: 'K' },
            { id: 5, name: 'Meena Iyer', username: 'meena', avatar: 'M' }
        ],
        comments: [
            { id: 1, name: 'Santhosh Kumar', username: 'santhosh', avatar: 'S', text: 'This is amazing! Great work.' },
            { id: 2, name: 'Arun Vijay', username: 'arun_v', avatar: 'A', text: 'Looking forward to more posts like this.' },
            { id: 3, name: 'Priya Sharma', username: 'priya_s', avatar: 'P', text: 'Superb 🔥' }
        ]
    };

    const openInteractions = (post, type) => {
        setActiveInteractionPost(post);
        setInteractionType(type);
        setShowInteractionsModal(true);
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/posts');
            setPosts(data);
            
            // Fetch analytics for published posts
            const publishedPosts = data.filter(p => p.status === 'published' || p.status === 'partially_published');
            for (const p of publishedPosts) {
                try {
                    const res = await api.get(`/posts/${p.id}/analytics`);
                    setAnalytics(prev => ({...prev, [p.id]: res.data}));
                } catch (e) {
                    console.error("Error fetching analytics for post", p.id, e);
                }
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [api]);

    const handleDelete = async (postId) => {
        if (window.confirm('Are you sure you want to completely delete this post? This cannot be undone.')) {
            try {
                await api.delete(`/posts/${postId}`);
                fetchPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post.');
            }
        }
    };

    const handleRetry = async (postId) => {
        if (window.confirm('Retry publishing failed platforms?')) {
            try {
                await api.post(`/posts/${postId}/retry`);
                alert('Publishing retry initiated.');
                fetchPosts();
            } catch (error) {
                console.error('Error retrying post:', error);
                alert('Failed to retry post.');
            }
        }
    };

    const openRescheduleModal = (post) => {
        setActivePost(post);
        if (post.scheduled_at) {
            const dateObj = new Date(post.scheduled_at);
            const local = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString();
            setScheduledDate(local.split('T')[0]);
            setScheduledTime(local.split('T')[1].substring(0, 5));
        } else {
            setScheduledDate('');
            setScheduledTime('');
        }
        setTimezone(post.timezone || 'Asia/Kolkata');
        setShowModal(true);
    };

    const handleReschedule = async () => {
        if (!scheduledDate || !scheduledTime) {
            alert("Please select a date and time.");
            return;
        }
        const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        if (selectedDateTime <= new Date()) {
            alert("Please select a future date and time.");
            return;
        }

        try {
            await api.put(`/posts/${activePost.id}/reschedule`, {
                scheduledAt: selectedDateTime.toISOString(),
                timezone
            });
            alert('Post rescheduled successfully.');
            setShowModal(false);
            fetchPosts();
        } catch (error) {
            console.error('Error rescheduling post:', error);
            alert('Failed to reschedule post.');
        }
    };

    const handleEdit = (postId) => {
        navigate(`/create-post?edit=${postId}`);
    };

    // Filter Logic
    const filteredPosts = posts.filter(post => {
        // Status Filter
        if (activeTab !== 'All') {
            if (activeTab === 'Drafts' && post.status !== 'draft') return false;
            if (activeTab === 'Scheduled' && post.status !== 'scheduled') return false;
            if (activeTab === 'Published' && post.status !== 'published') return false;
            if (activeTab === 'Failed' && post.status !== 'failed' && post.status !== 'partially_published') return false;
        }

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const captionMatch = (post.caption || '').toLowerCase().includes(query);
            const statusMatch = (post.status || '').toLowerCase().includes(query);
            if (!captionMatch && !statusMatch) return false;
        }

        // Platform Filter
        if (platformFilter !== 'All') {
            if (!post.platforms?.some(p => p.platform.toLowerCase() === platformFilter.toLowerCase())) return false;
        }

        return true;
    });

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'published': return '#22c55e'; // green
            case 'failed': return '#ef4444'; // red
            case 'scheduled': return '#eab308'; // yellow
            case 'draft': return '#94a3b8'; // gray
            case 'partially_published': return '#f97316'; // orange
            default: return '#94a3b8';
        }
    };

    return (
        <div style={{ padding: '1.5rem', color: '#f8fafc', animation: 'fadeIn 0.5s ease', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>My Posts</h1>
                    <p style={{ color: '#cbd5e1', margin: 0, fontSize: '1rem' }}>Manage your drafts, scheduled, published and failed posts in one place.</p>
                </div>
                
                {/* Search and Filters */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input 
                            type="text" 
                            placeholder="Search posts..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                background: '#0f172a', border: '1px solid #334155', color: '#fff',
                                padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', outline: 'none'
                            }}
                        />
                    </div>
                    <select 
                        value={platformFilter}
                        onChange={e => setPlatformFilter(e.target.value)}
                        style={{
                            background: '#0f172a', border: '1px solid #334155', color: '#fff',
                            padding: '0.6rem 1rem', borderRadius: '8px', outline: 'none', cursor: 'pointer'
                        }}
                    >
                        <option value="All">All Platforms</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="X">X (Twitter)</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Threads">Threads</option>
                        <option value="Pinterest">Pinterest</option>
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem', overflowX: 'auto' }}>
                {['All', 'Drafts', 'Scheduled', 'Published', 'Failed'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: activeTab === tab ? '#3b82f6' : 'transparent',
                            color: activeTab === tab ? '#fff' : '#94a3b8',
                            border: 'none',
                            padding: '0.5rem 1.25rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#cbd5e1' }}>
                    <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <div>Loading your posts...</div>
                </div>
            ) : filteredPosts.length === 0 ? (
                <div style={{ 
                    padding: '4rem', textAlign: 'center', background: '#1e293b', 
                    borderRadius: '16px', border: '1px dashed #475569', color: '#94a3b8' 
                }}>
                    <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>
                        {searchQuery || platformFilter !== 'All' ? 'No matches found' : `No ${activeTab.toLowerCase()} posts`}
                    </h3>
                    <p style={{ margin: 0 }}>Create a new post to get started.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {filteredPosts.map(post => {
                        const dateObj = post.scheduled_at ? new Date(post.scheduled_at) : (post.created_at ? new Date(post.created_at) : null);
                        return (
                            <div key={post.id} className="post-card" style={{ 
                                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', 
                                borderRadius: '20px', 
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                overflow: 'hidden',
                                flexWrap: 'wrap',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative'
                            }}>
                                {post.media_url && (
                                    <div style={{ width: '120px', height: '120px', background: '#0f172a', flexShrink: 0, margin: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                                        {post.media_type === 'video' || post.media_url.endsWith('.mp4') ? (
                                            <video src={post.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls preload="metadata" />
                                        ) : (
                                            <img src={post.media_url} alt="Post media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                )}
                                
                                <div style={{ flex: 1, padding: '1.5rem 1.5rem 1.5rem 0', display: 'flex', flexDirection: 'column', minWidth: '300px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {post.platforms?.map(p => (
                                                <div key={p.social_account_id} style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                    background: '#0f172a', padding: '0.25rem 0.75rem', borderRadius: '20px',
                                                    border: '1px solid #334155', fontSize: '0.8rem',
                                                    color: p.status === 'failed' ? '#ef4444' : p.status === 'published' ? '#22c55e' : '#cbd5e1'
                                                }}>
                                                    <PlatformIcon platform={p.platform} size={14} />
                                                    <span style={{ textTransform: 'capitalize' }}>{p.platform}</span>
                                                    {p.status === 'failed' && <span style={{ marginLeft: '0.25rem' }} title={p.error_message}>⚠️</span>}
                                                </div>
                                            ))}
                                            {(!post.platforms || post.platforms.length === 0) && (
                                                <div style={{
                                                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem'
                                                }}>No platforms selected</div>
                                            )}
                                        </div>
                                        <div style={{ 
                                            background: `${getStatusColor(post.status)}20`,
                                            color: getStatusColor(post.status),
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            border: `1px solid ${getStatusColor(post.status)}40`,
                                            textTransform: 'capitalize'
                                        }}>
                                            {post.status}
                                        </div>
                                    </div>
                                    
                                    <p style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', lineHeight: '1.5', flex: 1, whiteSpace: 'pre-wrap' }}>
                                        {post.caption || <span style={{ color: '#64748b', fontStyle: 'italic' }}>No caption</span>}
                                    </p>
                                    
                                    {post.status === 'published' && (
                                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', borderTop: '1px solid #334155', borderBottom: '1px solid #334155', padding: '0.75rem 0' }}>
                                            <div 
                                                onClick={() => openInteractions(post, 'likes')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '8px', transition: 'background 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                                <span style={{ fontWeight: 600, color: '#f8fafc' }}>{analytics[post.id]?.likes ?? 0}</span> Likes
                                            </div>
                                            <div 
                                                onClick={() => openInteractions(post, 'comments')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '8px', transition: 'background 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                                <span style={{ fontWeight: 600, color: '#f8fafc' }}>{analytics[post.id]?.comments ?? 0}</span> Comments
                                            </div>
                                            <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                                                {analytics[post.id] ? (
                                                    <span style={{ background: '#22c55e20', color: '#22c55e', padding: '2px 8px', borderRadius: '12px' }}>Live Data</span>
                                                ) : (
                                                    <span style={{ background: '#f59e0b20', color: '#f59e0b', padding: '2px 8px', borderRadius: '12px' }}>Loading...</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                            {dateObj && (
                                                <>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Calendar size={16} />
                                                        {dateObj.toLocaleDateString()}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Clock size={16} />
                                                        {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            {post.status === 'draft' || post.status === 'scheduled' ? (
                                                <button onClick={() => handleEdit(post.id)} className="btn-secondary">
                                                    <Edit2 size={16} /> Edit
                                                </button>
                                            ) : null}
                                            
                                            {post.status === 'scheduled' && (
                                                <button onClick={() => openRescheduleModal(post)} className="btn-secondary">
                                                    <Clock size={16} /> Reschedule
                                                </button>
                                            )}

                                            {(post.status === 'failed' || post.status === 'partially_published') && (
                                                <button onClick={() => handleRetry(post.id)} className="btn-secondary" style={{ borderColor: 'rgba(239,68,68,0.5)', color: '#ef4444' }}>
                                                    <RefreshCw size={16} /> Retry Failed
                                                </button>
                                            )}

                                            <button onClick={() => handleDelete(post.id)} className="btn-danger">
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Reschedule Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{
                        background: '#1e293b', padding: '2rem', borderRadius: '16px',
                        width: '100%', maxWidth: '400px', border: '1px solid #334155'
                    }}>
                        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>Reschedule Post</h2>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Date</label>
                            <input 
                                type="date" 
                                className="form-input" 
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Time</label>
                            <input 
                                type="time" 
                                className="form-input"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: 'transparent', border: '1px solid #475569', color: '#cbd5e1',
                                    padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleReschedule}
                                style={{
                                    background: '#3b82f6', border: 'none', color: '#fff',
                                    padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interactions Modal (Likes/Comments Viewer) */}
            {showInteractionsModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s ease', backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
                        padding: '0', borderRadius: '20px',
                        width: '100%', maxWidth: '450px', border: '1px solid rgba(255,255,255,0.1)',
                        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {interactionType === 'likes' ? (
                                    <><svg width="20" height="20" viewBox="0 0 24 24" fill="#f43f5e" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Post Likes</>
                                ) : (
                                    <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> Post Comments</>
                                )}
                            </h2>
                            <button onClick={() => setShowInteractionsModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem' }} className="interaction-scroll">
                            {mockInteractions[interactionType].map((interaction, index) => (
                                <a key={index} 
                                   href={`https://instagram.com/${interaction.username}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   style={{ 
                                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                                    borderBottom: index !== mockInteractions[interactionType].length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    transition: 'background 0.2s', borderRadius: '12px', cursor: 'pointer', textDecoration: 'none'
                                }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff', flexShrink: 0 }}>
                                        {interaction.avatar}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#38bdf8', fontSize: '0.95rem' }}>{interaction.name} <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'normal' }}>@{interaction.username}</span></div>
                                        {interactionType === 'comments' ? (
                                            <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '0.2rem' }}>{interaction.text}</div>
                                        ) : (
                                            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.1rem' }}>Liked this post</div>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                            Demo Data (Social platforms require elevated API permissions to fetch actual user names).
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                .btn-secondary {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #e2e8f0;
                    padding: 0.6rem 1.2rem;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .btn-secondary:hover { 
                    background: rgba(255, 255, 255, 0.1); 
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .btn-danger {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    padding: 0.6rem 1.2rem;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .btn-danger:hover { 
                    background: rgba(239, 68, 68, 0.2); 
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.2);
                    border-color: rgba(239, 68, 68, 0.4);
                }
                .post-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    z-index: 1;
                }
                .post-card:hover {
                    transform: translateY(-5px) scale(1.01);
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.6);
                    border-color: rgba(255, 255, 255, 0.15);
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default MyPosts;
