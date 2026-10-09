const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

ffmpeg.setFfmpegPath(ffmpegPath);

// Helper: download file from URL
const downloadFile = (url, dest) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
    });
});

const createVideoWithMusic = async (req, res) => {
    const mediaPath = req.file?.path;
    const mediaType = req.file?.mimetype;
    const { musicUrl, trackName, artistName, artworkUrl } = req.body;

    if (!mediaPath || !musicUrl) {
        return res.status(400).json({ message: 'Media and music URL required.' });
    }

    const isVideo = mediaType.startsWith('video/');

    const uploadsDir = path.join(__dirname, '../uploads');
    const audioPath = path.join(uploadsDir, `audio_${Date.now()}.m4a`);
    const outputFilename = `combined_${Date.now()}.mp4`;
    const outputPath = path.join(uploadsDir, outputFilename);

    try {
        // Download the iTunes 30-sec preview audio
        await downloadFile(musicUrl, audioPath);

        // Merge media + audio using ffmpeg
        await new Promise((resolve, reject) => {
            let command = ffmpeg().input(mediaPath);

            if (!isVideo) {
                // If image, loop it
                command = command.inputOptions(['-loop 1']);
            }

            command = command.input(audioPath);

            if (!isVideo) {
                // Image + Audio
                command = command.outputOptions([
                    '-c:v libx264',
                    '-preset ultrafast',
                    '-tune stillimage',
                    '-c:a aac',
                    '-b:a 192k',
                    '-pix_fmt yuv420p',
                    '-shortest',                    // stop when audio ends (~30s)
                    '-t 30',                        // Hard limit to 30s to prevent infinite loop
                    '-movflags +faststart'
                ]);
            } else {
                // Video + Audio (Replace original audio with new music)
                command = command.outputOptions([
                    '-c:v copy',                    // copy original video stream
                    '-c:a aac',                     // encode new audio
                    '-map 0:v:0',                   // use video from first input
                    '-map 1:a:0',                   // use audio from second input (the music)
                    '-shortest',                    // stop at whichever is shorter
                    '-movflags +faststart'
                ]);
            }

            command
                .save(outputPath)
                .on('end', resolve)
                .on('error', reject);
        });

        // Clean up temp files
        fs.unlink(audioPath, () => {});
        // Optionally delete the original uploaded image/video to save space:
        // fs.unlink(mediaPath, () => {});

        res.json({ media_url: `/uploads/${outputFilename}`, media_type: 'video', message: 'Media combined successfully!' });
    } catch (error) {
        console.error('FFmpeg error:', error);
        fs.unlink(audioPath, () => {});
        res.status(500).json({ message: 'Media combination failed.', error: error.message });
    }
};

module.exports = { createVideoWithMusic };
