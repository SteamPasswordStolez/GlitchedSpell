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
    { id: "1-2_player_1", text: "Thought we lost them, but they stick like ghosts. Worse than the stench of the sewers.", voiceId: "VR6AewLTigWG4xSOukaG" },
    { id: "sys_warning_1", text: "Massive blockade detected ahead. Alternative route unavailable.", voiceId: "21m00Tcm4TlvDq8ikWAM" },
    { id: "1-2_player_2", text: "Not planning to detour anyway. We're blasting straight through. Hold on tight!", voiceId: "VR6AewLTigWG4xSOukaG" },
    { id: "1-2_police_1", text: "Target has entered the acceleration zone. Deploying capture nets.", voiceId: "ErXwobaYiN019PkySvjV" },
    { id: "1-3_police_1", text: "Attention all units. Suspect has entered Core Sector 3. Destruction authorized.", voiceId: "ErXwobaYiN019PkySvjV" },
    { id: "1-3_player_1", text: "Finally showing their true colors. Not far from the core now. Nitro at maximum output!", voiceId: "VR6AewLTigWG4xSOukaG" },
    { id: "sys_warning_2", text: "Rear armor integrity at 40 percent. Multiple high-speed bogies approaching.", voiceId: "21m00Tcm4TlvDq8ikWAM" }
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
