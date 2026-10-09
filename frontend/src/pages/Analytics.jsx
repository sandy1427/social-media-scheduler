import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Download, Globe, BarChart2, Calendar, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

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
    switch (platform?.toLowerCase()) {
        case 'facebook': return <FacebookIcon size={size} />;
        case 'instagram': return <InstagramIcon size={size} />;
        default: return <Globe size={size} />;
    }
};

const Analytics = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('Last 30 Days');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [platformFilter, setPlatformFilter] = useState('All');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Calculate date ranges
            const now = new Date();
            let start = new Date();
            let end = new Date();
            if (dateRange === 'Today') {
                start.setHours(0,0,0,0);
            } else if (dateRange === 'Last 7 Days') {
                start.setDate(now.getDate() - 7);
            } else if (dateRange === 'Last 30 Days') {
                start.setDate(now.getDate() - 30);
            } else if (dateRange === 'Last 90 Days') {
                start.setDate(now.getDate() - 90);
            } else if (dateRange === 'This Year') {
                start = new Date(now.getFullYear(), 0, 1);
            } else if (dateRange === 'Custom Range') {
                if (customStart) start = new Date(customStart);
                if (customEnd) end = new Date(customEnd);
            }

            const res = await api.get('/analytics', {
                params: {
                    start: start.toISOString(),
                    end: end.toISOString(),
                    platform: platformFilter
                }
            });
            setData(res.data);
        } catch (err) {
            console.error(err);
            setError('Unable to load analytics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (dateRange === 'Custom Range' && (!customStart || !customEnd)) return;
        fetchAnalytics();
    }, [api, dateRange, platformFilter, customStart, customEnd]);

    const handleExport = () => {
        if (!data) return;
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Metric,Value\n";
        csvContent += `Total Posts,${data.summary.total}\n`;
        csvContent += `Published,${data.summary.published}\n`;
        csvContent += `Scheduled,${data.summary.scheduled}\n`;
        csvContent += `Failed,${data.summary.failed}\n`;
        csvContent += `Drafts,${data.summary.drafts}\n`;
        csvContent += `Success Rate,${data.successRate || 0}%\n`;
        
        csvContent += "\nPlatform,Total Posts,Published,Failed\n";
        data.platformPerformance.forEach(p => {
            csvContent += `${p.platform},${p.total},${p.published},${p.failed}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `socialsync_analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (error) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#f8fafc' }}>
                <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                <h3>{error}</h3>
                <button onClick={fetchAnalytics} className="btn-primary" style={{ marginTop: '1rem' }}>Retry</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', color: '#f8fafc', animation: 'fadeIn 0.5s ease', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Analytics</h1>
                    <p style={{ color: '#cbd5e1', margin: 0, fontSize: '1rem' }}>Track your social media content performance in one place.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={fetchAnalytics} className="btn-icon" title="Refresh Analytics" disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                    <button onClick={handleExport} className="btn-secondary" disabled={!data || loading}>
                        <Download size={18} /> Export Report
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <select 
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                    style={{
                        background: '#0f172a', border: '1px solid #334155', color: '#fff',
                        padding: '0.6rem 1rem', borderRadius: '8px', outline: 'none', cursor: 'pointer'
                    }}
                >
                    <option value="Today">Today</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Last 90 Days">Last 90 Days</option>
                    <option value="This Year">This Year</option>
                    <option value="Custom Range">Custom Range</option>
                </select>

                {dateRange === 'Custom Range' && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '0.6rem 1rem', borderRadius: '8px', outline: 'none' }} />
                        <span style={{ color: '#94a3b8' }}>to</span>
                        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '0.6rem 1rem', borderRadius: '8px', outline: 'none' }} />
                    </div>
                )}

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

            {loading && !data ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#cbd5e1' }}>
                    <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <div>Loading your analytics...</div>
                </div>
            ) : data && data.summary.total === 0 && dateRange === 'Last 30 Days' && platformFilter === 'All' ? (
                <div style={{ padding: '4rem', textAlign: 'center', background: '#1e293b', borderRadius: '16px', border: '1px dashed #475569', color: '#94a3b8' }}>
                    <BarChart2 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>No analytics available yet.</h3>
                    <p style={{ margin: '0 0 1.5rem 0' }}>Create and publish posts to start seeing analytics.</p>
                    <button onClick={() => navigate('/create-post')} className="btn-primary">Create Post</button>
                </div>
            ) : data ? (
                <>
                    {/* Top Summary Cards */}
                    <div className="summary-grid" style={{ marginBottom: '2rem' }}>
                        <div className="metric-card">
                            <div className="metric-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}><FileText size={20} /></div>
                            <div className="metric-title">Total Posts</div>
                            <div className="metric-value">{data.summary.total}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}><CheckCircle2 size={20} /></div>
                            <div className="metric-title">Published</div>
                            <div className="metric-value">{data.summary.published}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#eab308' }}><Calendar size={20} /></div>
                            <div className="metric-title">Scheduled</div>
                            <div className="metric-value">{data.summary.scheduled}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}><AlertCircle size={20} /></div>
                            <div className="metric-title">Failed</div>
                            <div className="metric-value">{data.summary.failed}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon" style={{ background: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' }}><Clock size={20} /></div>
                            <div className="metric-title">Drafts</div>
                            <div className="metric-value">{data.summary.drafts}</div>
                        </div>
                        {data.successRate !== null && (
                            <div className="metric-card">
                                <div className="metric-icon" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}><BarChart2 size={20} /></div>
                                <div className="metric-title">Success Rate</div>
                                <div className="metric-value">{data.successRate}%</div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Posts Over Time (Simplified bar chart) */}
                        <div className="chart-card">
                            <h3>Posts Over Time</h3>
                            {data.postsOverTime.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No data for this period</div>
                            ) : (
                                <div className="simple-bar-chart">
                                    {data.postsOverTime.map(point => {
                                        const max = Math.max(...data.postsOverTime.map(p => p.published + p.scheduled + p.failed + p.draft));
                                        const height = max === 0 ? 0 : ((point.published + point.scheduled + point.failed + point.draft) / max) * 100;
                                        return (
                                            <div key={point.date} className="bar-container" title={`${point.date}\nPublished: ${point.published}\nScheduled: ${point.scheduled}\nFailed: ${point.failed}\nDraft: ${point.draft}`}>
                                                <div className="bar" style={{ height: `${height}%` }}>
                                                    {point.failed > 0 && <div style={{ height: `${(point.failed/max)*100}%`, background: '#ef4444' }}></div>}
                                                    {point.scheduled > 0 && <div style={{ height: `${(point.scheduled/max)*100}%`, background: '#eab308' }}></div>}
                                                    {point.published > 0 && <div style={{ height: `${(point.published/max)*100}%`, background: '#22c55e' }}></div>}
                                                    {point.draft > 0 && <div style={{ height: `${(point.draft/max)*100}%`, background: '#94a3b8' }}></div>}
                                                </div>
                                                <div className="bar-label">{new Date(point.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Engagement Overview */}
                        <div className="chart-card">
                            <h3>Engagement Overview</h3>
                            <div style={{ padding: '2rem', textAlign: 'center', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                                <BarChart2 size={32} style={{ color: '#64748b', marginBottom: '1rem' }} />
                                <div style={{ color: '#cbd5e1', marginBottom: '1rem' }}>Connect supported social accounts to view engagement analytics.</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Real engagement metrics like Likes, Comments, and Shares are currently not available via the basic API.</div>
                            </div>
                        </div>
                    </div>

                    {/* Platform Performance */}
                    <div className="chart-card" style={{ marginBottom: '2rem' }}>
                        <h3>Platform Performance</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {data.platformPerformance.filter(p => platformFilter === 'All' || p.platform.toLowerCase() === platformFilter.toLowerCase()).map(p => (
                                <div key={p.platform} style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <PlatformIcon platform={p.platform} size={20} />
                                        <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '1.1rem' }}>{p.platform}</span>
                                    </div>
                                    {!p.isConnected ? (
                                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>Connect {p.platform} to view analytics</p>
                                            <button onClick={() => navigate('/connected-accounts')} className="btn-sm">Connect Account</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>Total Posts:</span> <span>{p.total}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>Published:</span> <span style={{ color: '#22c55e' }}>{p.published}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>Failed:</span> <span style={{ color: '#ef4444' }}>{p.failed}</span></div>
                                            <div style={{ height: '1px', background: '#334155', margin: '0.5rem 0' }}></div>
                                            <div style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center' }}>Insights unavailable via basic API</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Performing Posts */}
                    <div className="chart-card">
                        <h3>Top Performing Posts</h3>
                        {data.topPosts.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No published posts in this period.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {data.topPosts.map(post => (
                                    <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
                                        <div style={{ width: '60px', height: '60px', background: '#1e293b', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                            {post.media_url ? (
                                                post.media_url.match(/\.(mp4|webm|mov)$/i) ? (
                                                    <video src={post.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} preload="metadata" muted />
                                                ) : (
                                                    <img src={post.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                )
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><FileText size={24} /></div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                                {post.platforms.map(p => <PlatformIcon key={p} platform={p} size={14} />)}
                                            </div>
                                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600, marginBottom: '4px' }}>
                                                {post.caption || 'No caption'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                Published: {new Date(post.published_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>
                                            <div><div>--</div><div style={{ fontSize: '0.7rem' }}>Likes</div></div>
                                            <div><div>--</div><div style={{ fontSize: '0.7rem' }}>Comments</div></div>
                                        </div>
                                        <button onClick={() => navigate(`/create-post?edit=${post.id}`)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : null}

            <style>{`
                .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
                .metric-card { background: #1e293b; padding: 1.5rem; border-radius: 16px; border: 1px solid #334155; display: flex; flex-direction: column; align-items: flex-start; }
                .metric-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
                .metric-title { color: '#cbd5e1'; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; }
                .metric-value { font-size: 1.8rem; font-weight: 800; color: #f8fafc; }
                
                .chart-card { background: #1e293b; padding: 1.5rem; border-radius: 16px; border: 1px solid #334155; }
                .chart-card h3 { margin: 0 0 1.5rem 0; font-size: 1.2rem; font-weight: 600; color: #f8fafc; }
                
                .simple-bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 200px; padding-bottom: 24px; position: relative; border-bottom: 1px solid #334155; overflow-x: auto; }
                .bar-container { flex: 1; min-width: 30px; max-width: 60px; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; position: relative; cursor: pointer; }
                .bar-container:hover { opacity: 0.8; }
                .bar { width: 100%; display: flex; flex-direction: column; justify-content: flex-end; border-top-left-radius: 4px; border-top-right-radius: 4px; overflow: hidden; min-height: 2px; }
                .bar-label { position: absolute; bottom: -24px; left: 50%; transform: translateX(-50%) rotate(-45deg); font-size: 0.7rem; color: #64748b; white-space: nowrap; transform-origin: top left; }
                
                .btn-primary { background: #3b82f6; border: none; color: #fff; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-primary:hover { background: #2563eb; }
                .btn-secondary { background: transparent; border: 1px solid #475569; color: #cbd5e1; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; transition: all 0.2s; }
                .btn-secondary:hover:not(:disabled) { background: #334155; color: #fff; }
                .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-icon { background: transparent; border: 1px solid #475569; color: #cbd5e1; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .btn-icon:hover:not(:disabled) { background: #334155; color: #fff; }
                .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-sm { background: transparent; border: 1px solid #3b82f6; color: #3b82f6; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.2s; }
                .btn-sm:hover { background: #3b82f6; color: #fff; }
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Analytics;
