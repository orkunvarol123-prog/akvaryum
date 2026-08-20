document.addEventListener('DOMContentLoaded', () => {
    try {
        // Game Loading Screen Logic
        const loadingOverlay = document.getElementById('game-loading-overlay');
        const loadingFill = document.getElementById('game-loading-fill');
        if (loadingOverlay && loadingFill) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('noload') === '1') {
                loadingOverlay.remove();
            } else {
                let progress = 0;
            function loadStep() {
                progress += Math.random() * 15 + 5;
                if (progress >= 100) {
                    progress = 100;
                    loadingFill.style.width = `${progress}%`;
                    setTimeout(() => {
                        loadingOverlay.style.opacity = '0';
                        loadingOverlay.style.transition = 'opacity 0.5s ease';
                        setTimeout(() => loadingOverlay.remove(), 500);
                    }, 500);
                } else {
                    loadingFill.style.width = `${progress}%`;
                    setTimeout(loadStep, Math.random() * 500 + 200);
                }
            }
            setTimeout(loadStep, 300);
            }
        }

        // Check if logged in
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

    // Initialize UI
    document.getElementById('current-user-name').innerText = currentUser === 'ece' ? 'Ece' : 'Orkun';
    document.getElementById('current-user-avatar').innerText = currentUser === 'ece' ? '👩🏻' : '🧑🏻';

    // Hide Loading Screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.classList.add('hidden');

    // Setup Aquarium
    const aquarium = new AquariumRenderer('aquarium-canvas');
    let gameData = Storage.getData();
    if (gameData.playerLevel === undefined) gameData.playerLevel = 1;
    if (gameData.playerXp === undefined) gameData.playerXp = 0;
    
    window.activeGameData = gameData; // Modal butonları için global referans
    window.aquarium = aquarium; // Global referans
    
    // Test block removed
    if (!gameData.activeFoods) gameData.activeFoods = [];

    // Dirt Canvas Setup (Mini oyun ve görsel katman)
    const dirtCanvas = document.getElementById('dirt-canvas');
    dirtCanvas.style.opacity = '0'; // Sayfa yüklenirken anlık kirlilik parlamasını engellemek için
    const dirtCtx = dirtCanvas.getContext('2d', { willReadFrequently: true });
    window.isCleaningMode = false;
    let isScrubbing = false;
    let lastX = 0;
    let lastY = 0;

    function resizeDirtCanvas() {
        const container = dirtCanvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        dirtCanvas.width = container.clientWidth * dpr;
        dirtCanvas.height = container.clientHeight * dpr;
        dirtCanvas.style.width = container.clientWidth + 'px';
        dirtCanvas.style.height = container.clientHeight + 'px';
        dirtCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (window.isCleaningMode) window.fillDirtGlobal();
    }
    
    window.addEventListener('resize', resizeDirtCanvas);
    window.fillDirtGlobal = function() {
        dirtCtx.clearRect(0, 0, dirtCanvas.width, dirtCanvas.height);
        dirtCtx.globalCompositeOperation = 'source-over';
        
        // Base hafif saydam yeşil
        dirtCtx.fillStyle = 'rgba(43, 65, 34, 0.6)'; 
        dirtCtx.fillRect(0, 0, dirtCanvas.width, dirtCanvas.height);
        
        // Yosun birikintileri (köşeler ve belirli alanlar)
        const spots = [
            { x: dirtCanvas.width * 0.1, y: dirtCanvas.height * 0.9, r: dirtCanvas.height * 0.5 },
            { x: dirtCanvas.width * 0.9, y: dirtCanvas.height * 0.8, r: dirtCanvas.height * 0.6 },
            { x: dirtCanvas.width * 0.5, y: dirtCanvas.height * 0.1, r: dirtCanvas.height * 0.4 },
            { x: dirtCanvas.width * 0.1, y: dirtCanvas.height * 0.1, r: dirtCanvas.height * 0.4 }
        ];

        spots.forEach(spot => {
            const gradient = dirtCtx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.r);
            gradient.addColorStop(0, 'rgba(20, 40, 15, 0.9)');
            gradient.addColorStop(1, 'rgba(20, 40, 15, 0)');
            dirtCtx.fillStyle = gradient;
            dirtCtx.fillRect(0, 0, dirtCanvas.width, dirtCanvas.height);
        });
        
        dirtCanvas.dataset.isDirty = 'true';
    };
    
    resizeDirtCanvas(); // Init
    window.fillDirtGlobal(); // Oyuna girerken ilk dokuyu çiz

    // Start Render Loop
    aquarium.setCreatures(gameData.creatures);
    aquarium.setFoods(gameData.activeFoods);
    aquarium.render();
    
    updateUI(gameData); // İlk yüklemede arayüzü ve kirlilik opaklığını hemen ayarla

    // Pending Feed Check (Envanterden yem kullanıldıysa)
    if (gameData.pendingFeedItem) {
        const feedId = gameData.pendingFeedItem;
        gameData.pendingFeedItem = null;
        Storage.saveData(gameData);
        
        const config = CONFIG.FOODS[feedId];
        if (config) {
            aquarium.setFeedMode(true, config);
            document.getElementById('btn-cancel-feed').classList.remove('hidden');
            document.getElementById('btn-feed').classList.add('hidden');
            showNotification(`Yem seçildi: ${config.name}. Atmak için akvaryuma tıkla!`);
        }
    }

    // Game Loop (Logic updates every second)
    setInterval(() => {
        updateGameLogic(gameData);
        updateUI(gameData);
        aquarium.setCreatures(gameData.creatures); // Sync visual representations
        aquarium.setDecorations(gameData.decorations); // Sync decorations
        gameData.activeFoods = aquarium.activeFoods; // Sync foods back to data
    }, 1000); // Update every 1 second (fast for testing, can be tuned)

    // Creature Click (Modal)
    aquarium.onCreatureClick = (creature) => {
        openCreatureModal(creature, gameData);
    };

    // Decoration Click (Modal)
    aquarium.onDecorationClick = (decoration) => {
        openDecorationModal(decoration, gameData);
    };

    // Yem Seçim ve Atma İşlemleri
    const feedMenu = document.getElementById('feed-menu');
    const btnFeed = document.getElementById('btn-feed');
    const btnCancelFeed = document.getElementById('btn-cancel-feed');

    btnFeed.addEventListener('click', () => {
        // Envanterdeki yemleri bul
        const foods = (gameData.inventory.shared || []).filter(i => i && CONFIG.FOODS[i.id]);
        if (foods.length === 0) {
            showNotification("Envanterde hiç yem yok! Marketten al.");
            return;
        }

        // Menüyü doldur
        feedMenu.innerHTML = '';
        foods.forEach(f => {
            const config = CONFIG.FOODS[f.id];
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.innerHTML = `${config.name} (${f.quantity})`;
            btn.style.fontSize = '0.9rem';
            btn.addEventListener('click', () => {
                aquarium.setFeedMode(true, config);
                feedMenu.classList.add('hidden');
                showNotification(`Yem seçildi: ${config.name}. Atmak için akvaryuma tıkla!`);
            });
            feedMenu.appendChild(btn);
        });

        feedMenu.classList.remove('hidden');
        btnFeed.classList.add('hidden');
        btnCancelFeed.classList.remove('hidden');
    });

    btnCancelFeed.addEventListener('click', () => {
        aquarium.setFeedMode(false, null);
        feedMenu.classList.add('hidden');
        btnCancelFeed.classList.add('hidden');
        btnFeed.classList.remove('hidden');
        showNotification("Yem atma iptal edildi.");
    });

    // Yem canvas'a düştüğünde envanteri güncelle ve yemi oluştur
    aquarium.onFoodDrop = (pctX, pctY, foodConfig) => {
        const foodId = foodConfig.id;
        let sharedInv = gameData.inventory.shared || [];
        const itemIndex = sharedInv.findIndex(i => i && i.id === foodId);
        
        if (itemIndex !== -1) {
            const item = sharedInv[itemIndex];
            
            // Yemi oluştur
            aquarium.addFood(pctX, pctY, foodConfig);
            
            // Envanterden düş
            if (item.quantity >= foodConfig.portions) {
                item.quantity -= foodConfig.portions;
                if (item.quantity <= 0) {
                    sharedInv[itemIndex] = null; // Eşya bitti
                    aquarium.setFeedMode(false, null);
                    btnCancelFeed.classList.add('hidden');
                    btnFeed.classList.remove('hidden');
                    showNotification(`Elindeki ${foodConfig.name} bitti!`);
                }
                Storage.saveData(gameData);
                return true;
            } else if (item.quantity > 0) {
                item.quantity = 0;
                sharedInv[itemIndex] = null; // Eşya bitti
                Storage.saveData(gameData);
                
                aquarium.setFeedMode(false, null);
                btnCancelFeed.classList.add('hidden');
                btnFeed.classList.remove('hidden');
                showNotification(`Son kalan yemleri attın!`);
                return true;
            }
        }
        
        showNotification("Bu yemden kalmadı!");
        aquarium.setFeedMode(false, null);
        btnCancelFeed.classList.add('hidden');
        btnFeed.classList.remove('hidden');
        return false;
    };

    document.getElementById('btn-clean').addEventListener('click', () => {
        // Su kalitesi 50'den büyükse temizlemeye izin verme
        if (gameData.waterQuality > 50) {
            showNotification("Şuan akvaryum temiz. Biraz daha kirlenmesini bekleyin.");
            return;
        }
        
        // Temizleme mini oyununu başlat
        window.isCleaningMode = true;
        dirtCanvas.style.opacity = '1'; // Tamamen görünür yap
        dirtCanvas.style.pointerEvents = 'auto'; // Tıklamaları al
        dirtCanvas.style.cursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><text y='30' font-size='30'>🧽</text></svg>") 20 20, auto`;
        
        window.fillDirtGlobal(); // Camı kirlet
        showNotification("Sünger ile camı silerek temizle! 🧽");
    });

    function getMousePos(e) {
        const rect = dirtCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function eraseAt(x, y) {
        dirtCtx.globalCompositeOperation = 'destination-out';
        dirtCtx.lineWidth = 160;
        dirtCtx.lineCap = 'round';
        dirtCtx.lineJoin = 'round';
        dirtCtx.beginPath();
        dirtCtx.moveTo(lastX, lastY);
        dirtCtx.lineTo(x, y);
        dirtCtx.stroke();
        lastX = x;
        lastY = y;
    }

    let mouseMoveCount = 0;
    
    const startScrub = (e) => {
        if (!window.isCleaningMode) return;
        isScrubbing = true;
        e.preventDefault(); // Sürükleme (drag) engelleyici
        const pos = getMousePos(e);
        lastX = pos.x;
        lastY = pos.y;
        eraseAt(pos.x, pos.y);
    };

    const moveScrub = (e) => {
        if (!window.isCleaningMode || !isScrubbing) return;
        e.preventDefault();
        const pos = getMousePos(e);
        eraseAt(pos.x, pos.y);
        
        mouseMoveCount++;
        if (mouseMoveCount % 10 === 0) {
            checkCleanProgress();
        }
    };

    const stopScrub = () => {
        if (window.isCleaningMode && isScrubbing) {
            isScrubbing = false;
            checkCleanProgress();
        }
    };

    dirtCanvas.addEventListener('mousedown', startScrub);
    dirtCanvas.addEventListener('mousemove', moveScrub);
    window.addEventListener('mouseup', stopScrub);
    
    // Mobil Dokunmatik Desteği
    dirtCanvas.addEventListener('touchstart', startScrub, {passive: false});
    dirtCanvas.addEventListener('touchmove', moveScrub, {passive: false});
    window.addEventListener('touchend', stopScrub);

    function checkCleanProgress() {
        const imgData = dirtCtx.getImageData(0, 0, dirtCanvas.width, dirtCanvas.height);
        const dataArray = imgData.data;
        let transparentPixels = 0;
        const totalPixels = dataArray.length / 4;
        
        // Çok daha hızlı kontrol: dataArray[i] (Alpha kanalı) 10'dan küçükse silinmiş say
        for (let i = 3; i < dataArray.length; i += 4) {
            if (dataArray[i] < 10) transparentPixels++;
        }
        
        const cleanPercentage = (transparentPixels / totalPixels) * 100;
        if (cleanPercentage > 95) {
            window.isCleaningMode = false;
            dirtCanvas.style.pointerEvents = 'none';
            dirtCanvas.style.cursor = 'default';
            
            // Kalan kirleri tamamen temizle
            dirtCtx.clearRect(0, 0, dirtCanvas.width, dirtCanvas.height);
            dirtCanvas.dataset.isDirty = '';
            
            gameData.waterQuality = 100;
            Storage.saveData(gameData);
            updateUI(gameData);
            showNotification("Akvaryum pırıl pırıl oldu! ✨");
            Storage.addLog(`${currentUser} akvaryumu temizledi.`);
        }
    }

    // Close Modal
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('creature-modal').classList.add('hidden');
    });

    // Navigation
    document.getElementById('btn-market').addEventListener('click', () => {
        gameData.activeFoods = aquarium.activeFoods;
        Storage.saveData(gameData);
        window.location.href = 'market.html';
    });

    document.getElementById('btn-inventory').addEventListener('click', () => {
        gameData.activeFoods = aquarium.activeFoods;
        Storage.saveData(gameData);
        window.location.href = 'inventory.html';
    });

    document.getElementById('btn-collection').addEventListener('click', () => {
        gameData.activeFoods = aquarium.activeFoods;
        Storage.saveData(gameData);
        window.openCollection();
    });

    // Settings Menu Logic
    document.getElementById('btn-settings').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.remove('hidden');
        
        // Update button states based on AudioManager
        const btnMusic = document.getElementById('toggle-music-btn');
        const btnSfx = document.getElementById('toggle-sfx-btn');
        
        btnMusic.innerText = AudioManager.musicEnabled ? 'Açık' : 'Kapalı';
        btnMusic.style.background = AudioManager.musicEnabled ? 'var(--success)' : 'var(--danger)';
        
        btnSfx.innerText = AudioManager.sfxEnabled ? 'Açık' : 'Kapalı';
        btnSfx.style.background = AudioManager.sfxEnabled ? 'var(--success)' : 'var(--danger)';
    });

    document.getElementById('toggle-music-btn').addEventListener('click', (e) => {
        const newState = !AudioManager.musicEnabled;
        AudioManager.toggleMusic(newState);
        e.target.innerText = newState ? 'Açık' : 'Kapalı';
        e.target.style.background = newState ? 'var(--success)' : 'var(--danger)';
    });

    document.getElementById('toggle-sfx-btn').addEventListener('click', (e) => {
        const newState = !AudioManager.sfxEnabled;
        AudioManager.toggleSfx(newState);
        e.target.innerText = newState ? 'Açık' : 'Kapalı';
        e.target.style.background = newState ? 'var(--success)' : 'var(--danger)';
    });

    document.getElementById('btn-how-to-play').addEventListener('click', () => {
        document.getElementById('how-to-play-modal').classList.remove('hidden');
    });

    document.getElementById('btn-export-data').addEventListener('click', () => {
        const code = Storage.exportData();
        if (code) {
            navigator.clipboard.writeText(code).then(() => {
                showNotification("✅ Yedekleme kodu kopyalandı! Bir yere not edin.");
            }).catch(err => {
                prompt("Lütfen aşağıdaki kodu kopyalayın:", code);
            });
        } else {
            showNotification("❌ Veri dışa aktarılamadı.");
        }
    });

    document.getElementById('btn-import-data').addEventListener('click', () => {
        const code = prompt("Lütfen yedeğinizi (kodu) buraya yapıştırın:");
        if (code) {
            const success = Storage.importData(code);
            if (success) {
                alert("Veriler başarıyla yüklendi! Oyun yeniden başlatılıyor.");
                window.location.reload();
            } else {
                alert("❌ Hatalı veya bozuk kod! Lütfen kodu tam kopyaladığınızdan emin olun.");
            }
        }
    });

    // Save loop
    setInterval(() => {
        gameData.activeFoods = aquarium.activeFoods;
        Storage.saveData(gameData);
    }, 10000); // Auto save every 10 seconds

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        gameData.activeFoods = aquarium.activeFoods;
        Storage.saveData(gameData);
        window.location.href = 'index.html';
    });
    } catch (err) {
        const overlay = document.getElementById('error-overlay');
        if (overlay) {
            overlay.style.display = 'block';
            overlay.innerText += '\nTRY-CATCH ERROR: ' + err.message + '\n' + err.stack;
        } else {
            alert('TRY-CATCH ERROR: ' + err.message);
        }
    }
});

