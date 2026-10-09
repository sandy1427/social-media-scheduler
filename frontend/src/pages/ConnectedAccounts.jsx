import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

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

const TwitterIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
);

const YoutubeIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);

const ThreadsIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" />
        <path d="M16 12V13.5C16 14.8807 17.1193 16 18.5 16C19.8807 16 21 14.8807 21 13.5V12C21 7.02944 16.9706 3 12 3" />
    </svg>
);

const PinterestIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.192 0 7.451 2.986 7.451 6.969 0 4.17-2.628 7.525-6.277 7.525-1.225 0-2.376-.637-2.77-1.39l-.754 2.878c-.272 1.041-1.01 2.342-1.503 3.136 1.52.464 3.14.718 4.819.718 6.621 0 11.988-5.367 11.988-11.987C24.005 5.367 18.638 0 12.017 0z"/>
    </svg>
);

const PLATFORMS = [
    { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: '#1877F2', gradient: 'linear-gradient(135deg, #1877F2 0%, #0c5abb 100%)' },
    { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: '#E4405F', gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
    { id: 'x', name: 'X (Twitter)', icon: TwitterIcon, color: '#0f1419', gradient: 'linear-gradient(135deg, #1f2937 0%, #000000 100%)' },
    { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: '#FF0000', gradient: 'linear-gradient(135deg, #FF0000 0%, #cc0000 100%)' },
    { id: 'threads', name: 'Threads', icon: ThreadsIcon, color: '#000000', gradient: 'linear-gradient(135deg, #4b5563 0%, #000000 100%)' },
    { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: '#E60023', gradient: 'linear-gradient(135deg, #E60023 0%, #bd081c 100%)' }
];

const ConnectedAccounts = () => {
    const { api } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [alert, setAlert] = useState(null);

    const fetchAccounts = async () => {
        try {
            const { data } = await api.get('/social/accounts');
            setAccounts(data);
        } catch (error) {
            console.error(error);
            setAlert({ type: 'error', message: 'Failed to load connected accounts' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
        
        // Handle OAuth redirect messages
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        
        if (success) {
            setAlert({ type: 'success', message: 'Account connected successfully!' });
            searchParams.delete('success');
            setSearchParams(searchParams);
        } else if (error) {
            setAlert({ type: 'error', message: 'Failed to connect account. Please try again.' });
            searchParams.delete('error');
            setSearchParams(searchParams);
        }

        if (success || error) {
            setTimeout(() => setAlert(null), 3000);
        }
    }, []);

    const handleConnect = async (platformId) => {
        try {
            const { data } = await api.get(`/social/${platformId}/connect?t=${new Date().getTime()}`);
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            setAlert({ type: 'error', message: `Could not initiate ${platformId} connection.` });
        }
    };

    const handleDisconnect = async (platformId) => {
        if (!window.confirm('Are you sure you want to disconnect this account?')) return;
        
        try {
            await api.post(`/social/${platformId}/disconnect`);
            setAlert({ type: 'success', message: 'Account disconnected successfully.' });
            fetchAccounts();
            setTimeout(() => setAlert(null), 3000);
        } catch (error) {
            setAlert({ type: 'error', message: 'Failed to disconnect account.' });
            setTimeout(() => setAlert(null), 3000);
        }
    };

    const getAccountInfo = (platformId) => {
        return accounts.find(acc => acc.platform === platformId);
    };

    const getProfileUrl = (platformId, username) => {
        // Remove @ symbol and any trailing " Account" string from the mock data
        let cleanName = username.replace('@', '').replace(/ Account/i, '').trim();
        
        if (cleanName.toLowerCase().includes('mock')) {
            return `/mock-profile/${platformId}/${encodeURIComponent(username)}`;
        }
        
        switch (platformId) {
            case 'facebook': return `https://facebook.com/${cleanName}`;
            case 'instagram': return `https://instagram.com/${cleanName}`;
            case 'x': return `/mock-profile/x/${encodeURIComponent(username)}`; // Only X goes to the custom profile
            case 'youtube': return `https://youtube.com/${username}`; // Keep the @ symbol for YouTube handles
            case 'threads': return `https://threads.net/${cleanName}`;
            case 'pinterest': return `https://pinterest.com/${cleanName}`;
            default: return '#';
        }
    };

    if (loading) return <div className="page-header">Loading accounts...</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Connected Accounts</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Connect your social media accounts and manage them from one place.
                    </p>
                </div>
            </div>

            {alert && (
                <div className={`alert alert-${alert.type}`}>
                    {alert.message}
                </div>
            )}

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '2rem',
                marginTop: '1.5rem'
            }}>
                {PLATFORMS.map((platform) => {
                    const accountInfo = getAccountInfo(platform.id);
                    const isConnected = !!accountInfo;

                    return (
                        <div 
                            key={platform.id} 
                            className="card" 
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                padding: '2rem',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                boxShadow: `0 4px 20px ${platform.color}10`,
                                transition: 'all 0.3s ease',
                                cursor: 'default',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = `0 12px 24px ${platform.color}25`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = `0 4px 20px ${platform.color}10`;
                            }}
                        >
                            {/* Decorative Top Accent */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: platform.gradient
                            }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                <div style={{ 
                                    background: platform.gradient,
                                    color: 'white', 
                                    padding: '1.1rem', 
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 8px 16px ${platform.color}40`
                                }}>
                                    <platform.icon size={32} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{platform.name}</h3>
                                    <div style={{ 
                                        fontSize: '0.875rem', 
                                        fontWeight: 600,
                                        marginTop: '0.25rem',
                                        color: isConnected ? '#10b981' : 'var(--text-muted)' 
                                    }}>
                                        {isConnected ? '● Connected' : '○ Not Connected'}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ flex: 1, marginBottom: '2rem' }}>
                                {isConnected ? (
                                    <div style={{ 
                                        backgroundColor: 'var(--bg-color)', 
                                        padding: '1rem', 
                                        borderRadius: '10px', 
                                        fontSize: '0.95rem',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Account</div>
                                        <strong style={{ color: 'var(--text-primary)' }}>{accountInfo.account_name || accountInfo.username}</strong>
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                        Connect your {platform.name} account to start scheduling and publishing posts automatically.
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {!isConnected ? (
                                    <button 
                                        style={{ 
                                            padding: '0.75rem 1.5rem', 
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            background: platform.gradient,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            width: '100%',
                                            boxShadow: `0 4px 12px ${platform.color}30`,
                                            transition: 'opacity 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                                        onClick={() => handleConnect(platform.id)}
                                    >
                                        Connect {platform.name}
                                    </button>
                                ) : (
                                     <>
                                        <button 
                                            className="btn" 
                                            style={{ 
                                                padding: '0.4rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap',
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)' }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)' }}
                                            onClick={() => handleDisconnect(platform.id)}
                                        >
                                            Disconnect
                                        </button>
                                        <button 
                                            className="btn" 
                                            style={{ 
                                                padding: '0.4rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap',
                                                backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)' }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)' }}
                                            onClick={() => handleConnect(platform.id)}
                                        >
                                            Reconnect
                                        </button>
                                        <a 
                                            href={getProfileUrl(platform.id, accountInfo.username)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn" 
                                            style={{ 
                                                padding: '0.4rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap',
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)',
                                                textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)' }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)' }}
                                        >
                                            View Profile
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConnectedAccounts;
