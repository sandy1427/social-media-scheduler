import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Hash, Lightbulb, MessageSquare, Edit3, Type, Copy, Check } from 'lucide-react';

const AIAssistant = ({ onUseContent, isModal = false }) => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('caption');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    // Form States
    const [captionForm, setCaptionForm] = useState({ topic: '', platform: '', tone: '', language: 'English', length: 'medium' });
    const [hashtagForm, setHashtagForm] = useState({ caption: '', topic: '', platform: '' });
    const [ideaForm, setIdeaForm] = useState({ topic: '', audience: '', platform: '', number: 5 });
    const [improveForm, setImproveForm] = useState({ caption: '', option: 'Make more professional' });
    const [rewriteForm, setRewriteForm] = useState({ content: '', option: 'Shorten' });
    const [optimizeForm, setOptimizeForm] = useState({ caption: '', platform: '' });
    const [ctaForm, setCtaForm] = useState({ caption: '', topic: '', platform: '' });

    // Result States
    const [captionResult, setCaptionResult] = useState(null);
    const [hashtagResult, setHashtagResult] = useState(null);
    const [ideaResult, setIdeaResult] = useState(null);
    const [improveResult, setImproveResult] = useState(null);
    const [rewriteResult, setRewriteResult] = useState(null);
    const [optimizeResult, setOptimizeResult] = useState(null);
    const [ctaResult, setCtaResult] = useState(null);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerate = async (endpoint, payload, setResult) => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.post(`/ai/${endpoint}`, payload);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'AI generation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUseContent = (content) => {
        if (onUseContent) {
            onUseContent(content);
        } else {
            navigate('/create-post', { state: { initialCaption: content } });
        }
    };

    const renderTabs = () => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', background: '#1e293b', padding: '0.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
            {[
                { id: 'caption', label: 'Generate Caption', icon: MessageSquare },
                { id: 'hashtags', label: 'Generate Hashtags', icon: Hash },
                { id: 'ideas', label: 'Content Ideas', icon: Lightbulb },
                { id: 'improve', label: 'Improve Caption', icon: Edit3 },
                { id: 'rewrite', label: 'Content Rewriter', icon: Type },
                { id: 'optimize', label: 'Platform Optimizer', icon: Sparkles },
                { id: 'cta', label: 'CTA Generator', icon: Type }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setError(null); }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
                        background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                        color: activeTab === tab.id ? '#fff' : '#94a3b8',
                        fontWeight: 600, transition: 'all 0.2s', flex: '1 1 auto', justifyContent: 'center'
                    }}
                >
                    <tab.icon size={18} /> {tab.label}
                </button>
            ))}
        </div>
    );

    const renderCaptionGenerator = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc' }}>Caption Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="text" placeholder="Topic / Product / Description" className="input" value={captionForm.topic} onChange={e => setCaptionForm({...captionForm, topic: e.target.value})} />
                    <select className="input" value={captionForm.platform} onChange={e => setCaptionForm({...captionForm, platform: e.target.value})}>
                        <option value="">Select Platform (Optional)</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="X">X (Twitter)</option>
                        <option value="LinkedIn">LinkedIn</option>
                    </select>
                    <select className="input" value={captionForm.tone} onChange={e => setCaptionForm({...captionForm, tone: e.target.value})}>
                        <option value="">Select Tone (Optional)</option>
                        <option value="Professional">Professional</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Casual">Casual</option>
                        <option value="Funny">Funny</option>
                        <option value="Promotional">Promotional</option>
                        <option value="Inspirational">Inspirational</option>
                        <option value="Educational">Educational</option>
                    </select>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select className="input" value={captionForm.language} onChange={e => setCaptionForm({...captionForm, language: e.target.value})} style={{ flex: 1 }}>
                            <option value="English">English</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Tanglish">Tanglish</option>
                        </select>
                        <select className="input" value={captionForm.length} onChange={e => setCaptionForm({...captionForm, length: e.target.value})} style={{ flex: 1 }}>
                            <option value="short">Short</option>
                            <option value="medium">Medium</option>
                            <option value="long">Long</option>
                        </select>
                    </div>
                    <button className="btn-primary" onClick={() => handleGenerate('generate-caption', captionForm, setCaptionResult)} disabled={loading || !captionForm.topic}>
                        {loading ? 'Generating...' : 'Generate Caption'}
                    </button>
                </div>
            </div>
            
            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #475569', minHeight: '300px' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc' }}>Result</h3>
                {captionResult ? (
                    <div>
                        <div style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1rem' }}>
                            {captionResult.caption}
                        </div>
                        {captionResult.hashtags && captionResult.hashtags.length > 0 && (
                            <div style={{ color: '#3b82f6', marginBottom: '1.5rem' }}>
                                {captionResult.hashtags.join(' ')}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-secondary" onClick={() => handleCopy(`${captionResult.caption}\n\n${captionResult.hashtags.join(' ')}`)}>
                                {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copied' : 'Copy'}
                            </button>
                            <button className="btn-primary" onClick={() => handleUseContent(`${captionResult.caption}\n\n${captionResult.hashtags.join(' ')}`)}>Use Caption</button>
                            <button className="btn-secondary" onClick={() => handleGenerate('generate-caption', captionForm, setCaptionResult)} disabled={loading}>Regenerate</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#64748b' }}>
                        <Sparkles size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Fill out the details and click generate to see the magic.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderHashtags = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc' }}>Hashtag Generator</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <textarea placeholder="Paste your caption here (Optional)" className="input" rows="4" value={hashtagForm.caption} onChange={e => setHashtagForm({...hashtagForm, caption: e.target.value})} />
                    <input type="text" placeholder="Topic / Keywords" className="input" value={hashtagForm.topic} onChange={e => setHashtagForm({...hashtagForm, topic: e.target.value})} />
                    <select className="input" value={hashtagForm.platform} onChange={e => setHashtagForm({...hashtagForm, platform: e.target.value})}>
                        <option value="">General Platform</option>
                        <option value="Instagram">Instagram</option>
                        <option value="X">X (Twitter)</option>
                        <option value="TikTok">TikTok</option>
                    </select>
                    <button className="btn-primary" onClick={() => handleGenerate('generate-hashtags', hashtagForm, setHashtagResult)} disabled={loading || (!hashtagForm.topic && !hashtagForm.caption)}>
                        {loading ? 'Generating...' : 'Generate Hashtags'}
                    </button>
                </div>
            </div>
            
            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #475569', minHeight: '300px' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc' }}>Result</h3>
                {hashtagResult ? (
                    <div>
                        <div style={{ color: '#3b82f6', lineHeight: '2', marginBottom: '1.5rem', fontSize: '1.1rem', wordBreak: 'break-word' }}>
                            {hashtagResult.hashtags.join(' ')}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-secondary" onClick={() => handleCopy(hashtagResult.hashtags.join(' '))}>
                                {copied ? <Check size={18} /> : <Copy size={18} />} Copy Hashtags
                            </button>
                            <button className="btn-primary" onClick={() => handleUseContent(`\n\n${hashtagResult.hashtags.join(' ')}`)}>Add to Post</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#64748b' }}>
                        <Hash size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Generate highly relevant hashtags for your post.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderContentIdeas = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Business / Brand / Topic" className="input" value={ideaForm.topic} onChange={e => setIdeaForm({...ideaForm, topic: e.target.value})} style={{ flex: 2, minWidth: '200px' }} />
                <input type="text" placeholder="Target Audience" className="input" value={ideaForm.audience} onChange={e => setIdeaForm({...ideaForm, audience: e.target.value})} style={{ flex: 1, minWidth: '150px' }} />
                <select className="input" value={ideaForm.number} onChange={e => setIdeaForm({...ideaForm, number: parseInt(e.target.value)})} style={{ width: '100px' }}>
                    <option value={3}>3 Ideas</option>
                    <option value={5}>5 Ideas</option>
                    <option value={10}>10 Ideas</option>
                </select>
                <button className="btn-primary" onClick={() => handleGenerate('content-ideas', ideaForm, setIdeaResult)} disabled={loading || !ideaForm.topic}>
                    {loading ? 'Generating...' : 'Generate Ideas'}
                </button>
            </div>
            
            {ideaResult && ideaResult.ideas && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {ideaResult.ideas.map((idea, idx) => (
                        <div key={idx} style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{idea.type}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{idea.platform}</span>
                            </div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.1rem' }}>{idea.title}</h4>
                            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>{idea.description}</p>
                            <button className="btn-secondary" onClick={() => handleUseContent(`Idea: ${idea.title}\n\n${idea.description}`)}>Use Idea</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderImprove = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc' }}>Improve Caption</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <textarea placeholder="Paste your caption here..." className="input" rows="6" value={improveForm.caption} onChange={e => setImproveForm({...improveForm, caption: e.target.value})} />
                    <select className="input" value={improveForm.option} onChange={e => setImproveForm({...improveForm, option: e.target.value})}>
                        <option value="Make shorter">Make shorter</option>
                        <option value="Make more professional">Make more professional</option>
                        <option value="Make more engaging">Make more engaging</option>
                        <option value="Fix grammar">Fix grammar</option>
                        <option value="Add CTA">Add CTA</option>
                        <option value="Make promotional">Make promotional</option>
                        <option value="Make casual">Make casual</option>
                    </select>
                    <button className="btn-primary" onClick={() => handleGenerate('improve-caption', improveForm, setImproveResult)} disabled={loading || !improveForm.caption}>
                        {loading ? 'Generating...' : 'Improve Caption'}
                    </button>
                </div>
            </div>
            
            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #475569', minHeight: '300px' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc' }}>Improved Result</h3>
                {improveResult ? (
                    <div>
                        <div style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1.5rem', background: '#0f172a', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                            {improveResult.improvedCaption}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-secondary" onClick={() => handleCopy(improveResult.improvedCaption)}>
                                {copied ? <Check size={18} /> : <Copy size={18} />} Copy
                            </button>
                            <button className="btn-primary" onClick={() => handleUseContent(improveResult.improvedCaption)}>Use Improved Caption</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#64748b' }}>
                        <Edit3 size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Paste a caption to see AI improvements.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderRewrite = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc' }}>Content Rewriter</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <textarea placeholder="Paste your content here..." className="input" rows="6" value={rewriteForm.content} onChange={e => setRewriteForm({...rewriteForm, content: e.target.value})} />
                    <select className="input" value={rewriteForm.option} onChange={e => setRewriteForm({...rewriteForm, option: e.target.value})}>
                        <option value="Shorten">Shorten</option>
                        <option value="Expand">Expand</option>
                        <option value="Professional">Professional</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Promotional">Promotional</option>
                        <option value="Storytelling">Storytelling</option>
                        <option value="Simple English">Simple English</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Tanglish">Tanglish</option>
                    </select>
                    <button className="btn-primary" onClick={() => handleGenerate('rewrite-content', rewriteForm, setRewriteResult)} disabled={loading || !rewriteForm.content}>
                        {loading ? 'Generating...' : 'Rewrite Content'}
                    </button>
                </div>
            </div>
            
            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #475569', minHeight: '300px' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc' }}>Rewritten Result</h3>
                {rewriteResult ? (
                    <div>
                        <div style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1.5rem', background: '#0f172a', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f43f5e' }}>
                            {rewriteResult.rewrittenContent}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-secondary" onClick={() => handleCopy(rewriteResult.rewrittenContent)}>
                                {copied ? <Check size={18} /> : <Copy size={18} />} Copy
                            </button>
                            <button className="btn-primary" onClick={() => handleUseContent(rewriteResult.rewrittenContent)}>Use Version</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#64748b' }}>
                        <Type size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Paste content to rewrite it in different styles.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderOptimize = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc' }}>Platform Optimizer</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <textarea placeholder="Paste your general caption here..." className="input" rows="6" value={optimizeForm.caption} onChange={e => setOptimizeForm({...optimizeForm, caption: e.target.value})} />
                    <select className="input" value={optimizeForm.platform} onChange={e => setOptimizeForm({...optimizeForm, platform: e.target.value})}>
                        <option value="">Select Platform</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="X">X (Twitter)</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Threads">Threads</option>
                        <option value="Pinterest">Pinterest</option>
                    </select>
                    <button className="btn-primary" onClick={() => handleGenerate('optimize-caption', optimizeForm, setOptimizeResult)} disabled={loading || !optimizeForm.caption || !optimizeForm.platform}>
                        {loading ? 'Optimizing...' : 'Optimize for Platform'}
                    </button>
                </div>
            </div>
            
            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #475569', minHeight: '300px' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc' }}>Optimized Result</h3>
                {optimizeResult ? (
                    <div>
                        <div style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1.5rem', background: '#0f172a', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #a855f7' }}>
                            {optimizeResult.optimizedCaption}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-secondary" onClick={() => handleCopy(optimizeResult.optimizedCaption)}>
                                {copied ? <Check size={18} /> : <Copy size={18} />} Copy
                            </button>
                            <button className="btn-primary" onClick={() => handleUseContent(optimizeResult.optimizedCaption)}>Use Optimized Caption</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#64748b' }}>
                        <Sparkles size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Tailor your caption for a specific platform's best practices.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderCta = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc' }}>CTA Generator</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <textarea placeholder="Paste your caption here (Optional)" className="input" rows="4" value={ctaForm.caption} onChange={e => setCtaForm({...ctaForm, caption: e.target.value})} />
                    <input type="text" placeholder="Topic / Business Goal" className="input" value={ctaForm.topic} onChange={e => setCtaForm({...ctaForm, topic: e.target.value})} />
                    <button className="btn-primary" onClick={() => handleGenerate('generate-cta', ctaForm, setCtaResult)} disabled={loading || (!ctaForm.topic && !ctaForm.caption)}>
                        {loading ? 'Generating...' : 'Generate CTAs'}
                    </button>
                </div>
            </div>
            
            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #475569', minHeight: '300px' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc' }}>Generated CTAs</h3>
                {ctaResult ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {ctaResult.ctas.map((cta, idx) => (
                            <div key={idx} style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{cta.replace(/^[-\d.]+\s*/, '')}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-icon" onClick={() => handleCopy(cta.replace(/^[-\d.]+\s*/, ''))} title="Copy"><Copy size={16} /></button>
                                    <button className="btn-sm" onClick={() => handleUseContent(cta.replace(/^[-\d.]+\s*/, ''))}>Use</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#64748b' }}>
                        <Type size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Generate high-converting Call-to-Actions.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={isModal ? {} : { padding: '2rem', color: '#f8fafc', animation: 'fadeIn 0.5s ease', maxWidth: '1200px', margin: '0 auto' }}>
            {!isModal && (
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)', padding: '1rem', borderRadius: '16px' }}>
                        <Sparkles size={32} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>AI Content Assistant</h1>
                        <p style={{ color: '#cbd5e1', margin: 0, fontSize: '1rem' }}>Create, improve and optimize your social media content with AI.</p>
                    </div>
                </div>
            )}

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', color: '#ef4444', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {renderTabs()}

            {activeTab === 'caption' && renderCaptionGenerator()}
            {activeTab === 'hashtags' && renderHashtags()}
            {activeTab === 'ideas' && renderContentIdeas()}
            {activeTab === 'improve' && renderImprove()}
            {activeTab === 'rewrite' && renderRewrite()}
            {activeTab === 'optimize' && renderOptimize()}
            {activeTab === 'cta' && renderCta()}

            <style>{`
                .input { background: #1e293b; border: 1px solid #334155; color: #fff; padding: 0.75rem 1rem; border-radius: 8px; outline: none; width: 100%; font-family: inherit; font-size: 1rem; transition: border-color 0.2s; }
                .input:focus { border-color: #3b82f6; }
                .btn-primary { background: #3b82f6; border: none; color: #fff; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
                .btn-primary:hover:not(:disabled) { background: #2563eb; }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-secondary { background: transparent; border: 1px solid #475569; color: #cbd5e1; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 600; transition: all 0.2s; }
                .btn-secondary:hover:not(:disabled) { background: #334155; color: #fff; }
                .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-sm { background: transparent; border: 1px solid #3b82f6; color: #3b82f6; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.2s; }
                .btn-sm:hover { background: #3b82f6; color: #fff; }
                .btn-icon { background: transparent; border: 1px solid #475569; color: #cbd5e1; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .btn-icon:hover { background: #334155; color: #fff; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AIAssistant;
