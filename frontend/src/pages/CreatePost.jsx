import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Image as ImageIcon, Video, Calendar, Send, Clock, X, CheckCircle2, Music, Search, Play, Pause, Music2 } from 'lucide-react';

const CreatePost = () => {
    const { api } = useAuth();
    const location = useLocation();
    const [content, setContent] = useState(location.state?.initialCaption || '');
    const [media, setMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [timezone, setTimezone] = useState('Asia/Kolkata');
    const [isScheduling, setIsScheduling] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editPostId = searchParams.get('edit');
    const [existingMediaUrl, setExistingMediaUrl] = useState('');

    // Music state
    const [showMusicModal, setShowMusicModal] = useState(false);
    const [musicSearch, setMusicSearch] = useState('');
    const [musicResults, setMusicResults] = useState([]);
    const [musicSearching, setMusicSearching] = useState(false);
    const [selectedMusic, setSelectedMusic] = useState(null);
    const [playingTrackId, setPlayingTrackId] = useState(null);
    const [audioRef] = useState(() => new Audio());

    // Connected accounts from backend
    const [accounts, setAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    // Fetch connected accounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch accounts
                const accountsRes = await api.get('/social/accounts');
                setAccounts(accountsRes.data);

                // Fetch edit post if editing
                if (editPostId) {
                    const postRes = await api.get(`/posts/${editPostId}`);
                    const post = postRes.data;
                    setContent(post.caption || '');
                    if (post.media_url) {
                        setExistingMediaUrl(post.media_url);
                        setMediaPreview(post.media_url);
                    }
                    if (post.status === 'scheduled') {
                        setIsScheduling(true);
                        if (post.scheduled_at) {
                            const dateObj = new Date(post.scheduled_at);
                            const local = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString();
                            setScheduledDate(local.split('T')[0]);
                            setScheduledTime(local.split('T')[1].substring(0, 5));
                        }
                    }
                    if (post.platforms) {
                        setSelectedAccounts(post.platforms.map(p => p.social_account_id));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [api, editPostId]);

    const searchMusic = async (query) => {
        if (!query.trim()) return;
        setMusicSearching(true);
        try {
            const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setMusicResults(data.results || []);
        } catch (e) {
            console.error('Music search failed', e);
        } finally {
            setMusicSearching(false);
        }
    };

    const handlePlayPause = (track) => {
        if (playingTrackId === track.trackId) {
            audioRef.pause();
            setPlayingTrackId(null);
        } else {
            audioRef.src = track.previewUrl;
            audioRef.play();
            setPlayingTrackId(track.trackId);
        }
    };

    const selectMusic = (track) => {
        audioRef.pause();
        setPlayingTrackId(null);
        setSelectedMusic(track);
        setShowMusicModal(false);
    };

    const removeMusic = () => {
        audioRef.pause();
        setPlayingTrackId(null);
        setSelectedMusic(null);
    };



    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const removeMedia = () => {
        setMedia(null);
        setMediaPreview('');
    };

    const toggleAccountSelection = (accountId) => {
        if (selectedAccounts.includes(accountId)) {
            setSelectedAccounts(selectedAccounts.filter(id => id !== accountId));
        } else {
            setSelectedAccounts([...selectedAccounts, accountId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (selectedAccounts.length === 0) {
            alert("Please select at least one account to post to.");
            return;
        }

        if (!content && !media && !existingMediaUrl) {
            alert("Please add some text or media to your post.");
            return;
        }

        try {
            setLoading(true);
            setIsPosting(true);
            let mediaUrl = '';
            let mediaType = '';

            // Step 1: Upload media if exists
            if (media) {
                const formData = new FormData();
                formData.append('media', media);

                if (selectedMusic) {
                    // Combine media with music
                    formData.append('musicUrl', selectedMusic.previewUrl);
                    formData.append('trackName', selectedMusic.trackName);
                    formData.append('artistName', selectedMusic.artistName);
                    formData.append('artworkUrl', selectedMusic.artworkUrl100 || selectedMusic.artworkUrl60);

                    const uploadRes = await api.post('/posts/combine-media-music', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    
                    mediaUrl = uploadRes.data.media_url;
                    mediaType = uploadRes.data.media_type;
                } else {
                    // Regular media upload
                    const uploadRes = await api.post('/posts/media', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    
                    mediaUrl = uploadRes.data.media_url;
                    mediaType = uploadRes.data.media_type;
                }
            } else if (existingMediaUrl && !media) {
                // Keep existing media if not replacing
                mediaUrl = existingMediaUrl;
                mediaType = mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image';
            }

            let scheduledAt = null;
            if (isScheduling) {
                if (!scheduledDate || !scheduledTime) {
                    alert("Please select a date and time to schedule.");
                    setLoading(false);
                    return;
                }
                const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
                if (selectedDateTime <= new Date()) {
                    alert("Please select a future date and time.");
                    setLoading(false);
                    return;
                }
                scheduledAt = selectedDateTime.toISOString();
            }

            // Step 2: Save Post
            const postData = {
                caption: content,
                platforms: selectedAccounts,
                media_url: mediaUrl,
                media_type: mediaType,
                link_url: '',
                scheduledAt: scheduledAt,
                timezone: isScheduling ? timezone : null
            };

            let postId;
            if (editPostId) {
                await api.put(`/posts/${editPostId}`, postData);
                postId = editPostId;
            } else {
                const postRes = await api.post('/posts', postData);
                postId = postRes.data.id;
            }

            if (isScheduling) {
                alert(`Post successfully scheduled for ${scheduledDate} at ${scheduledTime}!`);
            } else {
                // Post Now flow
                await api.post(`/posts/${postId}/publish`);
                alert('Publishing process started! Your post will be published in the background shortly.');
            }
            
            // Redirect to posts
            navigate('/posts');

            // Reset form
            setContent('');
            setMedia(null);
            setMediaPreview('');
            setSelectedAccounts([]);
        } catch (error) {
            console.error("Failed to create post", error);
            const msg = error?.response?.data?.message || error?.message || 'Unknown error';
            alert(`Failed: ${msg}`);
        } finally {
            setLoading(false);
            setIsPosting(false);
        }
    };

    return (
        <div className="create-post-container" style={{ minHeight: 'calc(100vh - 64px)', overflow: 'hidden', background: 'transparent', color: '#f8fafc', animation: 'fadeIn 0.5s ease', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.25rem 0', letterSpacing: '-0.02em' }}>Create Post</h1>
                        <p style={{ color: '#cbd5e1', margin: 0, fontSize: '1rem' }}>Compose and publish across all your connected networks in one click.</p>
                    </div>
                </div>

                <div className="create-post-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
                    {/* Editor Section */}
                    <div className="editor-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem', height: 'calc(100vh - 150px)', paddingBottom: '2rem' }}>
                        
                        {/* Platform Selector */}
                        <div style={{ 
                            background: '#334155', 
                            borderRadius: '16px', 
                            padding: '1rem', 
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
                            border: '1px solid #475569',
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.2rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '8px', height: '24px', background: '#38bdf8', borderRadius: '4px', boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}></div>
                                Select Accounts
                            </h3>
                            {loading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#cbd5e1' }}>Loading accounts...</div>
                            ) : accounts.length === 0 ? (
                                <div style={{ 
                                    padding: '2rem', 
                                    textAlign: 'center', 
                                    background: 'rgba(239, 68, 68, 0.15)', 
                                    border: '1px dashed rgba(239, 68, 68, 0.4)', 
                                    borderRadius: '12px',
                                    color: '#fca5a5' 
                                }}>
                                    <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>No Accounts Connected</p>
                                    <p style={{ fontSize: '0.9rem', margin: 0, color: '#f87171' }}>Please go to Connected Accounts to link your profiles first.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                    {accounts.map(acc => {
                                        const isSelected = selectedAccounts.includes(acc.id);
                                        return (
                                            <div 
                                                key={acc.id}
                                                onClick={() => toggleAccountSelection(acc.id)}
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.75rem',
                                                    padding: '0.75rem 1.25rem',
                                                    borderRadius: '12px',
                                                    border: `2px solid ${isSelected ? '#38bdf8' : '#475569'}`,
                                                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                                    boxShadow: isSelected ? '0 0 15px rgba(56, 189, 248, 0.25)' : 'none'
                                                }}
                                            >
                                                <div style={{ 
                                                    fontWeight: 600, 
                                                    color: isSelected ? '#38bdf8' : '#cbd5e1', 
                                                    textTransform: 'capitalize',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    {acc.platform}
                                                </div>
                                                {isSelected && <CheckCircle2 size={18} color="#38bdf8" strokeWidth={3} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Content Editor */}
                        <div style={{ 
                            background: 'rgba(15, 23, 42, 0.4)', 
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            borderRadius: '24px', 
                            padding: '1.5rem', 
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', 
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0
                        }}>
                            {/* Decorative Glow */}
                            <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: '#f472b6', filter: 'blur(70px)', opacity: 0.15, zIndex: 0, pointerEvents: 'none' }}></div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '0.3px' }}>
                                        <div style={{ width: '6px', height: '20px', background: 'linear-gradient(to bottom, #f472b6, #ec4899)', borderRadius: '4px', boxShadow: '0 0 12px rgba(244, 114, 182, 0.6)' }}></div>
                                        Post Content
                                    </h3>
                                </div>

                                {/* Media Upload Area */}
                                {mediaPreview ? (
                                    <>
                                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem', width: '100%' }}>
                                        <div style={{ 
                                            width: '100%', 
                                            height: '220px', 
                                            borderRadius: '16px', 
                                            overflow: 'hidden',
                                            border: `1px solid ${selectedMusic ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                            position: 'relative',
                                            background: '#020617',
                                            boxShadow: selectedMusic ? '0 0 25px rgba(168,85,247,0.3), inset 0 0 20px rgba(0,0,0,0.5)' : 'inset 0 0 20px rgba(0,0,0,0.5)'
                                        }}>
                                            {media && media.type.startsWith('video/') ? (
                                                <video src={mediaPreview} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <img src={mediaPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            )}
                                            {/* Music overlay on photo */}
                                            {selectedMusic && media && !media.type.startsWith('video/') && (
                                                <div style={{ position: 'absolute', bottom: '10px', left: '10px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '5px 10px 5px 5px', border: '1px solid rgba(168,85,247,0.4)' }}>
                                                    <img src={selectedMusic.artworkUrl60} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', animation: 'spin 4s linear infinite' }} />
                                                    <span style={{ fontSize: '0.72rem', color: '#f1f5f9', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedMusic.trackName}</span>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
                                                        {[1,2,3].map(i => <div key={i} style={{ width: '3px', borderRadius: '2px', background: '#c084fc', animation: `eq${i} ${0.4 + i*0.2}s ease-in-out infinite alternate` }} />)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>


                                        <button 
                                            onClick={removeMedia}
                                            style={{
                                                position: 'absolute', top: '15px', right: '15px',
                                                background: 'rgba(15, 23, 42, 0.7)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)',
                                                borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                                backdropFilter: 'blur(8px)',
                                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)'; e.currentTarget.style.color = '#f87171'; }}
                                        >
                                            <X size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    {/* Add Music button row (visible when photo is selected, no music yet) */}
                                    {!selectedMusic && (
                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', marginBottom: '0.25rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => setShowMusicModal(true)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                    padding: '0.55rem 1.25rem',
                                                    background: 'rgba(168, 85, 247, 0.12)',
                                                    color: '#c084fc',
                                                    borderRadius: '20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
                                                    border: '1px solid rgba(168, 85, 247, 0.35)',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                            >
                                                <Music size={15} /> Add Music
                                            </button>
                                        </div>
                                    )}
                                    </>
                                ) : (
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '1.25rem', 
                                        marginBottom: '1.5rem',
                                        padding: '2rem 1rem',
                                        border: '1.5px dashed rgba(255,255,255,0.15)',
                                        borderRadius: '16px',
                                        background: 'rgba(255,255,255,0.02)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                                    >

                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                            <label style={{ 
                                                display: 'flex', alignItems: 'center', gap: '0.6rem', 
                                                padding: '0.75rem 1.5rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', 
                                                borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                                transition: 'all 0.25s',
                                                boxShadow: '0 4px 15px rgba(56, 189, 248, 0.1)'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(56, 189, 248, 0.2)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(56, 189, 248, 0.1)'; }}
                                            >
                                                <ImageIcon size={20} strokeWidth={2.5} /> Add Image
                                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleMediaChange} />
                                            </label>
                                            <label style={{ 
                                                display: 'flex', alignItems: 'center', gap: '0.6rem', 
                                                padding: '0.75rem 1.5rem', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', 
                                                borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                                                border: '1px solid rgba(248, 113, 113, 0.3)',
                                                transition: 'all 0.25s',
                                                boxShadow: '0 4px 15px rgba(248, 113, 113, 0.1)'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(248, 113, 113, 0.2)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(248, 113, 113, 0.1)'; }}
                                            >
                                                <Video size={20} strokeWidth={2.5} /> Add Video
                                                <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleMediaChange} />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowMusicModal(true)}
                                                style={{ 
                                                    display: 'flex', alignItems: 'center', gap: '0.6rem', 
                                                    padding: '0.75rem 1.5rem', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', 
                                                    borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                                    transition: 'all 0.25s',
                                                    boxShadow: '0 4px 15px rgba(168, 85, 247, 0.1)'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                            >
                                                <Music size={20} strokeWidth={2.5} /> Add Music
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Selected Music Bar */}
                                {selectedMusic && (
                                    <div style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', 
                                        background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(99,102,241,0.2) 100%)', 
                                        border: '1px solid rgba(168, 85, 247, 0.5)', 
                                        borderRadius: '14px', padding: '0.75rem 1rem', marginBottom: '1rem',
                                        boxShadow: '0 0 20px rgba(168,85,247,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
                                        position: 'relative', overflow: 'hidden', animation: 'musicPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}>
                                        {/* Shimmer bg */}
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)', animation: 'shimmer 2.5s infinite', pointerEvents: 'none' }} />
                                        
                                        {/* Artwork */}
                                        <div style={{ position: 'relative', flexShrink: 0 }}>
                                            <img src={selectedMusic.artworkUrl60} alt="" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
                                            {/* Spinning disc overlay */}
                                            <div style={{ position: 'absolute', inset: 0, borderRadius: '10px', border: '2px solid rgba(168,85,247,0.5)', animation: 'musicPulse 1.5s ease-in-out infinite' }} />
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                                                <Music size={11} color="#c084fc" />
                                                <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Music Added</span>
                                            </div>
                                            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedMusic.trackName}</div>
                                            <div style={{ color: '#a5b4fc', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedMusic.artistName}</div>
                                        </div>

                                        {/* Animated equalizer bars */}
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '24px', flexShrink: 0, marginRight: '0.5rem' }}>
                                            {[1,2,3,4].map(i => (
                                                <div key={i} style={{ 
                                                    width: '4px', borderRadius: '2px', 
                                                    background: 'linear-gradient(to top, #a855f7, #6366f1)',
                                                    animation: `eq${i} ${0.5 + i * 0.15}s ease-in-out infinite alternate`
                                                }} />
                                            ))}
                                        </div>

                                        <button onClick={removeMusic} style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', cursor: 'pointer', padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.3)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                        ><X size={14} /></button>
                                    </div>
                                )}

                                {/* Text Editor */}
                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="What's on your mind? Start typing here..."
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            padding: '1.25rem',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            outline: 'none',
                                            resize: 'vertical',
                                            fontSize: '1rem',
                                            fontFamily: 'inherit',
                                            marginBottom: '0',
                                            boxSizing: 'border-box',
                                            transition: 'all 0.3s ease',
                                            lineHeight: '1.6',
                                            backgroundColor: 'rgba(15, 23, 42, 0.5)',
                                            color: '#f8fafc',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                        onFocus={(e) => { e.target.style.borderColor = '#f472b6'; e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 114, 182, 0.15), inset 0 2px 4px rgba(0,0,0,0.2)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
                                    />
                                    <div style={{ 
                                        position: 'absolute', 
                                        bottom: '15px', 
                                        right: '15px', 
                                        fontSize: '0.8rem', 
                                        color: content.length > 2200 ? '#f87171' : '#94a3b8',
                                        fontWeight: 600,
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        {content.length} / 2200
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Publishing Options */}
                        <div style={{ 
                            background: '#334155', 
                            borderRadius: '16px', 
                            padding: '1rem', 
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
                            border: '1px solid #475569',
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '24px', background: '#34d399', borderRadius: '4px', boxShadow: '0 0 10px rgba(52, 211, 153, 0.5)' }}></div>
                                    Publish Options
                                </h3>
                                <button 
                                    onClick={() => setIsScheduling(!isScheduling)}
                                    style={{ 
                                        background: isScheduling ? 'rgba(248, 113, 113, 0.15)' : 'rgba(52, 211, 153, 0.15)', 
                                        border: `1px solid ${isScheduling ? 'rgba(248, 113, 113, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`, 
                                        color: isScheduling ? '#f87171' : '#34d399', 
                                        fontWeight: 600, 
                                        cursor: 'pointer', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Calendar size={18} /> {isScheduling ? 'Cancel Schedule' : 'Schedule for later'}
                                </button>
                            </div>

                            {isScheduling && (
                                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#0f172a', borderRadius: '12px', border: '1px solid #475569' }}>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                        <div style={{ flex: '1 1 calc(50% - 0.5rem)' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Date</label>
                                            <input 
                                                type="date" 
                                                value={scheduledDate}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                style={{
                                                    padding: '0.85rem', borderRadius: '10px', border: '1px solid #64748b', 
                                                    outline: 'none', fontSize: '1rem', fontFamily: 'inherit', width: '100%',
                                                    backgroundColor: '#1e293b', color: '#f8fafc', boxSizing: 'border-box',
                                                    colorScheme: 'dark'
                                                }}
                                            />
                                        </div>
                                        <div style={{ flex: '1 1 calc(50% - 0.5rem)' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Time</label>
                                            <input 
                                                type="time" 
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                style={{
                                                    padding: '0.85rem', borderRadius: '10px', border: '1px solid #64748b', 
                                                    outline: 'none', fontSize: '1rem', fontFamily: 'inherit', width: '100%',
                                                    backgroundColor: '#1e293b', color: '#f8fafc', boxSizing: 'border-box',
                                                    colorScheme: 'dark'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Timezone</label>
                                        <select 
                                            value={timezone}
                                            onChange={(e) => setTimezone(e.target.value)}
                                            style={{
                                                padding: '0.85rem', borderRadius: '10px', border: '1px solid #64748b', 
                                                outline: 'none', fontSize: '1rem', fontFamily: 'inherit', width: '100%',
                                                backgroundColor: '#1e293b', color: '#f8fafc', boxSizing: 'border-box',
                                                colorScheme: 'dark'
                                            }}
                                        >
                                            <option value="Asia/Kolkata">India (IST - Asia/Kolkata)</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                            <option value="Europe/London">Europe/London (GMT)</option>
                                            <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={isPosting ? undefined : handleSubmit}
                                    disabled={isPosting}
                                    style={{
                                        flex: 1, padding: '1.15rem', 
                                        background: isPosting ? 'linear-gradient(135deg, #4b5563 0%, #374151 100%)' : 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                                        color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                        cursor: isPosting ? 'not-allowed' : 'pointer',
                                        boxShadow: isPosting ? 'none' : '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: 'translateY(0)',
                                        opacity: isPosting ? 0.8 : 1
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(99, 102, 241, 0.6)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(99, 102, 241, 0.4)'; }}
                                >
                                    {isPosting ? (
                                        <>
                                            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                                            {selectedMusic ? 'Adding Music & Posting...' : 'Posting...'}
                                        </>
                                    ) : (
                                        isScheduling ? <><Clock size={22} /> Schedule Post</> : <><Send size={22} /> Post Now</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Live Preview Section */}
                    <div style={{ position: 'sticky', top: '2rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: '0 0 8px #ef4444' }}></span>
                            Live Preview
                        </h3>
                        
                        <div style={{ 
                            background: 'rgba(15, 23, 42, 0.4)', 
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            borderRadius: '24px', 
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', 
                            overflow: 'hidden', 
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            maxWidth: '400px',
                            margin: '0 auto',
                            position: 'relative'
                        }}>
                            {/* Decorative Glow */}
                            <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: '#8b5cf6', filter: 'blur(70px)', opacity: 0.3, zIndex: 0, pointerEvents: 'none' }}></div>
                            <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '150px', height: '150px', background: '#3b82f6', filter: 'blur(70px)', opacity: 0.2, zIndex: 0, pointerEvents: 'none' }}></div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                {/* Mock App Header */}
                                <div style={{ 
                                    padding: '1.25rem 1.25rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.75rem',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                }}>
                                    <div style={{ 
                                        width: '44px', 
                                        height: '44px', 
                                        borderRadius: '50%', 
                                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)',
                                        border: '2px solid rgba(255,255,255,0.2)'
                                    }}>
                                        S
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem', letterSpacing: '0.2px' }}>SocialSync User</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                                            Just now <span style={{ color: '#475569' }}>•</span> <span title="Public" style={{ cursor: 'pointer' }}>🌍 Public</span>
                                        </div>
                                    </div>
                                    <div style={{ marginLeft: 'auto', color: '#64748b', cursor: 'pointer' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                    </div>
                                </div>

                                {/* Post Text */}
                                <div style={{ 
                                    padding: '1.25rem', 
                                    color: '#f1f5f9', 
                                    whiteSpace: 'pre-wrap', 
                                    wordBreak: 'break-word', 
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    fontWeight: 400
                                }}>
                                    {content || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Your caption will appear here... Type something amazing! ✨</span>}
                                </div>

                                {/* Post Media */}
                                {mediaPreview && (
                                    <div style={{ width: '100%', background: '#020617', position: 'relative' }}>
                                        <img src={mediaPreview} alt="Preview" style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'cover' }} />
                                    </div>
                                )}

                                {/* Selected Music in Preview */}
                                {selectedMusic && (
                                    <div style={{ margin: '0 1.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(168,85,247,0.15)', borderRadius: '10px', padding: '0.5rem 0.75rem', border: '1px solid rgba(168,85,247,0.3)' }}>
                                        <Music2 size={14} color="#c084fc" />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedMusic.trackName}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#c084fc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedMusic.artistName}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Mock Actions */}
                                <div style={{ padding: '1rem 1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', zIndex: 3, border: '2px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></div>
                                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', marginLeft: '-6px', zIndex: 2, border: '2px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></div>
                                            </div>
                                            <span>128</span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem' }}>24 Comments <span style={{ margin: '0 4px', color: '#475569' }}>•</span> 12 Shares</div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Like
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> Comment
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> Share
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Music Search Modal */}
            {showMusicModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => { audioRef.pause(); setPlayingTrackId(null); setShowMusicModal(false); }}>
                    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', borderRadius: '24px', padding: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music size={18} color="#fff" /></div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f1f5f9' }}>Add Music</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Search from millions of songs</div>
                                </div>
                            </div>
                            <button onClick={() => { audioRef.pause(); setPlayingTrackId(null); setShowMusicModal(false); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                        </div>

                        {/* Search Bar */}
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search songs, artists..."
                                value={musicSearch}
                                onChange={(e) => setMusicSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchMusic(musicSearch)}
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                            />
                            <button onClick={() => searchMusic(musicSearch)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'linear-gradient(135deg, #a855f7, #6366f1)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Search</button>
                        </div>

                        {/* Results */}
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {musicSearching && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>🎵</div>
                                    <div>Searching songs...</div>
                                </div>
                            )}
                            {!musicSearching && musicResults.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    <Music2 size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <div style={{ fontWeight: 600 }}>Search for your favourite song</div>
                                    <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Type a song name and press Enter or Search</div>
                                </div>
                            )}
                            {musicResults.map(track => (
                                <div key={track.trackId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '12px', background: selectedMusic?.trackId === track.trackId ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedMusic?.trackId === track.trackId ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => { if (selectedMusic?.trackId !== track.trackId) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                    onMouseLeave={(e) => { if (selectedMusic?.trackId !== track.trackId) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                >
                                    <img src={track.artworkUrl60} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.trackName}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.artistName} · {track.collectionName}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                        {track.previewUrl && (
                                            <button onClick={() => handlePlayPause(track)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {playingTrackId === track.trackId ? <Pause size={14} /> : <Play size={14} />}
                                            </button>
                                        )}
                                        <button onClick={() => selectMusic(track)} style={{ background: selectedMusic?.trackId === track.trackId ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'rgba(168,85,247,0.2)', border: `1px solid rgba(168,85,247,0.4)`, color: '#c084fc', borderRadius: '8px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', flexShrink: 0, transition: 'all 0.2s' }}>
                                            {selectedMusic?.trackId === track.trackId ? '✓ Selected' : 'Use'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes musicPop {
                    0% { transform: scale(0.85); opacity: 0; }
                    70% { transform: scale(1.03); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes musicPulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.9; transform: scale(1.04); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                @keyframes eq1 { from { height: 6px; } to { height: 20px; } }
                @keyframes eq2 { from { height: 12px; } to { height: 8px; } }
                @keyframes eq3 { from { height: 18px; } to { height: 6px; } }
                @keyframes eq4 { from { height: 8px; } to { height: 22px; } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .create-post-container {
                    padding: 1rem 1.5rem;
                }
                @media (max-width: 900px) {
                    .create-post-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .create-post-container {
                        padding: 0.5rem;
                    }
                }
                body {
                    background-color: #1e293b !important;
                }
                .editor-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .editor-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .editor-scroll::-webkit-scrollbar-thumb {
                    background: #475569;
                    border-radius: 10px;
                }
                `}
            </style>
        </div>
    );
};

export default CreatePost;
