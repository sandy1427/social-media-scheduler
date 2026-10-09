import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Edit2, Trash2, Globe, AlertCircle, RefreshCw, Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

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

const ContentCalendar = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewType, setViewType] = useState('month'); // 'month', 'week', 'day'
    
    // Filters
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState('All');

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [activePost, setActivePost] = useState(null);
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [timezone, setTimezone] = useState('Asia/Kolkata');

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/posts');
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [api]);

    // Navigation
    const nextPeriod = () => {
        setCurrentDate(prev => {
            const next = new Date(prev);
            if (viewType === 'month') next.setMonth(next.getMonth() + 1);
            else if (viewType === 'week') next.setDate(next.getDate() + 7);
            else next.setDate(next.getDate() + 1);
            return next;
        });
    };

    const prevPeriod = () => {
        setCurrentDate(prev => {
            const prevD = new Date(prev);
            if (viewType === 'month') prevD.setMonth(prevD.getMonth() - 1);
            else if (viewType === 'week') prevD.setDate(prevD.getDate() - 7);
            else prevD.setDate(prevD.getDate() - 1);
            return prevD;
        });
    };

    const goToday = () => setCurrentDate(new Date());

    // Filtering logic
    const filteredPosts = posts.filter(post => {
        if (activeTab !== 'All') {
            if (activeTab === 'Drafts' && post.status !== 'draft') return false;
            if (activeTab === 'Scheduled' && post.status !== 'scheduled') return false;
            if (activeTab === 'Published' && post.status !== 'published') return false;
            if (activeTab === 'Failed' && post.status !== 'failed' && post.status !== 'partially_published') return false;
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const captionMatch = (post.caption || '').toLowerCase().includes(query);
            if (!captionMatch) return false;
        }
        if (platformFilter !== 'All') {
            if (!post.platforms?.some(p => p.platform.toLowerCase() === platformFilter.toLowerCase())) return false;
        }
        return true;
    });

    const unscheduledDrafts = filteredPosts.filter(p => p.status === 'draft' && !p.scheduled_at);
    const scheduledPosts = filteredPosts.filter(p => p.scheduled_at || p.published_at || p.status !== 'draft');

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

    // Render Calendar Logic
    const renderCalendarGrid = () => {
        if (viewType === 'month') {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            const weeks = [];
            let days = [];
            
            // Empty cells for days before the 1st
            for (let i = 0; i < firstDay; i++) {
                days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
            }
            
            for (let d = 1; d <= daysInMonth; d++) {
                const currentCellDate = new Date(year, month, d);
                // Find posts for this day
                const dayPosts = scheduledPosts.filter(post => {
                    const postDate = new Date(post.scheduled_at || post.created_at);
                    return postDate.getFullYear() === year && postDate.getMonth() === month && postDate.getDate() === d;
                });

                days.push(
                    <div key={`day-${d}`} className="calendar-cell" onClick={() => {
                        if(dayPosts.length === 0) navigate('/create-post');
                    }}>
                        <div className="day-number">{d}</div>
                        <div className="events-container">
                            {dayPosts.map(post => (
                                <div key={post.id} className="event-badge" style={{ borderLeft: `3px solid ${getStatusColor(post.status)}` }} onClick={(e) => { e.stopPropagation(); openPostDetails(post); }}>
                                    <div className="event-time">
                                        {new Date(post.scheduled_at || post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    <div className="event-title">
                                        {post.platforms?.[0] ? <PlatformIcon platform={post.platforms[0].platform} size={10} /> : <Globe size={10} />}
                                        <span className="truncate">{post.caption || 'No caption'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
                
                if (days.length === 7) {
                    weeks.push(<div key={`week-${weeks.length}`} className="calendar-row">{days}</div>);
                    days = [];
                }
            }
            
            // Fill remaining empty cells
            if (days.length > 0) {
                while (days.length < 7) {
                    days.push(<div key={`empty-end-${days.length}`} className="calendar-cell empty"></div>);
                }
                weeks.push(<div key={`week-${weeks.length}`} className="calendar-row">{days}</div>);
            }
            
            return (
                <div className="calendar-grid">
                    <div className="calendar-header-row">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    {weeks}
                </div>
            );
        } else if (viewType === 'week') {
            const current = new Date(currentDate);
            const first = current.getDate() - current.getDay();
            const weekDays = [];
            
            for(let i=0; i<7; i++) {
                const dayDate = new Date(current.setDate(first + i));
                
                const dayPosts = scheduledPosts.filter(post => {
                    const postDate = new Date(post.scheduled_at || post.created_at);
                    return postDate.getFullYear() === dayDate.getFullYear() && postDate.getMonth() === dayDate.getMonth() && postDate.getDate() === dayDate.getDate();
                });

                weekDays.push(
                    <div key={`wday-${i}`} className="calendar-col">
                        <div className="col-header">{dayDate.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}</div>
                        <div className="col-body" onClick={() => { if(dayPosts.length === 0) navigate('/create-post'); }}>
                            {dayPosts.map(post => (
                                <div key={post.id} className="event-card" style={{ borderLeft: `4px solid ${getStatusColor(post.status)}` }} onClick={(e) => { e.stopPropagation(); openPostDetails(post); }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span className="event-time">{new Date(post.scheduled_at || post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        <span style={{ color: getStatusColor(post.status), fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>{post.status}</span>
                                    </div>
                                    <div className="event-title">
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {post.platforms?.map(p => <PlatformIcon key={p.platform} platform={p.platform} size={12} />)}
                                        </div>
                                    </div>
                                    <div className="truncate-2lines" style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>{post.caption || 'No caption'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
            
            return <div className="week-grid">{weekDays}</div>;
        } else {
            // Day View
            const dayPosts = scheduledPosts.filter(post => {
                const postDate = new Date(post.scheduled_at || post.created_at);
                return postDate.getFullYear() === currentDate.getFullYear() && postDate.getMonth() === currentDate.getMonth() && postDate.getDate() === currentDate.getDate();
            });
            dayPosts.sort((a,b) => new Date(a.scheduled_at || a.created_at) - new Date(b.scheduled_at || b.created_at));

            return (
                <div className="day-grid">
                    <div className="day-header">{currentDate.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}</div>
                    <div className="day-body" onClick={() => { if(dayPosts.length === 0) navigate('/create-post'); }}>
                        {dayPosts.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No posts scheduled for today. Click to create one.</div>
                        ) : (
                            <div className="timeline">
                                {dayPosts.map(post => (
                                    <div key={post.id} className="timeline-item" onClick={(e) => { e.stopPropagation(); openPostDetails(post); }}>
                                        <div className="timeline-time">{new Date(post.scheduled_at || post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        <div className="timeline-content event-card" style={{ borderLeft: `4px solid ${getStatusColor(post.status)}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {post.platforms?.map(p => <PlatformIcon key={p.platform} platform={p.platform} size={16} />)}
                                                </div>
                                                <span style={{ color: getStatusColor(post.status), fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', background: `${getStatusColor(post.status)}20`, padding: '2px 8px', borderRadius: '12px' }}>{post.status}</span>
                                            </div>
                                            <div style={{ color: '#f8fafc', whiteSpace: 'pre-wrap' }}>{post.caption || <span style={{ color: '#64748b' }}>No caption</span>}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    };

    // Actions
    const openPostDetails = (post) => {
        setActivePost(post);
        setIsRescheduling(false);
        setShowModal(true);
    };

    const handleDelete = async (postId) => {
        if (window.confirm('Are you sure you want to completely delete this post? This cannot be undone.')) {
            try {
                await api.delete(`/posts/${postId}`);
                setShowModal(false);
                fetchPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post.');
            }
        }
    };

    const handleRescheduleSubmit = async () => {
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

    return (
        <div style={{ padding: '1.5rem', color: '#f8fafc', animation: 'fadeIn 0.5s ease', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Content Calendar</h1>
                    <p style={{ color: '#cbd5e1', margin: 0, fontSize: '1rem' }}>Plan, schedule and manage your social media content.</p>
                </div>
                
                <button onClick={() => navigate('/create-post')} style={{
                    background: '#3b82f6', color: '#fff', border: 'none', padding: '0.75rem 1.5rem',
                    borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
                }}>
                    <Plus size={18} /> Create Post
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input 
                        type="text" 
                        placeholder="Search posts..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            background: '#0f172a', border: '1px solid #334155', color: '#fff', width: '100%',
                            padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', outline: 'none'
                        }}
                    />
                </div>
                {/* Platform Filter */}
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
                {/* Status Filter */}
                <select 
                    value={activeTab}
                    onChange={e => setActiveTab(e.target.value)}
                    style={{
                        background: '#0f172a', border: '1px solid #334155', color: '#fff',
                        padding: '0.6rem 1rem', borderRadius: '8px', outline: 'none', cursor: 'pointer'
                    }}
                >
                    <option value="All">All Statuses</option>
                    <option value="Drafts">Drafts</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                    <option value="Failed">Failed</option>
                </select>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                {/* Main Calendar Area */}
                <div style={{ flex: 3, display: 'flex', flexDirection: 'column', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
                    
                    {/* Calendar Toolbar */}
                    <div style={{ padding: '1rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-icon" onClick={prevPeriod}><ChevronLeft size={20} /></button>
                            <button className="btn-icon" onClick={goToday}>Today</button>
                            <button className="btn-icon" onClick={nextPeriod}><ChevronRight size={20} /></button>
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                            {viewType === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            {viewType === 'week' && `Week of ${new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}`}
                            {viewType === 'day' && currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </h2>
                        <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                            {['month', 'week', 'day'].map(v => (
                                <button key={v} onClick={() => setViewType(v)} style={{
                                    background: viewType === v ? '#3b82f6' : 'transparent',
                                    color: viewType === v ? '#fff' : '#94a3b8',
                                    border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
                                    textTransform: 'capitalize', fontWeight: 600
                                }}>
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Calendar Body */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
                                <RefreshCw size={24} className="spin" style={{ marginRight: '8px' }} /> Loading calendar...
                            </div>
                        ) : (
                            renderCalendarGrid()
                        )}
                    </div>
                </div>

                {/* Sidebar area for Unscheduled Drafts */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #334155', background: '#0f172a' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Unscheduled Drafts</h3>
                    </div>
                    <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {unscheduledDrafts.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>No unscheduled drafts.</div>
                        ) : (
                            unscheduledDrafts.map(draft => (
                                <div key={draft.id} className="draft-card" onClick={() => openPostDetails(draft)}>
                                    <div className="truncate-2lines" style={{ marginBottom: '8px', color: '#f8fafc' }}>{draft.caption || 'No caption'}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {draft.platforms?.map(p => <PlatformIcon key={p.platform} platform={p.platform} size={14} />)}
                                        </div>
                                        <button className="btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/create-post?edit=${draft.id}`)}}>
                                            Schedule
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Post Details / Reschedule Modal */}
            {showModal && activePost && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
                            <h2 style={{ margin: 0 }}>{isRescheduling ? 'Reschedule Post' : 'Post Details'}</h2>
                            <span style={{ 
                                background: `${getStatusColor(activePost.status)}20`, color: getStatusColor(activePost.status),
                                padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize'
                            }}>
                                {activePost.status}
                            </span>
                        </div>

                        {!isRescheduling ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {activePost.media_url && (
                                    <div style={{ background: '#0f172a', borderRadius: '8px', overflow: 'hidden', maxHeight: '300px', display: 'flex', justifyContent: 'center' }}>
                                        {activePost.media_type === 'video' ? (
                                            <video src={activePost.media_url} controls style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                        ) : (
                                            <img src={activePost.media_url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        )}
                                    </div>
                                )}
                                <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155', whiteSpace: 'pre-wrap' }}>
                                    {activePost.caption || <span style={{ color: '#64748b' }}>No caption</span>}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>Platforms</div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {activePost.platforms?.map(p => (
                                                <div key={p.social_account_id} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#334155', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                                    <PlatformIcon platform={p.platform} size={12} /> <span style={{textTransform: 'capitalize'}}>{p.platform}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>Date & Time</div>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            {activePost.scheduled_at ? new Date(activePost.scheduled_at).toLocaleString() : 'Not scheduled'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button onClick={() => navigate(`/create-post?edit=${activePost.id}`)} className="btn-secondary">
                                        <Edit2 size={16} /> Edit
                                    </button>
                                    {(activePost.status === 'scheduled') && (
                                        <button onClick={() => {
                                            const dateObj = new Date(activePost.scheduled_at);
                                            const local = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString();
                                            setScheduledDate(local.split('T')[0]);
                                            setScheduledTime(local.split('T')[1].substring(0, 5));
                                            setTimezone(activePost.timezone || 'Asia/Kolkata');
                                            setIsRescheduling(true);
                                        }} className="btn-secondary">
                                            <Clock size={16} /> Reschedule
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(activePost.id)} className="btn-danger">
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Date</label>
                                    <input 
                                        type="date" 
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Time</label>
                                    <input 
                                        type="time" 
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button onClick={() => setIsRescheduling(false)} className="btn-secondary">Back</button>
                                    <button onClick={handleRescheduleSubmit} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Changes</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .calendar-grid { display: flex; flexDirection: column; height: 100%; min-width: 600px; }
                .calendar-header-row { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: 600; color: '#cbd5e1'; padding: 0.5rem 0; border-bottom: 1px solid #334155; }
                .calendar-row { display: grid; grid-template-columns: repeat(7, 1fr); flex: 1; min-height: 100px; border-bottom: 1px solid #334155; }
                .calendar-cell { border-right: 1px solid #334155; padding: 0.5rem; display: flex; flex-direction: column; gap: 4px; cursor: pointer; transition: background 0.2s; }
                .calendar-cell:hover { background: rgba(59, 130, 246, 0.1); }
                .calendar-cell:last-child { border-right: none; }
                .calendar-cell.empty { background: rgba(15, 23, 42, 0.5); cursor: default; }
                .calendar-cell.empty:hover { background: rgba(15, 23, 42, 0.5); }
                .day-number { font-size: 0.9rem; color: '#cbd5e1'; text-align: right; margin-bottom: 4px; }
                .events-container { display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 80px; }
                .event-badge { background: #0f172a; border-radius: 4px; padding: 2px 4px; font-size: 0.75rem; display: flex; flex-direction: column; cursor: pointer; }
                .event-badge:hover { filter: brightness(1.2); }
                .event-time { font-weight: 600; color: #94a3b8; font-size: 0.7rem; }
                .event-title { display: flex; align-items: center; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #f8fafc; }
                .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
                
                .week-grid { display: grid; grid-template-columns: repeat(7, 1fr); height: 100%; min-width: 800px; }
                .calendar-col { border-right: 1px solid #334155; display: flex; flex-direction: column; }
                .calendar-col:last-child { border-right: none; }
                .col-header { text-align: center; padding: 0.5rem; border-bottom: 1px solid #334155; font-weight: 600; }
                .col-body { flex: 1; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; cursor: pointer; }
                .col-body:hover { background: rgba(59, 130, 246, 0.05); }

                .day-grid { display: flex; flex-direction: column; height: 100%; }
                .day-header { font-size: 1.5rem; font-weight: 600; padding: 1rem; border-bottom: 1px solid #334155; }
                .day-body { flex: 1; padding: 1rem; overflow-y: auto; cursor: pointer; }
                .timeline { display: flex; flex-direction: column; gap: 1rem; }
                .timeline-item { display: flex; gap: 1rem; }
                .timeline-time { width: 80px; font-weight: 600; color: #94a3b8; text-align: right; flex-shrink: 0; }
                .timeline-content { flex: 1; }

                .event-card { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 0.75rem; cursor: pointer; transition: all 0.2s; }
                .event-card:hover { border-color: #475569; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
                .truncate-2lines { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                
                .draft-card { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s; }
                .draft-card:hover { border-color: #475569; background: #1e293b; }
                
                .btn-icon { background: transparent; border: 1px solid #334155; color: #cbd5e1; border-radius: 8px; padding: 0.5rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .btn-icon:hover { background: #334155; color: #fff; }
                .btn-sm { background: transparent; border: 1px solid #3b82f6; color: #3b82f6; border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
                .btn-sm:hover { background: #3b82f6; color: #fff; }
                
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; animation: fadeIn 0.2s ease; }
                .modal-content { background: #1e293b; padding: 2rem; border-radius: 16px; width: 100%; max-width: 500px; border: 1px solid #334155; max-height: 90vh; overflow-y: auto; }
                
                .btn-secondary { background: transparent; border: 1px solid #475569; color: #cbd5e1; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; transition: all 0.2s; }
                .btn-secondary:hover { background: #334155; }
                .btn-danger { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; transition: all 0.2s; }
                .btn-danger:hover { background: rgba(239, 68, 68, 0.25); }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ContentCalendar;
