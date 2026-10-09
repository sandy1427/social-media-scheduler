const { GoogleGenerativeAI } = require('@google/generative-ai');

const getModel = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('AI features are not configured. Please configure the AI provider.');
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

const handleAiCall = async (prompt, res) => {
    try {
        const model = getModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('AI Error:', error);
        if (error.message && error.message.includes('not configured')) {
            return res.status(500).json({ message: error.message });
        }
        if (error.status === 429) {
            return res.status(429).json({ message: 'AI request limit reached. Please try again later.' });
        }
        return res.status(500).json({ message: 'AI generation failed. Please try again.' });
    }
};

exports.generateCaption = async (req, res) => {
    const { topic, platform, tone, language, length } = req.body;
    if (!topic) return res.status(400).json({ message: 'Topic is required' });

    const prompt = `Write a social media caption for ${platform || 'social media'} about "${topic}".
    Tone: ${tone || 'casual'}
    Language: ${language || 'English'}
    Length: ${length || 'medium'}
    
    Output ONLY a valid JSON object with the following structure:
    {
      "caption": "the generated caption text",
      "hashtags": ["#tag1", "#tag2"]
    }
    Do not include markdown blocks or any other text outside the JSON.`;

    const text = await handleAiCall(prompt, res);
    if (!text) return; // Already handled error
    
    try {
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText);
        res.json(data);
    } catch (e) {
        // Fallback if AI didn't return perfect JSON
        res.json({ caption: text, hashtags: [] });
    }
};

exports.generateHashtags = async (req, res) => {
    const { caption, topic, platform } = req.body;
    if (!topic && !caption) return res.status(400).json({ message: 'Topic or caption is required' });

    const prompt = `Generate highly relevant social media hashtags.
    ${caption ? `Based on this caption: "${caption}"` : ''}
    ${topic ? `Topic: "${topic}"` : ''}
    Platform: ${platform || 'general'}
    
    Provide a mix of broad and niche hashtags. Return ONLY a comma-separated list of hashtags (e.g. #tag1, #tag2).`;

    const text = await handleAiCall(prompt, res);
    if (!text) return;
    
    const hashtags = text.split(',').map(t => t.trim()).filter(t => t.startsWith('#'));
    res.json({ hashtags });
};

exports.contentIdeas = async (req, res) => {
    const { topic, audience, platform, number } = req.body;
    if (!topic) return res.status(400).json({ message: 'Topic is required' });

    const prompt = `Generate ${number || 5} social media content ideas for:
    Topic/Brand: "${topic}"
    Target Audience: "${audience || 'general'}"
    Platform: "${platform || 'any'}"
    
    Output ONLY a valid JSON array of objects with the following structure:
    [
      {
        "title": "Idea Title",
        "description": "Short description of the post",
        "type": "Educational/Promotional/etc",
        "platform": "Suggested platform"
      }
    ]
    Do not include markdown blocks or any other text outside the JSON.`;

    const text = await handleAiCall(prompt, res);
    if (!text) return;
    
    try {
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText);
        res.json({ ideas: data });
    } catch (e) {
        res.status(500).json({ message: 'Failed to parse AI response' });
    }
};

exports.optimizeCaption = async (req, res) => {
    const { caption, platform } = req.body;
    if (!caption || !platform) return res.status(400).json({ message: 'Caption and platform are required' });

    const prompt = `Optimize the following caption specifically for ${platform}.
    Follow best practices for ${platform} (e.g., X has length limits, Instagram needs engagement, LinkedIn is professional).
    
    Original caption:
    "${caption}"
    
    Return ONLY the optimized caption text.`;

    const text = await handleAiCall(prompt, res);
    if (!text) return;
    
    res.json({ optimizedCaption: text });
};

exports.improveCaption = async (req, res) => {
    const { caption, option } = req.body;
    if (!caption) return res.status(400).json({ message: 'Caption is required' });

    const prompt = `Rewrite and improve the following caption.
    Instruction: ${option}
    
    Original caption:
    "${caption}"
    
    Return ONLY the improved caption text.`;

    const text = await handleAiCall(prompt, res);
    if (!text) return;
    
    res.json({ improvedCaption: text });
};

exports.generateCta = async (req, res) => {
    const { caption, platform, topic } = req.body;
    
    const prompt = `Generate 5 Call-to-Action (CTA) phrases suitable for social media.
    ${caption ? `Based on this context: "${caption}"` : ''}
    ${topic ? `Topic: "${topic}"` : ''}
    Platform: ${platform || 'general'}
    
    Return ONLY a comma-separated list of CTAs.`;

    const text = await handleAiCall(prompt, res);
    if (!text) return;
    
    const ctas = text.split(',').map(t => t.trim());
    res.json({ ctas });
};

exports.rewriteContent = async (req, res) => {
    const { content, option } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const prompt = `Rewrite the following text based on this instruction: ${option}.
    
    Original text:
    "${content}"
    
    Return ONLY the rewritten text.`;

    const text = await handleAiCall(prompt, res);
    if (!text) return;
    
    res.json({ rewrittenContent: text });
};
