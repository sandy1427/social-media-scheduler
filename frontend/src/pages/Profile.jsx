import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    User, Lock, Bell, Palette, Link as LinkIcon, Shield, AlertTriangle, 
    Globe, Clock, Mail, CheckCircle, XCircle, ChevronRight, Eye, EyeOff,
    Monitor, Smartphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateProfile, changePassword, logout, api } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState(user?.full_name || 'John Doe');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showCurPass, setShowCurPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfPass, setShowConfPass] = useState(false);

    const [nameMsg, setNameMsg] = useState({ text: '', type: '' });
    const [passMsg, setPassMsg] = useState({ text: '', type: '' });
    const [profilePic, setProfilePic] = useState(user?.profile_pic || null);

    const [connectedAccounts, setConnectedAccounts] = useState([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const { data } = await api.get('/social/accounts');
                setConnectedAccounts(data);
            } catch (err) {
                console.error("Failed to fetch accounts", err);
            }
        };
        fetchAccounts();
    }, [api]);

    // Dummy states for the UI
    const [theme, setTheme] = useState('Dark (Default)');
    const [timezone, setTimezone] = useState('Asia/Kolkata (GMT+5:30)');
    const [language, setLanguage] = useState('English');
    const [compactMode, setCompactMode] = useState(false);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('media', file);
            try {
                const { data } = await api.post('/posts/media', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setProfilePic(data.media_url);
            } catch (error) {
                setNameMsg({ text: 'Failed to upload photo', type: 'error' });
            }
        }
    };

    const handleUpdateName = async (e) => {
        e.preventDefault();
        setNameMsg({ text: '', type: '' });
        if (!name) return setNameMsg({ text: 'Name cannot be empty', type: 'error' });
        try {
            await updateProfile(name, profilePic === user?.profile_pic ? undefined : profilePic);
            setNameMsg({ text: 'Profile updated successfully', type: 'success' });
            setTimeout(() => setNameMsg({ text: '', type: '' }), 3000);
        } catch (error) {
            setNameMsg({ text: error.response?.data?.message || 'Failed to update', type: 'error' });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPassMsg({ text: '', type: '' });
        if (!currentPassword || !newPassword || !confirmPassword) {
            return setPassMsg({ text: 'Please fill all fields', type: 'error' });
        }
        if (newPassword !== confirmPassword) {
            return setPassMsg({ text: 'Passwords do not match', type: 'error' });
        }
        try {
            await changePassword(currentPassword, newPassword);
            setPassMsg({ text: 'Password changed', type: 'success' });
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            setTimeout(() => setPassMsg({ text: '', type: '' }), 3000);
        } catch (error) {
            setPassMsg({ text: error.response?.data?.message || 'Failed to change', type: 'error' });
        }
    };

    const SectionHeader = ({ icon: Icon, title, subtitle }) => (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ color: '#8b5cf6', marginTop: '2px' }}><Icon size={20} /></div>
            <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>{title}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{subtitle}</p>
            </div>
        </div>
    );

    const Switch = ({ checked, onChange }) => (
        <div 
            onClick={onChange}
            style={{ 
                width: '40px', height: '22px', borderRadius: '12px', 
                background: checked ? '#8b5cf6' : '#334155',
                position: 'relative', cursor: 'pointer', transition: '0.3s'
            }}
        >
            <div style={{
                width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                position: 'absolute', top: '2px', left: checked ? '20px' : '2px', transition: '0.3s'
            }} />
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#fff' }}>Profile Settings</h1>
                <p style={{ margin: 0, color: '#94a3b8' }}>Manage your account, preferences and security settings.</p>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '1.5rem',
                alignItems: 'start'
            }}>
                {/* Personal Information */}
                <div className="card" style={{ background: 'rgba(30, 41, 59, 0.6)' }}>
                    <SectionHeader icon={User} title="Personal Information" subtitle="Update your personal details and profile photo." />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.75rem', fontWeight: 'bold', color: '#fff', position: 'relative'
                        }}>
                            {profilePic ? (
                                <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                name?.charAt(0)?.toUpperCase() || 'U'
                            )}
                            <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#1e293b', borderRadius: '50%', padding: '4px' }}>
                                <User size={12} color="#94a3b8" />
                            </div>
                        </div>
                        <div>
                            <input type="file" id="photo-upload" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                            <label htmlFor="photo-upload" style={{
                                padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc',
                                borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600, display: 'inline-block'
                            }}>
                                Change Photo
                            </label>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateName}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Email Address (Read Only)</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input type="email" value={user?.email || 'john.doe@example.com'} readOnly 
                                    style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', outline: 'none' }} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} 
                                    style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', color: '#fff', borderRadius: '8px', outline: 'none' }} />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                            Update Profile
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="card" style={{ background: 'rgba(30, 41, 59, 0.6)' }}>
                    <SectionHeader icon={Lock} title="Change Password" subtitle="Keep your account secure with a strong password." />
                    
                    <form onSubmit={handleChangePassword}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input type={showCurPass ? 'text' : 'password'} placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} 
                                    style={{ width: '100%', padding: '0.6rem 2.5rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', color: '#fff', borderRadius: '8px', outline: 'none' }} />
                                <div onClick={() => setShowCurPass(!showCurPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', cursor: 'pointer' }}>
                                    {showCurPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input type={showNewPass ? 'text' : 'password'} placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
                                    style={{ width: '100%', padding: '0.6rem 2.5rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', color: '#fff', borderRadius: '8px', outline: 'none' }} />
                                <div onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', cursor: 'pointer' }}>
                                    {showNewPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input type={showConfPass ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                                    style={{ width: '100%', padding: '0.6rem 2.5rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', color: '#fff', borderRadius: '8px', outline: 'none' }} />
                                <div onClick={() => setShowConfPass(!showConfPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', cursor: 'pointer' }}>
                                    {showConfPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            <div>Password must contain:</div>
                            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem' }}>
                                <li>At least 8 characters</li>
                                <li>One uppercase letter</li>
                                <li>One lowercase letter</li>
                                <li>One number or special character</li>
                            </ul>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                            Change Password
                        </button>
                    </form>
                </div>



                {/* Connected Account Summary */}
                <div className="card" style={{ background: 'rgba(30, 41, 59, 0.6)' }}>
                    <SectionHeader icon={LinkIcon} title="Connected Account Summary" subtitle="Manage your connected social media accounts." />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[
                            { id: 'facebook', name: 'Facebook', color: '#1877F2' },
                            { id: 'instagram', name: 'Instagram', color: '#E4405F' },
                            { id: 'x', name: 'X (Twitter)', color: '#000000' },
                            { id: 'youtube', name: 'YouTube', color: '#FF0000' },
                            { id: 'threads', name: 'Threads', color: '#000000' },
                            { id: 'pinterest', name: 'Pinterest', color: '#BD081C' }
                        ].map((p, i) => {
                            const isConnected = connectedAccounts.some(acc => acc.platform === p.id);
                            return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '10px', border: '1px solid #334155' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        {p.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: isConnected ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isConnected ? '#10b981' : '#94a3b8' }}></div>
                                            {isConnected ? 'Connected' : 'Not Connected'}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={16} color="#64748b" />
                            </div>
                            );
                        })}
                    </div>
                    <Link to="/connected-accounts" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #334155', color: '#3b82f6', fontWeight: 600, background: 'rgba(15, 23, 42, 0.5)', textDecoration: 'none' }}>
                        Manage Accounts
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Profile;
