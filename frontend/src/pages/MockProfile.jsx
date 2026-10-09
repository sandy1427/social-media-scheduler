import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MockProfile = () => {
    const { platform, username } = useParams();
    const navigate = useNavigate();
    const { api } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Use /posts/scheduled because it includes the platform details and status
                const { data } = await api.get('/posts/scheduled');
                
                // Filter published posts for this platform
                const platformPosts = data.filter(post => {
                    // Check if the post itself is published or partially_published
                    if (post.status !== 'published' && post.status !== 'partially_published') return false;
                    
                    // Check if THIS specific platform was successfully published
                    const platformData = post.platforms?.find(p => p.platform.toLowerCase() === platform.toLowerCase());
                    return platformData && platformData.status === 'published';
                });
                setPosts(platformPosts);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [platform]);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-color)',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: 'var(--text-primary)',
            padding: '2rem'
        }}>
            <button 
                onClick={() => navigate('/connected-accounts')}
                style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '2rem'
                }}
            >
                &larr; Back to Accounts
            </button>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '3rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <div style={{ height: '200px', width: '100%', background: 'linear-gradient(90deg, #1DA1F2 0%, #1a91da 100%)' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '0 2rem 2rem 2rem' }}>
                    <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: 'var(--bg-color)', fontWeight: 'bold', border: '4px solid var(--bg-color)', marginTop: '-65px' }}>
                        {username.replace('@', '').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <h1 style={{ margin: '0 0 0.2rem 0', fontSize: '1.5rem', fontWeight: '800' }}>{username.replace('@', '')}</h1>
                        <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>@{username.replace('@', '').toLowerCase()}</p>
                        
                        <p style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                            Tech enthusiast | Sharing updates via SocialSync 🚀
                        </p>

                        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <span><strong style={{color: 'var(--text-primary)'}}>{posts.length}</strong> posts</span>
                            <span><strong style={{color: 'var(--text-primary)'}}>1.2M</strong> followers</span>
                            <span><strong style={{color: 'var(--text-primary)'}}>420</strong> following</span>
                        </div>
                    </div>
                </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '1rem'
                }}>
                    {loading ? (
                        <p>Loading posts...</p>
                    ) : posts.length > 0 ? (
                        posts.map(post => (
                            <div key={post.id} style={{ 
                                aspectRatio: '1/1', 
                                background: 'var(--card-bg)', 
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {post.media_url ? (
                                    post.media_type === 'video' ? (
                                        <video src={`http://localhost:5000${post.media_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <img src={`http://localhost:5000${post.media_url}`} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )
                                ) : (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        {post.caption.length > 60 ? post.caption.substring(0, 60) + '...' : post.caption}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            <h3>No posts yet</h3>
                            <p>Schedule a post to see it appear here when published.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MockProfile;