let lastTickTime = Date.now();

function updateGameLogic(data) {
    const now = Date.now();
    const elapsedMs = now - lastTickTime;
    
    // Normal oyun zamanı (1 saniye = 1 saniye)
    const timeMultiplier = 1; 
    
    const elapsedMinutes = (elapsedMs / 60000) * timeMultiplier;
    const elapsedHours = (elapsedMs / 3600000) * timeMultiplier;
    lastTickTime = now;

    // Dekorasyon Bonuslarını Hesapla
    let waterBuff = 0;
    let happinessBuff = 0;
    let incomeBuff = 0;
    
    if (data.decorations) {
        data.decorations.forEach(d => {
            const config = CONFIG.DECORATIONS[d.type];
            if (config) {
                if (config.buffType === 'water' || config.buffType === 'all') waterBuff += config.buffValue;
                if (config.buffType === 'happiness' || config.buffType === 'all') happinessBuff += config.buffValue;
                if (config.buffType === 'income' || config.buffType === 'all') incomeBuff += config.buffValue;
            }
        });
    }

    // Passive Income
    let income = (incomeBuff * elapsedMinutes); // Dekorasyonlardan gelen pasif gelir (dakika başına)
    
    // Update Creatures
    for (let i = data.creatures.length - 1; i >= 0; i--) {
        let c = data.creatures[i];
        
        if (c.isDead) continue; // Ölü balıklar için statü ve yaşlanma hesaplamasını atla

        // Age increases
        if (typeof c.ageHours !== 'number' || isNaN(c.ageHours)) {
            c.ageHours = 0;
        }
        if (typeof c.maxLifespanHours !== 'number' || isNaN(c.maxLifespanHours)) {
            const config = CONFIG.CREATURES[c.type];
            c.maxLifespanHours = config ? (config.lifespanDays[0] * 24) : 144;
        }
        c.ageHours += elapsedHours;

        // Hunger increases (stat decreases)
        // Yavaşlatıldı (Eskiden 1.5'ti, test için 0.1'e çektim ki 1 dakikada ölüp gitmesinler)
        c.hunger -= elapsedMinutes * 0.1; 
        if (c.hunger < 0) c.hunger = 0;

        const maxHunger = CONFIG.MAX_HUNGER[c.size] || 100;
        const hungerPct = (c.hunger / maxHunger) * 100;

        // Health drops if starving (hunger = 0)
        if (c.hunger <= 0) {
            c.starvationTimer = (c.starvationTimer || 0) + elapsedMinutes;
            // Belli bir süre (örneğin 5 dakika) aç kaldıktan sonra
            if (c.starvationTimer >= 5) {
                c.starvationDamageTimer = (c.starvationDamageTimer || 0) + elapsedMinutes;
                // 1'er 1'er azalma (her 1 dakikada 1 can)
                if (c.starvationDamageTimer >= 1) {
                    c.health -= 1;
                    c.starvationDamageTimer -= 1;
                }
            }
        } else {
            // Açlık sıfır değilse sayaçları sıfırla
            c.starvationTimer = 0;
            c.starvationDamageTimer = 0;
        }

        // Happiness drops if hungry
        if (hungerPct < 50) {
            c.happiness -= elapsedMinutes * 0.1; // Yavaşlatıldı (Eski 1)
        }
        
        // Dekorasyon Mutluluk Bonusu (Açlık %50 üzerindeyse veya az açken)
        if (happinessBuff > 0 && hungerPct >= 30) {
            c.happiness += elapsedMinutes * (happinessBuff * 0.05); // Ufak bir artış
            if (c.happiness > 100) c.happiness = 100;
        }

        if (c.happiness < 0) c.happiness = 0;

        // Water quality effect on health
        if (data.waterQuality < 25) {
            c.health -= elapsedMinutes * 0.5; // Yavaşlatıldı
        } else if (data.waterQuality < 50) {
            c.health -= elapsedMinutes * 0.1; // Yavaşlatıldı
        }

        if (c.health < 0) c.health = 0;

        // Death condition
        const agePct = (c.ageHours / c.maxLifespanHours) * 100;
        if (c.health <= 0 || agePct >= 100) {
            c.isDead = true; // Diziden silmek yerine ölü olarak işaretle
            showNotification(`${c.name} (${CONFIG.CREATURES[c.type].name}) öldü 💔`);
            continue;
        }

        // Calculate passive income
        income += Economy.getPassiveIncome(c, data.isHardMode) * elapsedMinutes;
    }

    data.money += income;

    // Water Quality decay
    const numCreatures = data.creatures.length;
    let waterDecayRate = 1;
    if (numCreatures > 0 && numCreatures <= 5) waterDecayRate = 1;
    else if (numCreatures > 5 && numCreatures <= 10) waterDecayRate = 1.5;
    else if (numCreatures > 10 && numCreatures <= 20) waterDecayRate = 2;
    else if (numCreatures > 20) waterDecayRate = 3;

    // Gerçek geçen zamana (dakika) göre hesapla.
    const realElapsedMinutes = elapsedMs / 60000;
    
    // Günde 1 kere temizlenmesi için 24 saatte (1440 dk) 100 kirlilik birimi azalmalı.
    // Yavaşlatıldı (test için saniyede 0.1)
    let baseWaterDecay = 0.025;
    
    // Dekorasyonlardan gelen su temizliği bonusu (Kirlenmeyi yavaşlatır)
    if (waterBuff > 0) {
        // Örn: waterBuff 10 ise kirlenme %10 yavaşlar
        baseWaterDecay = baseWaterDecay * (1 - (waterBuff / 100));
        if (baseWaterDecay < 0) baseWaterDecay = 0;
    }
    
    data.waterQuality -= baseWaterDecay;
    if (data.waterQuality < 0) data.waterQuality = 0;
}

