const axios = require('axios');

class YouTubeService {
    constructor() {
        this.clientId = process.env.YOUTUBE_CLIENT_ID;
        this.clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
        this.redirectUri = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5000/api/social/youtube/callback';
    }

    getAuthorizationUrl(state) {
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload%20https://www.googleapis.com/auth/youtube.readonly&access_type=offline&state=${state}`;
    }

    async handleCallback(code) {
        const params = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: this.redirectUri
        });

        const { data } = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return data;
    }

    async getAccountInfo(accessToken) {
        const { data } = await axios.get('https://youtube.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const channel = data.items[0];
        return {
            platform_user_id: channel.id,
            account_name: channel.snippet.title,
            username: channel.snippet.customUrl || '',
            profile_image_url: channel.snippet.thumbnails?.default?.url
        };
    }

    async publishPost(account, post) {
        try {
            if (!account.access_token) {
                throw new Error("YouTube publishing permission is missing.");
            }

            if (!post.media_url) {
                return { success: false, error: "Media is required for publishing." };
            }

            const FormData = require('form-data');
            const fs = require('fs');
            const path = require('path');
            
            // Construct absolute path to the uploaded file
            let filePath = path.join(__dirname, '../../', post.media_url);
            
            if (!fs.existsSync(filePath)) {
                return { success: false, error: "Media file not found on server." };
            }

            if (post.media_type === 'image') {
                console.log("Converting image to video for YouTube...");
                const ffmpeg = require('fluent-ffmpeg');
                const ffmpegPath = require('ffmpeg-static');
                ffmpeg.setFfmpegPath(ffmpegPath);
                
                const outputFilename = `yt_converted_${Date.now()}.mp4`;
                const outputFilePath = path.join(__dirname, '../../uploads', outputFilename);
                
                await new Promise((resolve, reject) => {
                    ffmpeg()
                        .input(filePath)
                        .loop(1)
                        .outputOptions([
                            '-c:v libx264',
                            '-preset ultrafast',
                            '-tune stillimage',
                            '-pix_fmt yuv420p',
                            '-t 3',
                            '-movflags +faststart'
                        ])
                        .save(outputFilePath)
                        .on('end', resolve)
                        .on('error', reject);
                });
                
                filePath = outputFilePath; // Use the new video file for upload
            } else if (post.media_type !== 'video') {
                return { success: false, error: "Unsupported media format for YouTube." };
            }

            const metadata = {
                snippet: {
                    title: post.caption ? post.caption.substring(0, 100) : 'Uploaded from SocialSync',
                    description: post.caption || '',
                },
                status: {
                    privacyStatus: 'public'
                }
            };

            const form = new FormData();
            form.append('metadata', JSON.stringify(metadata), { contentType: 'application/json' });
            form.append('file', fs.createReadStream(filePath));

            const { data } = await axios.post('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', form, {
                headers: { 
                    Authorization: `Bearer ${account.access_token}`,
                    ...form.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 0 // Wait indefinitely for large uploads
            });

            return {
                success: true,
                external_post_id: data.id
            };
        } catch (error) {
            console.error('YouTube publish error:', error.response?.data || error.message);
            const errMessage = error.response?.data?.error?.message || error.message;
            return {
                success: false,
                error: errMessage
            };
        }
    }
}

module.exports = new YouTubeService();
