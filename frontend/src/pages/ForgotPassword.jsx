import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [testToken, setTestToken] = useState('');

    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) {
            return setError('Please enter your email');
        }

        setLoading(true);
        try {
            const res = await forgotPassword(email);
            setMessage(res.data.message);
            if (res.data._test_token) {
                setTestToken(res.data._test_token);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Reset Password</h1>
                <p className="auth-subtitle">Enter your email to receive a reset token</p>

                {error && <div className="alert alert-error">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}
                
                {testToken && (
                    <div className="alert alert-success" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', borderColor: '#4F46E5', overflowWrap: 'break-word' }}>
                        <strong>Developer Mode Note:</strong> Copy this token to use in the Reset Password page: <br/>
                        <code style={{ display: 'block', marginTop: '0.5rem', background: '#E0E7FF', padding: '0.5rem', borderRadius: '4px' }}>{testToken}</code>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="auth-links">
                    <Link to="/reset-password">Have a token? Reset here</Link>
                    <div style={{ marginTop: '1rem' }}>
                        Remember your password? <Link to="/login">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
