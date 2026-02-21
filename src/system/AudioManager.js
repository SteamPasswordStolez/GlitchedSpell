import * as THREE from 'three';

export class AudioManager {
    constructor(camera) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);

        this.bgm = new THREE.Audio(this.listener);
        this.audioLoader = new THREE.AudioLoader();

        this.playlist = [
            'assets/audio/bgm/track1.m4a', // The Chase
            'assets/audio/bgm/track2.m4a', // Subway Chase
            'assets/audio/bgm/track3.m4a', // Turbo Cop
            'assets/audio/bgm/track4.m4a', // Road Runner
            'assets/audio/bgm/track5.m4a'  // Replicant Hunter
        ];

        this.currentTrackIndex = -1;
        this.isLoaded = false;
        
        // Auto-play next track when one finishes
        this.bgm.onEnded = () => {
            if (this.bgm.isPlaying) this.bgm.stop();
            this.playRandomTrack();
        };
    }

    playRandomTrack() {
        if (this.playlist.length === 0) return;

        // Ensure we don't play the same track twice in a row if possible
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * this.playlist.length);
        } while (nextIndex === this.currentTrackIndex && this.playlist.length > 1);

        this.currentTrackIndex = nextIndex;
        const trackPath = this.playlist[this.currentTrackIndex];

        if (this.bgm.isPlaying) {
            this.bgm.stop();
        }

        console.log(`[AudioManager] Loading BGM: ${trackPath}`);
        this.audioLoader.load(trackPath, (buffer) => {
            this.bgm.setBuffer(buffer);
            this.bgm.setLoop(false); // We handle looping by picking a new random track
            this.bgm.setVolume(0.5); // 50% volume for BGM
            this.bgm.play();
            console.log(`[AudioManager] Now Playing BGM: ${trackPath}`);
        }, undefined, (err) => {
            console.error('[AudioManager] Error loading audio:', err);
        });
    }

    stopBGM() {
        if (this.bgm.isPlaying) {
            this.bgm.stop();
        }
    }
}
