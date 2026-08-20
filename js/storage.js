// Ortak veri ynetimi (localStorage + Firebase tabanl)

const STORAGE_KEY = 'aquarium_data';
const CURRENT_USER_KEY = 'current_user';
const FIREBASE_PATH = 'gameState';

const DEFAULT_DATA = {
    version: 1, // Eski test verilerini temizlemek iin srm kontrol
    money: 100, // Balang paras
    isHardMode: false,
    playerLevel: 1,
    playerXp: 0,
    tankLevel: 1, // Kapasite: 5
    waterQuality: 100,
    creatures: [], // Akvaryumdaki canllar
    activeFoods: [], // Akvaryumda yzen yemler
    decorations: [], // Akvaryumdaki dekorasyonlar
    inventory: {
        shared: [
            { id: 'temel_pul_yem', quantity: 10 } // Balang eyas
        ],
        ece: [],
        orkun: []
    },
    logs: [],
    collection: [] // Kefedilen trler vb.
};

const Storage = {
    _isFirebaseInitialized: false,
    
    initFirebase: function() {
        if(this._isFirebaseInitialized) return;
        this._isFirebaseInitialized = true;
        
        if (window.firebaseDB) {
            const dbRef = window.firebaseDB.ref(FIREBASE_PATH);
            
            // Initial load
            dbRef.once('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                }
            });

            // Listen for changes
            dbRef.on('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    data.creatures = data.creatures || [];
                    data.activeFoods = data.activeFoods || [];
                    data.decorations = data.decorations || [];
                    data.collection = data.collection || [];
                    data.logs = data.logs || [];
                    
                    const localData = localStorage.getItem(STORAGE_KEY);
                    if (JSON.stringify(data) !== localData) {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                        // UI gncelle
                        if (typeof updateUI === 'function' && window.activeGameData) {
                            // Canl balk listesini kopyala
                            const oldCreatures = window.activeGameData.creatures;
                            window.activeGameData = data;
                            
                            // Akvaryum motorundaki balklar gncelle
                            if (window.aquarium) {
                                // Sadece yeni balklar ekle
                                if (data.creatures.length > oldCreatures.length) {
                                    window.aquarium.setCreatures(data.creatures);
                                }
                            }
                            updateUI(data);
                        } 
                        if (typeof renderInventory === 'function') {
                            renderInventory();
                        }
                        if (typeof renderMarketItems === 'function') {
                            renderMarketItems();
                        }
                        if (typeof renderCollection === 'function') {
                            renderCollection();
                        }
                    }
                }
            });
        }
    },

    getData: function() {
        if (window.firebase) this.initFirebase();
        
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            this.saveData(DEFAULT_DATA);
            return DEFAULT_DATA;
        }
        
        let parsed = JSON.parse(data);
        if (parsed.version !== 1) {
            this.saveData(DEFAULT_DATA);
            return DEFAULT_DATA;
        }
        
        // Firebase bostaki array'leri sildigi icin guvence altina alalim
        parsed.creatures = parsed.creatures || [];
        parsed.activeFoods = parsed.activeFoods || [];
        parsed.decorations = parsed.decorations || [];
        parsed.collection = parsed.collection || [];
        parsed.logs = parsed.logs || [];
        
        return parsed;
    },

    saveData: function(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        if (window.firebaseDB) {
            window.firebaseDB.ref(FIREBASE_PATH).set(data);
        }
    },

    getCurrentUser: function() {
        return localStorage.getItem(CURRENT_USER_KEY);
    },

    setCurrentUser: function(user) {
        if(user !== 'ece' && user !== 'orkun') return;
        localStorage.setItem(CURRENT_USER_KEY, user);
    },

    resetGame: function() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CURRENT_USER_KEY);
        this.saveData(DEFAULT_DATA);
    },

    addLog: function(message) {
        const data = this.getData();
        const user = this.getCurrentUser() || 'Sistem';
        const now = new Date();
        data.logs.unshift({
            time: now.toISOString(),
            user: user,
            message: message
        });
        
        // Son 50 logu tutalm
        if (data.logs.length > 50) {
            data.logs = data.logs.slice(0, 50);
        }
        
        this.saveData(data);
    },

    // XP calculation: 100 * (1.5 ^ (level - 1))
    getXpRequirement: function(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },

    addXP: function(amount) {
        const data = this.getData();
        if (data.playerLevel === undefined) data.playerLevel = 1;
        if (data.playerXp === undefined) data.playerXp = 0;

        data.playerXp += amount;
        let req = this.getXpRequirement(data.playerLevel);
        
        let leveledUp = false;
        while (data.playerXp >= req) {
            data.playerXp -= req;
            data.playerLevel++;
            leveledUp = true;
            req = this.getXpRequirement(data.playerLevel);
        }

        this.saveData(data);
        
        if (leveledUp) {
            window.showNotification('🎉 Tebrikler! Seviye ' + data.playerLevel + ' oldunuz! Yeni balıkların kilidi açıldı.');
            if (window.updateTopBar) window.updateTopBar();
            if (window.renderMarketItems) window.renderMarketItems(); // Refresh market locks
        } else {
            if (window.updateTopBar) window.updateTopBar();
        }
    },

    exportData: function() {
        try {
            const dataStr = localStorage.getItem(STORAGE_KEY);
            if (!dataStr) return null;
            return btoa(unescape(encodeURIComponent(dataStr)));
        } catch (e) {
            return null;
        }
    },

    importData: function(base64Str) {
        try {
            const decodedStr = decodeURIComponent(escape(atob(base64Str)));
            const data = JSON.parse(decodedStr);
            if (data && typeof data === 'object') {
                this.saveData(data);
                return true;
            }
        } catch (e) {
            console.error("e aktarma hatas", e);
        }
        return false;
    }
};

window.showNotification = function(msg) {
    let container = document.getElementById('notifications-area');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-area';
        document.body.appendChild(container);
    }
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerText = msg;
    container.appendChild(notif);

    setTimeout(() => {
        notif.remove();
    }, 5000);
};