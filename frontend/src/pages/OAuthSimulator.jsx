import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const OAuthSimulator = () => {
    const [searchParams] = useSearchParams();
    const platform = searchParams.get('platform') || 'social';
    const state = searchParams.get('state');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // Step 1: Login, Step 2: Authorize
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

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
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.04.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.96-1.72 5.5-1.61 2.06-4.32 3.19-6.85 2.78-2.98-.48-5.34-2.84-5.96-5.83-.34-1.61-.19-3.32.55-4.8 1.14-2.27 3.52-3.8 6.06-4.04.14-.01.27-.02.41-.02v4.06c-1.02.06-2.08.38-2.87 1.07-.72.63-1.14 1.6-1.08 2.58.07 1.17.86 2.22 1.96 2.59 1.07.36 2.3.16 3.17-.55.77-.63 1.25-1.6 1.3-2.62.01-1.39.01-2.79.01-4.18V.02h-.05z"/>
        </svg>
    );

    const PinterestIcon = ({ size }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.192 0 7.451 2.986 7.451 6.969 0 4.17-2.628 7.525-6.277 7.525-1.225 0-2.376-.637-2.77-1.39l-.754 2.878c-.272 1.041-1.01 2.342-1.503 3.136 1.52.464 3.14.718 4.819.718 6.621 0 11.988-5.367 11.988-11.987C24.005 5.367 18.638 0 12.017 0z"/>
        </svg>
    );

    // Platform configurations
    const platforms = {
        facebook: { name: 'Facebook', color: '#1877F2', gradient: 'linear-gradient(135deg, #1877F2 0%, #0c5abb 100%)', icon: <FacebookIcon size={24} /> },
        instagram: { name: 'Instagram', color: '#E4405F', gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', icon: <InstagramIcon size={24} /> },
        x: { name: 'X (Twitter)', color: '#0f1419', gradient: 'linear-gradient(135deg, #1f2937 0%, #000000 100%)', icon: <TwitterIcon size={24} /> },
        youtube: { name: 'YouTube', color: '#FF0000', gradient: 'linear-gradient(135deg, #FF0000 0%, #cc0000 100%)', icon: <YoutubeIcon size={24} /> },
        threads: { name: 'Threads', color: '#000000', gradient: 'linear-gradient(135deg, #4b5563 0%, #000000 100%)', icon: <ThreadsIcon size={24} /> },
        pinterest: { name: 'Pinterest', color: '#E60023', gradient: 'linear-gradient(135deg, #E60023 0%, #bd081c 100%)', icon: <PinterestIcon size={24} /> }
    };

    const currentPlatform = platforms[platform.toLowerCase()] || platforms.facebook;

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            window.location.href = `http://localhost:5000/api/social/${encodeURIComponent(platform)}/callback?code=mock_code_for_demo&state=${encodeURIComponent(state)}&mockUsername=${encodeURIComponent(username)}`;
        }, 1200); // slightly longer for animation
    };

    const handleCancel = () => {
        window.location.href = `http://localhost:5173/connected-accounts?error=oauth_denied`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-color)',
            backgroundImage: `radial-gradient(circle at top right, ${currentPlatform.color}15, transparent 50%), radial-gradient(circle at bottom left, ${currentPlatform.color}15, transparent 50%)`,
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            overflow: 'hidden'
        }}>
            <style>
                {`
                    @keyframes slideUp {
                        0% { opacity: 0; transform: translateY(30px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes pulseGlow {
                        0% { box-shadow: 0 0 0 0 ${currentPlatform.color}40; }
                        70% { box-shadow: 0 0 0 15px transparent; }
                        100% { box-shadow: 0 0 0 0 transparent; }
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    .oauth-card {
                        animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                        backdrop-filter: blur(20px);
                    }
                    .oauth-input:focus {
                        border-color: ${currentPlatform.color} !important;
                        box-shadow: 0 0 0 3px ${currentPlatform.color}20 !important;
                    }
                    .oauth-btn:hover:not(:disabled) {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 20px ${currentPlatform.color}40;
                    }
                `}
            </style>

            <div className="oauth-card" style={{
                background: 'var(--card-bg)',
                padding: '2rem 1.5rem',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
                maxWidth: '360px',
                width: '100%',
                textAlign: 'center',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: currentPlatform.gradient,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    fontWeight: '800',
                    margin: '0 auto 1rem',
                    boxShadow: `0 8px 16px ${currentPlatform.color}40`,
                    animation: loading ? 'pulseGlow 1.5s infinite' : 'none'
                }}>
                    {currentPlatform.icon}
                </div>
                
                <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 800 }}>
                    Connect {currentPlatform.name}
                </h2>
                
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    Enter your {currentPlatform.name} credentials to authorize SocialSync.
                </p>
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <input 
                            type="text" 
                            required
                            placeholder="Email, Phone, or Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="oauth-input"
                            style={{ 
                                width: '100%', 
                                padding: '0.75rem 1rem', 
                                borderRadius: '10px', 
                                border: '2px solid var(--border-color)', 
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                outline: 'none', 
                                fontSize: '1rem', 
                                boxSizing: 'border-box',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <input 
                            type="password" 
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="oauth-input"
                            style={{ 
                                width: '100%', 
                                padding: '0.75rem 1rem', 
                                borderRadius: '10px', 
                                border: '2px solid var(--border-color)', 
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                outline: 'none', 
                                fontSize: '1rem', 
                                boxSizing: 'border-box',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading || !username || !password}
                        className="oauth-btn"
                        style={{ 
                            padding: '0.75rem', 
                            background: currentPlatform.gradient, 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '10px', 
                            fontWeight: 700, 
                            fontSize: '0.95rem', 
                            marginTop: '0.5rem', 
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease',
                            opacity: (loading || !username || !password) ? 0.7 : 1
                        }}
                    >
                        {loading ? (
                            <>
                                <div style={{ 
                                    width: '18px', height: '18px', 
                                    border: '3px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white', 
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                Authenticating...
                            </>
                        ) : 'Log In & Connect'}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleCancel} 
                        style={{ 
                            padding: '0.5rem', 
                            background: 'transparent', 
                            color: 'var(--text-muted)', 
                            border: 'none', 
                            fontSize: '0.9rem', 
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'color 0.2s',
                            marginTop: '0.5rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        Cancel
                    </button>

                    <div style={{
                        marginTop: '0.25rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border-color)',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)'
                    }}>
                        Don't have an account?{' '}
                        <a 
                            href={
                                platform.toLowerCase() === 'instagram' ? 'https://www.instagram.com/accounts/emailsignup/' :
                                platform.toLowerCase() === 'facebook' ? 'https://www.facebook.com/r.php' :
                                platform.toLowerCase() === 'x' ? 'https://twitter.com/i/flow/signup' :
                                platform.toLowerCase() === 'youtube' ? 'https://accounts.google.com/signup' :
                                platform.toLowerCase() === 'threads' ? 'https://www.threads.net/' :
                                'https://www.pinterest.com/'
                            } 
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                                color: currentPlatform.color === '#000000' || currentPlatform.color === '#0f1419' ? 'var(--text-primary)' : currentPlatform.color, 
                                fontWeight: 700, 
                                textDecoration: 'none' 
                            }}
                        >
                            Sign up
                        </a>
                    </div>
                </form>
                
                <p style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: currentPlatform.color, marginRight: '4px' }}></span>
                    Simulation Environment (Demo Mode)
                </p>
            </div>
        </div>
    );
};

export default OAuthSimulator;
