const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function uploadToCatbox(filePath) {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', fs.createReadStream(filePath));
    const response = await axios.post('https://catbox.moe/user/api.php', formData, {
        headers: formData.getHeaders()
    });
    return response.data; // The public URL as plain text
}

class FacebookService {
    constructor() {
        this.clientId = process.env.FACEBOOK_CLIENT_ID;
        this.clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
        this.redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5000/api/social/facebook/callback';
    }

    getAuthorizationUrl(state) {
        // As per Graph API docs, we need pages_show_list, pages_read_engagement, and pages_manage_posts to publish
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&state=${state}&scope=pages_show_list,pages_read_engagement,pages_manage_posts,business_management`;
    }

    async handleCallback(code) {
        const { data } = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
            params: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                code
            }
        });
        return data; // returns access_token
    }

    async getAccountInfo(accessToken) {
        // Fetch user's pages instead of personal profile (since Graph API only allows posting to pages)
        const { data } = await axios.get('https://graph.facebook.com/v18.0/me/accounts?fields=id,name,picture,access_token', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        console.log("FACEBOOK ACCOUNTS DATA:", JSON.stringify(data, null, 2));

        if (!data.data || data.data.length === 0) {
            throw new Error("No Facebook Pages found! You must create a Facebook Page first.");
        }

        // Return the first page's info and its specific Page Access Token
        const page = data.data[0];
        return {
            platform_user_id: page.id,
            account_name: page.name + ' (Page)',
            username: '',
            profile_image_url: page.picture?.data?.url || '',
            page_access_token: page.access_token // We must use this to publish
        };
    }

    async publishPost(account, post) {
        try {
            // Check if token exists
            if (!account.access_token) {
                throw new Error("Facebook publishing permission is missing. Please reconnect.");
            }

            // Demo mode bypass:
            if (account.access_token === 'mock_access_token_123') {
                console.log(`[Demo Mode] Simulating successful Facebook post publish for post!`);
                return {
                    success: true,
                    external_post_id: 'mock_fb_post_' + Math.floor(Math.random() * 1000000)
                };
            }

            const pageId = account.platform_user_id;
            let url = `https://graph.facebook.com/v18.0/${pageId}/feed`;
            
            let responseData;
            
            // If there's an image and it's a local upload
            if (post.media_url && post.media_url.startsWith('/uploads/') && post.media_type === 'image') {
                console.log("Local upload detected for Facebook. Uploading to public temporary hosting...");
                const filePath = path.join(__dirname, '../../', post.media_url);
                const publicUrl = await uploadToCatbox(filePath);
                console.log("Public URL created for Facebook:", publicUrl);

                url = `https://graph.facebook.com/v18.0/${pageId}/photos`;
                
                const payload = {
                    message: post.caption || '',
                    access_token: account.access_token,
                    url: publicUrl
                };
                
                const { data } = await axios.post(url, payload);
                responseData = data;
            } else {
                const payload = {
                    message: post.caption || '',
                    access_token: account.access_token
                };

                // fallback for public URLs
                if (post.media_url && !post.media_url.startsWith('/uploads/')) {
                    if (post.media_type === 'image') {
                        url = `https://graph.facebook.com/v18.0/${pageId}/photos`;
                        payload.url = post.media_url; 
                    } else if (post.media_type === 'video') {
                        url = `https://graph.facebook.com/v18.0/${pageId}/videos`;
                        payload.file_url = post.media_url; 
                        payload.description = post.caption || '';
                        delete payload.message; 
                    }
                } else if (post.media_url && post.media_url.startsWith('/uploads/') && post.media_type === 'video') {
                    console.log("Local video upload detected for Facebook. Uploading to public temporary hosting...");
                    const filePath = path.join(__dirname, '../../', post.media_url);
                    const publicUrl = await uploadToCatbox(filePath);
                    url = `https://graph.facebook.com/v18.0/${pageId}/videos`;
                    payload.file_url = publicUrl;
                    payload.description = post.caption || '';
                    delete payload.message;
                } else if (post.link_url) {
                    payload.link = post.link_url;
                }

                const { data } = await axios.post(url, payload);
                responseData = data;
            }
            
            return {
                success: true,
                external_post_id: responseData.id || responseData.post_id
            };
        } catch (error) {
            console.error('Facebook publish error:', error.response?.data || error.message);
            const errMessage = error.response?.data?.error?.message || error.message;
            return {
                success: false,
                error: errMessage
            };
        }
    }
}

module.exports = new FacebookService();