function updateUI(data) {
    // Top bar updates
    document.getElementById('money-display').innerText = Math.floor(data.money);
    
    // Level & XP Bar Updates
    const levelDisplay = document.getElementById('level-display');
    const xpBar = document.getElementById('xp-bar');
    if (levelDisplay && xpBar) {
        levelDisplay.innerText = `Lvl ${data.playerLevel || 1}`;
        const reqXp = Storage.getXpRequirement(data.playerLevel || 1);
        const currentXp = data.playerXp || 0;
        const xpPercent = Math.min(100, Math.floor((currentXp / reqXp) * 100));
        xpBar.style.width = `${xpPercent}%`;
    }

    // Tank capacity logic
    const tankLevel = CONFIG.TANK_LEVELS.find(t => t.level === data.tankLevel);
    document.getElementById('capacity-display').innerText = `${data.creatures.length}/${tankLevel.capacity}`;

    // Water quality bar
    const waterBar = document.getElementById('water-quality-bar');
    waterBar.style.width = `${Math.max(0, data.waterQuality)}%`;
    if (data.waterQuality > 50) {
        waterBar.style.backgroundColor = 'var(--success)';
    } else if (data.waterQuality > 25) {
        waterBar.style.backgroundColor = 'var(--accent)';
    } else {
        waterBar.style.backgroundColor = 'var(--danger)';
    }

    // Dirt canvas opacity
    if (!window.isCleaningMode) {
        const dirtCanvasLocal = document.getElementById('dirt-canvas');
        if (dirtCanvasLocal) {
            // Su kirliliği 50 ve üzerindeyse pırıl pırıl (opaklık 0)
            // 50'nin altına düştükçe maksimum 1.0 (tam görünür) olacak şekilde opaklık artar.
            let dirtOpacity = 0;
            if (data.waterQuality < 50) {
                dirtOpacity = (50 - data.waterQuality) / 50; 
            }
            
            dirtCanvasLocal.style.opacity = dirtOpacity;
            
            // Eğer su kirlenmişse ve canvas temizse tekrar çiz
            if (dirtOpacity > 0 && !dirtCanvasLocal.dataset.isDirty) {
                if (typeof window.fillDirtGlobal === 'function') {
                    window.fillDirtGlobal();
                }
            } else if (dirtOpacity === 0) {
                dirtCanvasLocal.dataset.isDirty = '';
            }
        }
    }
}

