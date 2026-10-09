import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
    Plus, Calendar, CheckCircle2, Clock, XCircle, FileText, 
    MoreHorizontal, Sparkles, User, BarChart2,
    ArrowUpRight, ArrowDownRight, Activity, FileSpreadsheet, Layout
} from 'lucide-react';

// Custom icons
const XIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);
const ThreadsIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.61 2.37A10.74 10.74 0 0 0 12 2C6.47 2 2 6.48 2 12s4.47 10 10 10 10-4.48 10-10c0-1.87-.52-3.61-1.42-5.11M16.92 12c0 2.76-2.24 5-5 5s-5-2.24-5-5 2.24-5 5-5c1.47 0 2.8.64 3.72 1.66l-1.39 1.43c-.62-.64-1.47-1.04-2.33-1.04-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5c1.62 0 2.96-1.12 3.37-2.62H12v-2.05h6.88c.03.35.04.7.04 1.05z"/>
    </svg>
);
const PinterestIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z"/>
    </svg>
);
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
const YoutubeIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);

const Card = ({ children, style, className = "" }) => (
    <div className={className} style={{ 
        background: 'rgba(30, 41, 59, 0.4)', 
        border: '1px solid rgba(255, 255, 255, 0.05)', 
        borderRadius: '16px', 
        padding: '1.25rem',
        ...style 
    }}>
        {children}
    </div>
);

