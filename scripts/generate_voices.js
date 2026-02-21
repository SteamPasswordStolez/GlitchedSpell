import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the target directory exists
const targetDir = path.join(__dirname, '../public/assets/voices');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Map of lines to generate
const voicesToGenerate = [
    { id: "1-1_police_1", text: "Scan complete. Unregistered Spell Runner identified. Halt your vehicle immediately.", voiceId: "ErXwobaYiN019PkySvjV" },
    { id: "1-1_player_1", text: "Damn it, they're already onto us.", voiceId: "VR6AewLTigWG4xSOukaG" },
    { id: "1-1_player_2", text: "Initiating Origin Protocol. Let's see how long this piece of junk can hold together!", voiceId: "VR6AewLTigWG4xSOukaG" },
    { id: "1-1_police_2", text: "Suspect is attempting to flee. Lethal force authorized.", voiceId: "ErXwobaYiN019PkySvjV" }
];

async function generateAudio(line, apiKey) {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${line.voiceId}`;
    
    const requestBody = JSON.stringify({
        text: line.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
        }
    });

    const options = {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            if (res.statusCode !== 200) {
                let errorData = '';
                res.on('data', chunk => errorData += chunk);
                res.on('end', () => {
                    console.error(`Failed to generate ${line.id}: HTTP ${res.statusCode} - ${errorData}`);
                    reject(new Error(`HTTP ${res.statusCode}`));
                });
                return;
            }

            const filePath = path.join(targetDir, `${line.id}.mp3`);
            const fileStream = fs.createWriteStream(filePath);
            
            res.pipe(fileStream);
            
            fileStream.on('finish', () => {
                console.log(`Successfully saved: ${line.id}.mp3`);
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`Error with request: ${e.message}`);
            reject(e);
        });

        req.write(requestBody);
        req.end();
    });
}

async function run() {
    console.log("Starting ElevenLabs Voice Generation...");
    
    // Check for API KEY
    const apiKey = process.argv[2] || process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.error("ERROR: No ElevenLabs API Key provided.");
        console.error("Usage: node generate_voices.js <YOUR_API_KEY>");
        process.exit(1);
    }

    for (const line of voicesToGenerate) {
        try {
            await generateAudio(line, apiKey);
        } catch (e) {
            console.error(`Failed on ${line.id}`);
        }
    }
    console.log("Generation complete!");
}

run();