function showNotification(msg) {
    const container = document.getElementById('notifications-area');
    if (!container) return; // Prevent error if not exists
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerText = msg;
    container.appendChild(notif);

    // Remove after animation (5s)
    setTimeout(() => {
        notif.remove();
    }, 5000);
}

window.showNotification = showNotification; // Expose globally for Storage
window.updateTopBar = () => {
    updateUI(Storage.getData());
};

function openCreatureModal(creature) {
    const modal = document.getElementById('creature-modal');
    const details = document.getElementById('creature-details');
    const config = CONFIG.CREATURES[creature.type];
    
    // Eğer balık ölüyse özel ölüm menüsü
    if (creature.isDead) {
        const sellPrice = Economy.calculateSellPrice(creature, window.activeGameData.isHardMode);
        
        details.innerHTML = `
            <h2>${creature.name} <span style="font-size:1rem; opacity:0.7;">(${config.name})</span></h2>
            <p style="color:var(--danger); font-size:1.1rem; margin-top:10px;">Bu canlı maalesef hayatını kaybetti. ⚰️</p>
            <p style="font-size:0.9rem; margin-top:5px; color:var(--secondary);">Onu akvaryumdan kaldırabilir veya ölüsünü satabilirsiniz.</p>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                <button class="action-btn" onclick="removeCreature('${creature.id}')" style="background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2);">
                    Çöpe At
                </button>
                <button class="action-btn" onclick="sellCreature('${creature.id}')" style="background: var(--danger); border-color: var(--danger);">
                    Sat (💰 ${sellPrice})
                </button>
            </div>
        `;
        modal.classList.remove('hidden');
        return;
    }

    // Normal Canlı Menüsü (Ölü değilse)
    const agePct = creature.getLifespanPercentage();
    let barColor = 'var(--success)';
    if (agePct > 40) barColor = 'var(--accent)';
    if (agePct > 70) barColor = '#f4a261'; // Orange
    if (agePct > 90) barColor = 'var(--danger)';

    const heartFull = '❤️';
    const heartEmpty = '🤍';
    
    const safeEce = Math.max(0, Math.min(10, Math.floor(creature.loveEce || 0)));
    const safeOrkun = Math.max(0, Math.min(10, Math.floor(creature.loveOrkun || 0)));
    
    const eceHearts = heartFull.repeat(safeEce) + heartEmpty.repeat(10 - safeEce);
    const orkunHearts = heartFull.repeat(safeOrkun) + heartEmpty.repeat(10 - safeOrkun);

    const sellPrice = Economy.calculateSellPrice(creature, window.activeGameData.isHardMode);

    details.innerHTML = `
        <h2>${creature.name} ${creature.isSpecial ? '✨' : ''}</h2>
        <p><strong>Tür:</strong> ${config.name} (${creature.gender === 'male' ? '♂' : '♀'})</p>
        <p><strong>Yaş:</strong> ${Math.floor(creature.ageHours)} / ${Math.floor(creature.maxLifespanHours)}</p>
        <div class="stat-bar-container" style="background: rgba(255,255,255,0.1); width: 100%; height: 10px; border-radius: 5px; margin: 10px 0;">
            <div style="background: ${barColor}; width: ${Math.min(100, agePct)}%; height: 100%; border-radius: 5px;"></div>
        </div>
        
        <p><strong>Açlık:</strong> ${Math.floor(creature.hunger)}/${CONFIG.MAX_HUNGER[creature.size] || 100}</p>
        <p><strong>Mutluluk:</strong> ${Math.floor(creature.happiness)}/100</p>
        <p><strong>Sağlık:</strong> ${Math.floor(creature.health)}/100</p>
        
        <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.1);">
        
        <p>👩🏻 Ece'nin Kalpleri: <br> ${eceHearts}</p>
        <p>🧑🏻 Orkun'un Kalpleri: <br> ${orkunHearts}</p>
        
        <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.1);">
        
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
            <button class="action-btn" onclick="sellCreature('${creature.id}')" style="background: var(--danger); border-color: var(--danger);">
                Sat (💰 ${sellPrice})
            </button>
            <button class="action-btn" onclick="renameCreature('${creature.id}')">İsim</button>
            <button class="action-btn" onclick="breedCreature('${creature.id}')" style="background: var(--accent); border-color: var(--accent);">Çiftleştir</button>
        </div>
    `;

    modal.classList.remove('hidden');
}