const Dashboard = () => {
    const { user, api } = useAuth();
    const firstName = user?.full_name?.split(' ')?.[0] || 'John';
    const [connectedAccounts, setConnectedAccounts] = React.useState([]);
    const [analyticsData, setAnalyticsData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [accountsRes, analyticsRes] = await Promise.all([
                    api.get('/social/accounts'),
                    api.get('/analytics')
                ]);
                setConnectedAccounts(accountsRes.data);
                setAnalyticsData(analyticsRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [api]);

    const getTodayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const [dashDate, setDashDate] = React.useState(getTodayString());
    const formattedDate = new Date(dashDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const dateInputRef = React.useRef(null);
    const handleDateClick = () => {
        if (dateInputRef.current && dateInputRef.current.showPicker) {
            dateInputRef.current.showPicker();
        }
    };

    const stats = analyticsData?.summary || {
        total: 0,
        published: 0,
        scheduled: 0,
        failed: 0,
        drafts: 0
    };

    return (
        <div style={{ paddingBottom: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Welcome back, {firstName}! 👋
                    </h1>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                        Manage your social media presence, create amazing content and grow your audience.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div onClick={handleDateClick} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(30, 41, 59, 0.5)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s ease' }} className="hover-scale">
                        <Calendar size={20} color="#94a3b8" />
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Date</div>
                            <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{formattedDate}</div>
                        </div>
                        <input ref={dateInputRef} type="date" value={dashDate} onChange={(e) => setDashDate(e.target.value)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} />
                    </div>
                    <Link to="/create-post" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.25rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
                        <Plus size={20} /> Create Post
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <Card style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileSpreadsheet size={18} />
                        </div>
                        <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>Total Posts</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{stats.total}</span>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', fontWeight: 600 }}><ArrowUpRight size={14}/>+12%</div>
                            <div style={{ color: '#64748b', fontSize: '0.7rem' }}>vs last 30 days</div>
                        </div>
                    </div>
                </Card>
                <Card style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={18} />
                        </div>
                        <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>Published</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{stats.published}</span>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', fontWeight: 600 }}><ArrowUpRight size={14}/>+20%</div>
                            <div style={{ color: '#64748b', fontSize: '0.7rem' }}>vs last 30 days</div>
                        </div>
                    </div>
                </Card>
                <Card style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={18} />
                        </div>
                        <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>Scheduled</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{stats.scheduled}</span>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#f59e0b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', fontWeight: 600 }}>↑0%</div>
                            <div style={{ color: '#64748b', fontSize: '0.7rem' }}>vs last 30 days</div>
                        </div>
                    </div>
                </Card>
                <Card style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={18} />
                        </div>
                        <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>Failed</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{stats.failed}</span>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', fontWeight: 600 }}><ArrowDownRight size={14}/>-33%</div>
                            <div style={{ color: '#64748b', fontSize: '0.7rem' }}>vs last 30 days</div>
                        </div>
                    </div>
                </Card>
                <Card style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={18} />
                        </div>
                        <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>Drafts</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{stats.drafts}</span>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', fontWeight: 600 }}><ArrowUpRight size={14}/>+25%</div>
                            <div style={{ color: '#64748b', fontSize: '0.7rem' }}>vs last 30 days</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Line Chart */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>Post Performance</h3>
                        <select style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }}></div> Published</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div> Scheduled</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div> Failed</span>
                    </div>
                    {/* Mock SVG Line Chart */}
                    <div style={{ height: '160px', width: '100%', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'absolute', width: '100%', zIndex: 0, paddingBottom: '20px', color: '#475569', fontSize: '0.7rem' }}>
                            <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}><span>20</span><div style={{ flex: 1 }}></div></div>
                            <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}><span>15</span><div style={{ flex: 1 }}></div></div>
                            <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}><span>10</span><div style={{ flex: 1 }}></div></div>
                            <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}><span>5</span><div style={{ flex: 1 }}></div></div>
                            <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}><span>0</span><div style={{ flex: 1 }}></div></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', bottom: '0', width: 'calc(100% - 30px)', left: '30px', color: '#64748b', fontSize: '0.65rem', paddingRight: '10px' }}>
                            <span>Sep 6</span><span>Sep 10</span><span>Sep 14</span><span>Sep 18</span><span>Sep 22</span><span>Sep 26</span><span>Sep 30</span><span>Oct 6</span>
                        </div>
                        
                        <svg viewBox="0 0 400 130" style={{ width: 'calc(100% - 30px)', height: '140px', position: 'absolute', left: '30px', top: '0', overflow: 'visible' }} preserveAspectRatio="none">
                            {/* Failed */}
                            <path d="M0 120 Q 30 110, 60 115 T 120 125 T 180 120 T 240 128 T 300 122 T 360 120 T 400 110" fill="none" stroke="#ef4444" strokeWidth="2" />
                            {/* Scheduled */}
                            <path d="M0 110 Q 40 80, 80 110 T 160 100 T 240 115 T 320 85 T 400 100" fill="none" stroke="#3b82f6" strokeWidth="2" />
                            {/* Published */}
                            <path d="M0 80 Q 40 40, 80 70 T 160 40 T 240 30 T 320 60 T 400 30" fill="none" stroke="#a855f7" strokeWidth="2" />
                            {/* Dots for Published */}
                            <circle cx="80" cy="70" r="4" fill="#a855f7" stroke="#1e293b" strokeWidth="2" />
                            <circle cx="160" cy="40" r="4" fill="#a855f7" stroke="#1e293b" strokeWidth="2" />
                            <circle cx="240" cy="30" r="4" fill="#a855f7" stroke="#1e293b" strokeWidth="2" />
                            <circle cx="320" cy="60" r="4" fill="#a855f7" stroke="#1e293b" strokeWidth="2" />
                            <circle cx="400" cy="30" r="4" fill="#a855f7" stroke="#1e293b" strokeWidth="2" />
                        </svg>
                    </div>
                </Card>

                {/* Donut 1 */}
                <Card>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem 0' }}>Posts by Platform</h3>
                    <div style={{ display: 'flex', alignItems: 'center', height: '160px', gap: '1rem' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', position: 'relative', background: 'conic-gradient(#ec4899 0% 50%, #3b82f6 50% 75%, #000 75% 87%, #ef4444 87% 95%, #cbd5e1 95% 100%)' }}>
                            <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', background: '#131b2e', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{analyticsData?.platformPerformance?.reduce((acc, p) => acc + p.total, 0) || 0}</span>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Total Posts</span>
                            </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {[
                                { name: 'Instagram', id: 'instagram', color: '#ec4899', icon: <InstagramIcon size={12}/> },
                                { name: 'Facebook', id: 'facebook', color: '#3b82f6', icon: <FacebookIcon size={12}/> },
                                { name: 'X (Twitter)', id: 'x', color: '#000', icon: <XIcon size={12}/> },
                                { name: 'YouTube', id: 'youtube', color: '#ef4444', icon: <YoutubeIcon size={12}/> },
                                { name: 'Threads', id: 'threads', color: '#cbd5e1', icon: <ThreadsIcon size={12}/> },
                                { name: 'Pinterest', id: 'pinterest', color: '#ef4444', icon: <PinterestIcon size={12}/> }
                            ].map(p => {
                                const pData = analyticsData?.platformPerformance?.find(x => x.platform === p.id);
                                const val = pData ? pData.total : 0;
                                const total = analyticsData?.platformPerformance?.reduce((acc, curr) => acc + curr.total, 0) || 1;
                                const pct = Math.round((val / total) * 100) + '%';
                                return (
                                <div key={p.name} style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '0.5rem' }}>
                                    <div style={{ width: '16px', height: '16px', background: p.color, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{p.icon}</div>
                                    <span style={{ color: '#cbd5e1', flex: 1 }}>{p.name}</span>
                                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{val}</span>
                                    <span style={{ color: '#64748b', width: '30px', textAlign: 'right' }}>({pct})</span>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>

                {/* Donut 2 */}
                <Card>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem 0' }}>Post Status</h3>
                    <div style={{ display: 'flex', alignItems: 'center', height: '160px', gap: '1.5rem' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', position: 'relative', background: 'conic-gradient(#10b981 0% 75%, #3b82f6 75% 92%, #ef4444 92% 95%, #a855f7 95% 100%)' }}>
                            <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', background: '#131b2e', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{stats.total || 0}</span>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Total Posts</span>
                            </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {[
                                { name: 'Published', val: stats.published, color: '#10b981' },
                                { name: 'Scheduled', val: stats.scheduled, color: '#3b82f6' },
                                { name: 'Failed', val: stats.failed, color: '#ef4444' },
                                { name: 'Drafts', val: stats.drafts, color: '#a855f7' }
                            ].map(p => {
                                const total = stats.total || 1;
                                const pct = Math.round((p.val / total) * 100) + '%';
                                return (
                                <div key={p.name} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', background: p.color, borderRadius: '50%' }}></div>
                                    <span style={{ color: '#cbd5e1', flex: 1 }}>{p.name}</span>
                                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{p.val}</span>
                                    <span style={{ color: '#64748b', width: '30px', textAlign: 'right' }}>({pct})</span>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {/* Connected Accounts */}
                <Card style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>Connected Accounts</h3>
                        <Link to="/connected-accounts" style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>Manage Accounts →</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                        {[
                            { id: 'instagram', name: 'Instagram', bg: '#ec4899' },
                            { id: 'facebook', name: 'Facebook', bg: '#1877f2' },
                            { id: 'x', name: 'X (Twitter)', bg: '#000' },
                            { id: 'youtube', name: 'YouTube', bg: '#ff0000' },
                            { id: 'threads', name: 'Threads', bg: '#000' },
                            { id: 'pinterest', name: 'Pinterest', bg: '#e60023' },
                        ].map(acc => {
                            const isConnected = connectedAccounts.some(a => a.platform === acc.id);
                            return (
                            <div key={acc.name} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '28px', height: '28px', background: acc.bg, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                        {acc.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{acc.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: isConnected ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isConnected ? '#10b981' : '#ef4444' }}></div> {isConnected ? 'Connected' : 'Not Connected'}
                                        </div>
                                    </div>
                                </div>
                                <span style={{ color: '#64748b' }}>›</span>
                            </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem 0' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '0.75rem' }}>
                        <Link to="/create-post" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={16}/> Create Post</div> <span>›</span>
                        </Link>
                        <Link to="/calendar" style={{ textDecoration: 'none', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16}/> View Calendar</div> <span>›</span>
                        </Link>
                        <Link to="/analytics" style={{ textDecoration: 'none', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart2 size={16}/> Check Analytics</div> <span>›</span>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
