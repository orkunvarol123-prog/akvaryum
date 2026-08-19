const AudioManager = {
    playlist: [
        'assets/audio/music1.mp3',
        'assets/audio/music2.mp3',
        'assets/audio/music3.mp3'
    ],
    sfxFiles: {
        bubble: 'assets/audio/bubble.mp3',
        coin: 'assets/audio/coin.mp3',
        feed: 'assets/audio/feed.mp3',
        error: 'assets/audio/error.mp3'
    },
    
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.3,
    
    currentBgAudio: null,
    
    init: function() {
        // Ayarları yükle
        const savedMusic = localStorage.getItem('settings_music');
        const savedSfx = localStorage.getItem('settings_sfx');
        
        if (savedMusic !== null) this.musicEnabled = (savedMusic === 'true');
        if (savedSfx !== null) this.sfxEnabled = (savedSfx === 'true');
        
        // Müzik çalmaya başla
        if (this.musicEnabled) {
            this.playNextMusic();
        }
    },
    
    toggleMusic: function(state) {
        this.musicEnabled = state;
        localStorage.setItem('settings_music', state);
        
        if (state) {
            if (!this.currentBgAudio || this.currentBgAudio.paused) {
                this.playNextMusic();
            }
        } else {
            if (this.currentBgAudio) {
                this.currentBgAudio.pause();
            }
        }
    },
    
    toggleSfx: function(state) {
        this.sfxEnabled = state;
        localStorage.setItem('settings_sfx', state);
    },
    
    playNextMusic: function() {
        if (!this.musicEnabled) return;
        
        const randomIndex = Math.floor(Math.random() * this.playlist.length);
        const track = this.playlist[randomIndex];
        
        if (this.currentBgAudio) {
            this.currentBgAudio.pause();
        }
        
        this.currentBgAudio = new Audio(track);
        this.currentBgAudio.volume = this.musicVolume;
        
        this.currentBgAudio.play().catch(e => {
            console.log("Tarayıcı otomatik ses çalmayı engelledi. İlk tıklamada başlayacak.", e);
            const startMusicOnInteract = () => {
                if(this.musicEnabled && this.currentBgAudio.paused) {
                    this.currentBgAudio.play().catch(err => console.log(err));
                }
                document.removeEventListener('click', startMusicOnInteract);
            };
            document.addEventListener('click', startMusicOnInteract);
        });
        
        this.currentBgAudio.addEventListener('ended', () => {
            this.playNextMusic();
        });
    },
    
    playSfx: function(type) {
        if (!this.sfxEnabled) return;
        
        const file = this.sfxFiles[type];
        if (file) {
            const audio = new Audio(file);
            audio.volume = 0.5;
            audio.play().catch(e => console.log("SFX play hatası:", e));
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AudioManager.init();
});