window.openDecorationModal = function(decoration, gameData) {
    const modal = document.getElementById('decoration-modal');
    const details = document.getElementById('decoration-details');
    const config = CONFIG.DECORATIONS[decoration.type];
    
    if (!config) return;
    
    const sellPrice = Math.floor(config.basePrice * (gameData.isHardMode ? 0.2 : 0.5));
    
    details.innerHTML = `
        <h2 style="margin-bottom:10px;">${config.emoji} ${config.name}</h2>
        <p style="font-size:0.9rem; color:var(--secondary);">${config.desc}</p>
        <p style="margin-top:10px; font-size:0.8rem;">Bu dekorasyonun yerini değiştirebilir veya satabilirsiniz.</p>
    `;
    
    const btnMove = document.getElementById('move-decoration-btn');
    const btnSell = document.getElementById('sell-decoration-btn');
    
    btnMove.onclick = () => {
        window.aquarium.isMovingDecoration = true;
        window.aquarium.movingDecorationId = decoration.id;
        modal.classList.add('hidden');
        showNotification("Dekorasyonu farenizle taşıyıp, sabitlemek için tekrar tıklayın.");
    };
    
    btnSell.onclick = () => {
        const idx = gameData.decorations.findIndex(d => d.id === decoration.id);
        if (idx !== -1) {
            gameData.decorations.splice(idx, 1);
            gameData.money += sellPrice;
            Storage.saveData(gameData);
            updateUI(gameData);
            window.aquarium.setDecorations(gameData.decorations);
            showNotification(`${config.name} satıldı. 💰 +${sellPrice}`);
        }
        modal.classList.add('hidden');
    };
    
    modal.classList.remove('hidden');
}

