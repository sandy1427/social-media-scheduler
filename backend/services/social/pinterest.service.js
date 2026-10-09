const axios = require('axios');

class PinterestService {
    constructor() {
        this.clientId = process.env.PINTEREST_CLIENT_ID;
        this.clientSecret = process.env.PINTEREST_CLIENT_SECRET;
        this.redirectUri = process.env.PINTEREST_REDIRECT_URI || 'http://localhost:5000/api/social/pinterest/callback';
    }

    getAuthorizationUrl(state) {
        return `https://www.pinterest.com/oauth/?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=code&scope=boards:read,pins:read,pins:write&state=${state}`;
    }

    async handleCallback(code) {
        const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.redirectUri
        });

        const { data } = await axios.post('https://api.pinterest.com/v5/oauth/token', params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${credentials}`
            }
        });
        return data;
    }

    async getAccountInfo(accessToken) {
        const { data } = await axios.get('https://api.pinterest.com/v5/user_account', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return {
            platform_user_id: data.account_type,
            account_name: data.username,
            username: data.username,
            profile_image_url: data.profile_image
        };
    }

    async publishPost(account, post) {
        try {
            if (!account.access_token) {
                throw new Error("Pinterest publishing permission is missing.");
            }

            if (!post.media_url) {
                return { success: false, error: "Pinterest requires an image or video to publish." };
            }

            // Pinterest requires a board_id. We'd normally fetch boards and let user select.
            // For this backend simulation, we will attempt to create the pin, assuming a board_id is provided or fetched.
            // Since we don't have board selection in UI, this will likely fail with a 400 from Pinterest API.
            
            const payload = {
                title: post.caption ? post.caption.substring(0, 100) : 'Pin from SocialSync',
                description: post.caption || '',
                board_id: post.board_id || 'UNKNOWN_BOARD', 
                media_source: {
                    source_type: post.media_type === 'video' ? 'video_url' : 'image_url',
                    url: post.media_url
                }
            };

            if (post.link_url) {
                payload.link = post.link_url;
            }

            const { data } = await axios.post('https://api.pinterest.com/v5/pins', payload, {
                headers: { 
                    Authorization: `Bearer ${account.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                external_post_id: data.id
            };
        } catch (error) {
            console.error('Pinterest publish error:', error.response?.data || error.message);
            const errMessage = error.response?.data?.message || error.message;
            return {
                success: false,
                error: errMessage
            };
        }
    }
}

module.exports = new PinterestService();
