import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, PenSquare, Calendar, Link as LinkIcon, 
    BarChart2, User, Settings, LogOut, Clock, Bell, Sparkles, Search, Menu, X 
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const NotificationBell = () => {
    const { api } = useAuth();
    const [unreadCount, setUnreadCount] = useState(5); // Hardcoded to 5 for UI showcase
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
                <Bell size={20} color="#cbd5e1" />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-2px', right: '-2px',
                        background: '#ef4444', color: '#fff', fontSize: '0.65rem',
                        fontWeight: 'bold', width: '18px', height: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%', border: '2px solid #0f172a'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </div>
            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '10px',
                    width: '300px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', padding: '1rem', zIndex: 50,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#fff' }}>Notifications</h3>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        You have {unreadCount} new notifications.
                    </div>
                    <div style={{ padding: '10px 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
                        Welcome to SocialSync!
                    </div>
                </div>
            )}
        </div>
    );
};

const ProfileDropdown = ({ user, handleLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const userName = user?.full_name || user?.name || user?.username || 'John Doe';
    const userInitials = userName.substring(0, 2).toUpperCase();

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            >
                {user?.profile_pic ? (
                    <img src={user.profile_pic} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                        {userInitials}
                    </div>
                )}
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{userName}</div>
                </div>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '10px',
                    minWidth: '200px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', padding: '0.5rem', zIndex: 50,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem'
                }}>
                    <Link to="/profile" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: '#e2e8f0', textDecoration: 'none', borderRadius: '8px' }}>
                        <User size={16} /> Profile
                    </Link>
                    <Link to="/settings" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: '#e2e8f0', textDecoration: 'none', borderRadius: '8px' }}>
                        <Settings size={16} /> Settings
                    </Link>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }}></div>
                    <div onClick={() => { setIsOpen(false); handleLogout(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: '#ef4444', textDecoration: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        <LogOut size={16} /> Logout
                    </div>
                </div>
            )}
        </div>
    );
};

const DashboardLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="dashboard-layout">
            {/* Mobile Overlay */}
            <div 
                className={`sidebar-overlay ${isMobileMenuOpen ? 'mobile-open' : ''}`} 
                onClick={() => setIsMobileMenuOpen(false)}
            />

            <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`} style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div className="sidebar-header" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '24px', filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.6))' }}>✨</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>SocialSync</span>
                </div>
                <div className="sidebar-nav" style={{ padding: '0 1rem', flex: 1, overflowY: 'auto' }}>
                    <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
                        <User size={20} />
                        <span>Profile</span>
                    </Link>
                    <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/connected-accounts" className={`nav-item ${isActive('/connected-accounts') ? 'active' : ''}`}>
                        <LinkIcon size={20} />
                        <span>Connected Accounts</span>
                    </Link>
                    <Link to="/create-post" className={`nav-item ${isActive('/create-post') ? 'active' : ''}`}>
                        <PenSquare size={20} />
                        <span>Create Post</span>
                    </Link>
                    <Link to="/posts" className={`nav-item ${isActive('/posts') ? 'active' : ''}`}>
                        <Clock size={20} />
                        <span>My Posts</span>
                    </Link>
                    <Link to="/calendar" className={`nav-item ${isActive('/calendar') ? 'active' : ''}`}>
                        <Calendar size={20} />
                        <span>Calendar</span>
                    </Link>

                    <Link to="/analytics" className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}>
                        <BarChart2 size={20} />
                        <span>Analytics</span>
                    </Link>
                    



                    <div className="nav-item disabled" title="Coming Soon">
                        <Settings size={20} />
                        <span>Settings</span>
                    </div>
                </div>


            </aside>

            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                {/* Top Nav */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', background: 'transparent' }}>
                    <div className="mobile-menu-btn" style={{ cursor: 'pointer', padding: '0.5rem', marginLeft: '-1rem' }} onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu size={24} color="#cbd5e1" />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: 'auto' }}>
                        <NotificationBell />
                        
                        <ProfileDropdown user={user} handleLogout={handleLogout} />
                    </div>
                </div>
                
                <div className="page-content-wrapper" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