// Global functions for modal buttons (quick hack for inline onclick)
window.breedCreature = function(id) {
    const data = window.activeGameData;
    const c1 = data.creatures.find(c => c.id == id);
    if (!c1) return;

    if (c1.happiness < 70 || c1.health < 60) {
        showNotification("Bu canlının çiftleşmek için sağlığı veya mutluluğu yetersiz! (Sağlık > 60, Mutluluk > 70 olmalı)");
        return;
    }

    // Find valid mates
    const mates = data.creatures.filter(c2 => 
        c2.type === c1.type && 
        c2.id !== c1.id && 
        c2.gender !== c1.gender &&
        c2.happiness >= 70 &&
        c2.health >= 60
    );

    if (mates.length === 0) {
        showNotification("Akvaryumda uygun bir eş yok! (Aynı tür, farklı cinsiyet, sağlıklı ve mutlu olmalı)");
        return;
    }

    // For simplicity, pick the first valid mate
    const c2 = mates[0];

    const tankLevel = CONFIG.TANK_LEVELS.find(t => t.level === data.tankLevel);
    if (data.creatures.length >= tankLevel.capacity) {
        showNotification("Akvaryum kapasitesi dolu! Yeni yavru için yer yok.");
        return;
    }

    // Create offspring
    const config = CONFIG.CREATURES[c1.type];
    const lifespanSpan = config.lifespanDays;
    const randomLifespanDays = Math.random() * (lifespanSpan[1] - lifespanSpan[0]) + lifespanSpan[0];
    
    // Special/Mutant chance (%10)
    const isSpecial = Math.random() < 0.10;

    const baby = {
        id: 'c_' + Date.now(),
        type: c1.type,
        name: `Yavru ${config.name}`,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        ageHours: 0,
        maxLifespanHours: randomLifespanDays * 24,
        hunger: CONFIG.MAX_HUNGER[config.size] || 100,
        happiness: 100,
        health: 100,
        loveEce: 0,
        loveOrkun: 0,
        isSpecial: isSpecial,
        size: config.size
    };

    data.creatures.push(baby);
    
    // Reduce happiness of parents slightly after breeding
    c1.happiness -= 20;
    c2.happiness -= 20;

    Storage.saveData(data);
    showNotification(`💕 ${c1.name} ve ${c2.name} çiftleşti! Yeni bir yavru doğdu! ${isSpecial ? '✨ (MUTANT!)' : ''}`);
    document.getElementById('creature-modal').classList.add('hidden');
};
window.sellCreature = function(id) {
    const data = window.activeGameData;
    const idx = data.creatures.findIndex(c => c.id == id);
    if (idx !== -1) {
        const c = data.creatures[idx];
        const price = Economy.calculateSellPrice(c, data.isHardMode);
        data.money += price;
        data.creatures.splice(idx, 1);
        Storage.saveData(data);
        showNotification(`${c.name} ${price} paraya satıldı!`);
        document.getElementById('creature-modal').classList.add('hidden');
    }
};

