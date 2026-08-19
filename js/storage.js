// Ortak veri yönetimi (localStorage tabanlı)

const STORAGE_KEY = 'aquarium_data';
const CURRENT_USER_KEY = 'current_user';

const DEFAULT_DATA = {
    version: 1, // Eski test verilerini temizlemek için sürüm kontrolü
    money: 100, // Başlangıç parası
    isHardMode: false,
    playerLevel: 1,
    playerXp: 0,
    tankLevel: 1, // Kapasite: 5
    waterQuality: 100,
    creatures: [], // Akvaryumdaki canlılar
    activeFoods: [], // Akvaryumda yüzen yemler
    decorations: [], // Akvaryumdaki dekorasyonlar
    inventory: {
        shared: [
            { id: 'temel_pul_yem', quantity: 10 } // Başlangıç eşyası
        ],
        ece: [],
        orkun: []
    },
    logs: [],
    collection: [] // Keşfedilen türler vb.
};

const Storage = {
    getData: function() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            this.saveData(DEFAULT_DATA);
            return DEFAULT_DATA;
        }
        
        let parsed = JSON.parse(data);
        
        // Eğer eski bir test verisiyse (versiyon 1 değilse), her şeyi sıfırla
        if (parsed.version !== 1) {
            this.saveData(DEFAULT_DATA);
            return DEFAULT_DATA;
        }
        
        return parsed;
    },

    saveData: function(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
        
        // Son 50 logu tutalım
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
            window.showNotification(`🎉 Tebrikler! Seviye ${data.playerLevel} oldunuz! Yeni balıkların kilidi açıldı.`);
            // Update UI immediately if function exists
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
            console.error("Dışa aktarma hatası", e);
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
            console.error("İçe aktarma hatası", e);
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
