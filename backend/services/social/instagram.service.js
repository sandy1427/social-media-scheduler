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

class InstagramService {
    constructor() {
        // We use Facebook's Client ID/Secret because Instagram Graph API operates under Meta's Facebook OAuth
        this.clientId = process.env.FACEBOOK_CLIENT_ID;
        this.clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
        this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5000/api/social/instagram/callback';
    }

    getAuthorizationUrl(state) {
        // Request pages_show_list, pages_read_engagement to get the page, and instagram_basic, instagram_content_publish to post
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&state=${state}&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,business_management`;
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
        // Fetch user's pages and the instagram_business_account attached to it
        const { data } = await axios.get('https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,profile_picture_url}', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        console.log("Facebook API Accounts Response:", JSON.stringify(data.data, null, 2));
        
        // Find a page that has an instagram_business_account
        const pageWithInsta = data.data.find(page => page.instagram_business_account != null);
        
        if (!pageWithInsta) {
            throw new Error("No connected Instagram Business account found on your Facebook pages!");
        }

        const igAccount = pageWithInsta.instagram_business_account;
        return {
            platform_user_id: igAccount.id,
            account_name: igAccount.username + ' (IG)',
            username: igAccount.username,
            profile_image_url: igAccount.profile_picture_url || '',
            page_access_token: pageWithInsta.access_token // Instagram Graph API uses the Page Access Token!
        };
    }

    async publishPost(account, post) {
        try {
            if (!account.access_token) {
                throw new Error("Instagram publishing permission is missing.");
            }

            if (account.access_token === 'mock_access_token_123') {
                return { success: true, external_post_id: 'mock_ig_post_' + Math.floor(Math.random() * 1000000) };
            }

            const igUserId = account.platform_user_id;
            
            // 1. Create Media Container
            // Instagram requires media to be published as a container first
            let containerUrl = `https://graph.facebook.com/v18.0/${igUserId}/media`;
            
            const formData = new FormData();
            formData.append('caption', post.caption || '');
            formData.append('access_token', account.access_token);
            
            if (post.media_type === 'image' && post.media_url) {
                if (post.media_url.startsWith('/uploads/')) {
                    console.log("Local upload detected for Instagram. Uploading to public temporary hosting...");
                    const filePath = path.join(__dirname, '../../', post.media_url);
                    const publicUrl = await uploadToCatbox(filePath);
                    console.log("Public URL created for Instagram:", publicUrl);
                    formData.append('image_url', publicUrl);
                } else {
                    formData.append('image_url', post.media_url);
                }
            } else if (post.media_type === 'video' && post.media_url) {
                if (post.media_url.startsWith('/uploads/')) {
                    console.log("Local upload detected for Instagram Video. Uploading to public temporary hosting...");
                    const filePath = path.join(__dirname, '../../', post.media_url);
                    const publicUrl = await uploadToCatbox(filePath);
                    console.log("Public URL created for Instagram Video:", publicUrl);
                    formData.append('video_url', publicUrl);
                } else {
                    formData.append('video_url', post.media_url);
                }
                formData.append('media_type', 'REELS');
            } else {
                throw new Error("Instagram requires an image or video to publish.");
            }

            const containerRes = await axios.post(containerUrl, formData, { headers: formData.getHeaders() });
            const creationId = containerRes.data.id;

            console.log(`Instagram container created (${creationId}). Waiting for processing...`);
            
            // Polling for container processing status
            let isFinished = false;
            let attempts = 0;
            const maxAttempts = 15; // 15 * 10 seconds = 150 seconds max
            
            while (!isFinished && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds between checks
                attempts++;
                
                try {
                    const statusRes = await axios.get(`https://graph.facebook.com/v18.0/${creationId}`, {
                        params: {
                            fields: 'status_code',
                            access_token: account.access_token
                        }
                    });
                    
                    const statusCode = statusRes.data.status_code;
                    console.log(`Container status check ${attempts}/${maxAttempts}: ${statusCode}`);
                    
                    if (statusCode === 'FINISHED') {
                        isFinished = true;
                    } else if (statusCode === 'ERROR') {
                        throw new Error('Instagram processing failed with ERROR status.');
                    } else if (statusCode === 'EXPIRED') {
                        throw new Error('Instagram container EXPIRED before publishing.');
                    }
                } catch (statusError) {
                    if (statusError.message.includes('failed with ERROR') || statusError.message.includes('EXPIRED')) {
                        throw statusError;
                    }
                    console.error('Error checking container status:', statusError.response?.data || statusError.message);
                }
            }
            
            if (!isFinished) {
                throw new Error('Instagram processing timed out after waiting.');
            }

            // 2. Publish Media Container
            const publishRes = await axios.post(`https://graph.facebook.com/v18.0/${igUserId}/media_publish`, {
                creation_id: creationId,
                access_token: account.access_token
            });

            return { success: true, external_post_id: publishRes.data.id };
        } catch (error) {
            console.error('Instagram publish error:', error.response?.data || error.message);
            const errMessage = error.response?.data?.error?.message || error.message;
            return { success: false, error: errMessage };
        }
    }
}

module.exports = new InstagramService();