window.openCollection = function() {
    const modal = document.getElementById('collection-modal');
    const grid = document.getElementById('collection-grid');
    const countSpan = document.getElementById('collection-count');
    grid.innerHTML = '';
    
    let data = Storage.getData();
    let creatures = Object.values(CONFIG.CREATURES).sort((a, b) => {
        const rarityWeights = { 'Sıradan': 1, 'Yaygın': 2, 'Sıradışı': 3, 'Nadir': 4, 'Destansı': 5, 'Efsanevi': 6 };
        return rarityWeights[a.rarity] - rarityWeights[b.rarity] || a.basePrice - b.basePrice;
    });
    
    countSpan.innerText = `${data.collection.length} / ${creatures.length}`;
    
    creatures.forEach(c => {
        const isCollected = data.collection.includes(c.id);
        const card = document.createElement('div');
        
        let borderClass = '#a0a0a0'; // Sıradan
        if(c.rarity === 'Yaygın') borderClass = '#28a745';
        if(c.rarity === 'Sıradışı') borderClass = '#007bff';
        if(c.rarity === 'Nadir') borderClass = '#6f42c1';
        if(c.rarity === 'Destansı') borderClass = '#e83e8c';
        if(c.rarity === 'Efsanevi') borderClass = '#ffc107';
        
        let shadow = '';
        if(c.rarity === 'Destansı') shadow = 'box-shadow: 0 0 10px rgba(232, 62, 140, 0.5);';
        if(c.rarity === 'Efsanevi') shadow = 'box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);';
        
        card.style.cssText = `
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            background: rgba(135, 206, 250, 0.25); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
            border-bottom: 4px solid ${borderClass}; padding: 10px; height: 120px;
            ${shadow}
            
        `;
        
        // Eğer Efsanevi veya Destansı ise arkaplanı süsle
        if(isCollected && c.rarity === 'Destansı') card.style.background = 'radial-gradient(circle, rgba(232, 62, 140, 0.2) 0%, rgba(232, 62, 140, 0.05) 100%)';
        if(isCollected && c.rarity === 'Efsanevi') card.style.background = 'radial-gradient(circle, rgba(255, 193, 7, 0.3) 0%, rgba(255, 193, 7, 0.05) 100%)';
        
        let visualHtml = c.image
            ? `<img src="${c.image}" style="width:100%; height:60px; object-fit:contain; margin-bottom:10px; ${isCollected ? '' : 'filter: brightness(0); opacity: 0.8;'}" />`
            : `<div style="font-size: 2.5rem; ${isCollected ? '' : 'color: #333;'}">${c.emoji}</div>`;
            
        card.innerHTML = `
            ${visualHtml}
            <div style="font-size: 0.75rem; text-align: center; margin-top: 5px; color: ${isCollected ? 'white' : '#888'}; font-weight: bold;">${isCollected ? c.name : '???'}</div>
            <div style="font-size: 0.6rem; color: ${borderClass}; margin-top: auto;">${c.rarity}</div>
        `;
        grid.appendChild(card);
    });
    
    modal.classList.remove('hidden');
};


