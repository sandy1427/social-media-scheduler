const axios = require('axios');

class ThreadsService {
    constructor() {
        this.clientId = process.env.THREADS_CLIENT_ID;
        this.clientSecret = process.env.THREADS_CLIENT_SECRET;
        this.redirectUri = process.env.THREADS_REDIRECT_URI || 'http://localhost:5000/api/social/threads/callback';
    }

    getAuthorizationUrl(state) {
        return `https://threads.net/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=threads_basic,threads_content_publish&response_type=code&state=${state}`;
    }

    async handleCallback(code) {
        const params = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: this.redirectUri,
            code
        });

        const { data } = await axios.post('https://graph.threads.net/oauth/access_token', params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return data;
    }

    async getAccountInfo(accessToken) {
        const { data } = await axios.get('https://graph.threads.net/me?fields=id,username,name,threads_profile_picture_url', {
            params: { access_token: accessToken }
        });
        return {
            platform_user_id: data.id,
            account_name: data.name,
            username: data.username,
            profile_image_url: data.threads_profile_picture_url
        };
    }

    async publishPost(account, post) {
        try {
            if (!account.access_token) {
                throw new Error("Threads publishing permission is missing.");
            }

            const userId = account.platform_user_id;
            
            // 1. Create Media Container
            const containerPayload = {
                text: post.caption || '',
                access_token: account.access_token,
                media_type: 'TEXT'
            };

            let publicMediaUrl = post.media_url;

            // Meta Graph API requires public URLs for media, but localtunnel blocks bots with a warning page.
            if (publicMediaUrl && (publicMediaUrl.startsWith('/uploads') || publicMediaUrl.includes('localhost') || publicMediaUrl.includes('loca.lt') || publicMediaUrl.includes('127.0.0.1'))) {
                console.log('Local/Localtunnel upload detected for Threads. Uploading to public temporary hosting...');
                const FormData = require('form-data');
                const fs = require('fs');
                const path = require('path');
                
                // Extract filename from URL (e.g., http://localhost:5000/uploads/file.mp4 -> file.mp4)
                const filename = publicMediaUrl.split('/').pop();
                const localFilePath = path.join(__dirname, '..', '..', 'uploads', filename);

                if (fs.existsSync(localFilePath)) {
                    const form = new FormData();
                    form.append('reqtype', 'fileupload');
                    form.append('fileToUpload', fs.createReadStream(localFilePath));

                    try {
                        const uploadRes = await axios.post('https://catbox.moe/user/api.php', form, {
                            headers: form.getHeaders()
                        });
                        publicMediaUrl = uploadRes.data;
                        console.log(`Public URL created for Threads: ${publicMediaUrl}`);
                    } catch (uploadErr) {
                        console.error('Failed to upload to catbox:', uploadErr.message);
                    }
                }
            }

            if (post.media_type === 'image' && publicMediaUrl) {
                containerPayload.media_type = 'IMAGE';
                containerPayload.image_url = publicMediaUrl;
            } else if (post.media_type === 'video' && publicMediaUrl) {
                containerPayload.media_type = 'VIDEO';
                containerPayload.video_url = publicMediaUrl;
            }

            const containerRes = await axios.post(`https://graph.threads.net/v1.0/${userId}/threads`, containerPayload);
            const creationId = containerRes.data.id;

            // Wait for video/image processing
            if (publicMediaUrl) {
                console.log(`Threads container created (${creationId}). Waiting for processing...`);
                
                let isFinished = false;
                let attempts = 0;
                const maxAttempts = 15; // 15 * 10s = 150s max
                
                while (!isFinished && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    attempts++;
                    
                    try {
                        const statusRes = await axios.get(`https://graph.threads.net/v1.0/${creationId}`, {
                            params: {
                                fields: 'status',
                                access_token: account.access_token
                            }
                        });
                        
                        const statusCode = statusRes.data.status;
                        console.log(`Threads Container status check ${attempts}/${maxAttempts}: ${statusCode}`);
                        
                        if (statusCode === 'FINISHED') {
                            isFinished = true;
                        } else if (statusCode === 'ERROR') {
                            throw new Error('Threads processing failed with ERROR status.');
                        } else if (statusCode === 'EXPIRED') {
                            throw new Error('Threads container EXPIRED before publishing.');
                        }
                    } catch (statusError) {
                        if (statusError.message.includes('failed with ERROR') || statusError.message.includes('EXPIRED')) {
                            throw statusError;
                        }
                        console.error('Error checking Threads container status:', statusError.response?.data || statusError.message);
                    }
                }
                
                if (!isFinished) {
                    throw new Error('Threads processing timed out after waiting.');
                }
            }

            // 2. Publish Media Container
            const publishRes = await axios.post(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
                creation_id: creationId,
                access_token: account.access_token
            });

            return {
                success: true,
                external_post_id: publishRes.data.id
            };
        } catch (error) {
            console.error('Threads publish error:', error.response?.data || error.message);
            const errMessage = error.response?.data?.error?.message || error.message;
            return {
                success: false,
                error: errMessage
            };
        }
    }
}

module.exports = new ThreadsService();