let pendingRenameId = null;

window.renameCreature = function(id) {
    pendingRenameId = id;
    const modal = document.getElementById('rename-modal');
    const input = document.getElementById('rename-input');
    
    const data = window.activeGameData;
    const c = data.creatures.find(c => c.id === id);
    if (c) {
        input.value = c.name;
    } else {
        input.value = '';
    }
    
    document.getElementById('creature-modal').classList.add('hidden');
    modal.classList.remove('hidden');
    input.focus();
};

document.getElementById('confirm-rename-btn').addEventListener('click', () => {
    if (!pendingRenameId) return;
    
    const input = document.getElementById('rename-input');
    const newName = input.value.trim();
    
    if (newName.length > 0) {
        const data = window.activeGameData;
        const c = data.creatures.find(c => c.id == pendingRenameId);
        if (c) {
            c.name = newName;
            Storage.saveData(data);
            
            // Oyun motorundaki aktif balığın adını da anında güncelle
            if (window.aquarium && window.aquarium.creatures) {
                const aqCreature = window.aquarium.creatures.find(x => x.id == pendingRenameId);
                if (aqCreature) {
                    aqCreature.name = newName;
                }
            }
            
            showNotification("İsim başarıyla güncellendi!");
        }
    }
    document.getElementById('rename-modal').classList.add('hidden');
    pendingRenameId = null;
});

window.removeCreature = function(id) {
    const data = window.activeGameData;
    const idx = data.creatures.findIndex(c => c.id === id);
    if (idx !== -1) {
        data.creatures.splice(idx, 1);
        Storage.saveData(data);
        document.getElementById('creature-modal').classList.add('hidden');
    }
};

// End of file
