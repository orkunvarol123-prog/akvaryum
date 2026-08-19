document.addEventListener('DOMContentLoaded', () => {
    // Check login
    if (!Storage.getCurrentUser()) {
        window.location.href = 'index.html';
        return;
    }

    let gameData = Storage.getData();
    updateHeader(gameData);

    // Navigation
    document.getElementById('btn-back').addEventListener('click', () => {
        window.location.href = 'game.html?noload=1';
    });

    // Tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderMarket(e.target.getAttribute('data-tab'), gameData);
        });
    });

    // Initial render
    renderMarket('creatures', gameData);

    // Modal close
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('buy-modal').classList.add('hidden');
    });
});

function updateHeader(data) {
    const currentUser = Storage.getCurrentUser();
    document.getElementById('current-user-name').innerText = currentUser === 'ece' ? 'Ece' : 'Orkun';
    document.getElementById('current-user-avatar').innerText = currentUser === 'ece' ? '👩🏻' : '🧑🏻';
    document.getElementById('money-display').innerText = Math.floor(data.money);
    
    const tankLevel = CONFIG.TANK_LEVELS.find(t => t.level === data.tankLevel);
    document.getElementById('capacity-display').innerText = `${data.creatures.length}/${tankLevel.capacity}`;
}

function renderMarket(category, data) {
    const container = document.getElementById('market-content');
    container.innerHTML = '';

    const multiplier = data.isHardMode ? CONFIG.ECONOMY.HARD.priceMultiplier : CONFIG.ECONOMY.TEST.priceMultiplier;

    if (category === 'creatures') {
        let sortedCreatures = Object.values(CONFIG.CREATURES).sort((a, b) => {
            return (a.unlockLevel || 1) - (b.unlockLevel || 1) || a.basePrice - b.basePrice;
        });
        sortedCreatures.forEach(creature => {
            const price = creature.basePrice * multiplier;
            const canAfford = data.money >= price;
            const tankLevel = CONFIG.TANK_LEVELS.find(t => t.level === data.tankLevel);
            const isTankFull = data.creatures.length >= tankLevel.capacity;
            
            // Level Check
            const requiredLevel = creature.unlockLevel || 1;
            const isLocked = (data.playerLevel || 1) < requiredLevel;
            
            const isEfsanevi = ['orkun_exe', 'ece_gece', 'viski_poodle'].includes(creature.id);
            const alreadyOwned = isEfsanevi && data.creatures.some(c => c.type === creature.id);

            const card = document.createElement('div');
            card.className = 'market-item';
            
            if (isLocked) {
                card.style.opacity = '0.5';
                card.style.filter = 'grayscale(100%)';
                card.innerHTML = `
                    <div class="item-emoji" style="color: black; text-shadow: none;">❓</div>
                    <div class="item-name">GİZEMLİ CANLI</div>
                    <div class="item-desc">
                        Kilidi açmak için<br>
                        <strong>Seviye ${requiredLevel}</strong> olmalısınız.
                    </div>
                    <div class="item-price">🔒</div>
                    <button class="buy-btn" disabled>Kilitli</button>
                `;
            } else {
                let visualHtml = creature.image 
                    ? `<img src="${creature.image}" class="item-img" style="width:100%; height:80px; object-fit:contain; margin-bottom:10px;" />` 
                    : `<div class="item-emoji">${creature.emoji}</div>`;
                card.innerHTML = `
                    ${visualHtml}
                    <div class="item-name">${creature.name}</div>
                    <div class="item-desc">
                        Nadirlik: ${creature.rarity}<br>
                        Boyut: ${creature.size}
                    </div>
                    <div class="item-price">💰 ${price}</div>
                    <button class="buy-btn" ${(!canAfford || isTankFull || alreadyOwned) ? 'disabled' : ''} onclick="openBuyModal('creature', '${creature.id}', ${price})">
                        ${alreadyOwned ? 'Zaten Var' : (isTankFull ? 'Tank Dolu' : 'Satın Al')}
                    </button>
                `;
            }
            container.appendChild(card);
        });
    } else if (category === 'boxes') {
        const processedBoxes = Object.values(CONFIG.BOXES).map(box => {
            let sumLevels = 0;
            let count = 0;
            Object.values(CONFIG.CREATURES).forEach(c => {
                let match = true;
                if (box.filters.category && !box.filters.category.includes(c.category)) match = false;
                if (box.filters.rarity && !box.filters.rarity.includes(c.rarity)) match = false;
                if (box.filters.size && !box.filters.size.includes(c.size)) match = false;
                
                if (match) {
                    sumLevels += (c.unlockLevel || 1);
                    count++;
                }
            });
            
            let requiredLevel = 1;
            if (count > 0) {
                requiredLevel = Math.max(1, Math.floor(sumLevels / count));
            }
            
            const isLocked = (data.playerLevel || 1) < requiredLevel;
            return { box, requiredLevel, isLocked };
        });

        // Kilitli olanları sona at, geri kalanı orijinal sırasına sadık kalarak göster
        processedBoxes.sort((a, b) => {
            if (a.isLocked === b.isLocked) return 0;
            return a.isLocked ? 1 : -1;
        });

        processedBoxes.forEach(item => {
            const box = item.box;
            const requiredLevel = item.requiredLevel;
            const isLocked = item.isLocked;

            const price = box.price * multiplier;
            const canAfford = data.money >= price;
            const tankLevel = CONFIG.TANK_LEVELS.find(t => t.level === data.tankLevel);
            const isTankFull = data.creatures.length >= tankLevel.capacity;

            const card = document.createElement('div');
            card.className = 'market-item';
            
            if (isLocked) {
                card.style.border = '2px solid gray';
                card.style.background = 'rgba(128, 128, 128, 0.1)';
                card.style.opacity = '0.7';
                card.style.filter = 'grayscale(100%)';
                card.innerHTML = `
                    ${box.image ? `<img src="${box.image}" alt="${box.name}" style="width: 120px; height: 120px; display: block; margin: 0 auto; object-fit: contain; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5));">` : `<div class="item-emoji" style="font-size: 3rem;">${box.emoji}</div>`}
                    <div class="item-name" style="color: gray;">${box.name}</div>
                    <div class="item-desc">
                        Kilidi açmak için<br>
                        <strong>Seviye ${requiredLevel}</strong> olmalısınız.
                    </div>
                    <div class="item-price">🔒</div>
                    <button class="buy-btn" style="background: gray; color: white;" disabled>
                        Kilitli
                    </button>
                `;
            } else {
                card.style.border = '2px solid gold';
                card.style.background = 'rgba(255, 215, 0, 0.1)';
                card.innerHTML = `
                    ${box.image ? `<img src="${box.image}" alt="${box.name}" style="width: 120px; height: 120px; display: block; margin: 0 auto; object-fit: contain; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5));">` : `<div class="item-emoji" style="font-size: 3rem;">${box.emoji}</div>`}
                    <div class="item-name" style="color: gold;">${box.name}</div>
                    <div class="item-desc">
                        ${box.desc}
                    </div>
                    <div class="item-price">💰 ${price}</div>
                    <button class="buy-btn" style="background: gold; color: black;" ${(!canAfford || isTankFull) ? 'disabled' : ''} onclick="openGachaModal('${box.id}', ${price})">
                        ${isTankFull ? 'Tank Dolu' : 'İncele'}
                    </button>
                `;
            }
            container.appendChild(card);
        });
    } else if (category === 'foods') {
        Object.values(CONFIG.FOODS).forEach(food => {
            const price = food.basePrice * multiplier; // Using general multiplier for simplicity, or food multiplier
            const canAfford = data.money >= price;

            const card = document.createElement('div');
            card.className = 'market-item';
            card.innerHTML = `
                ${food.image ? `<img src="${food.image}" alt="${food.name}" style="width: 120px; height: 120px; display: block; margin: 0 auto; object-fit: contain; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5));">` : `<div class="item-emoji">🍖</div>`}
                <div class="item-name">${food.name}</div>
                <div class="item-desc">
                    ${food.portions} Porsiyon<br>
                    Kalite: ${'⭐'.repeat(food.quality)}
                </div>
                <div class="item-price">💰 ${price}</div>
                <button class="buy-btn" ${!canAfford ? 'disabled' : ''} onclick="buyItem('food', '${food.id}', ${price})">Satın Al</button>
            `;
            container.appendChild(card);
        });
    } else if (category === 'health') {
        Object.values(CONFIG.HEALTH_ITEMS).forEach(item => {
            const price = item.basePrice * multiplier;
            const canAfford = data.money >= price;

            const card = document.createElement('div');
            card.className = 'market-item';
            card.innerHTML = `
                ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 120px; height: 120px; display: block; margin: 0 auto; object-fit: contain; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5));">` : `<div class="item-emoji">💊</div>`}
                <div class="item-name">${item.name}</div>
                <div class="item-desc" style="display:none;">
                    Sağlık Yenileme: +${item.healthRestore}
                </div>
                <div class="item-price">💰 ${price}</div>
                <button class="buy-btn" ${!canAfford ? 'disabled' : ''} onclick="buyItem('health', '${item.id}', ${price})">Satın Al</button>
            `;
            container.appendChild(card);
        });
    } else if (category === 'love') {
        Object.values(CONFIG.LOVE_HAPPINESS_ITEMS).forEach(item => {
            const price = data.isHardMode ? item.basePriceHard : item.basePriceTest;
            const canAfford = data.money >= price;

            const card = document.createElement('div');
            card.className = 'market-item';
            const icon = item.type === 'love' ? '💝' : '✨';
            const statText = item.type === 'love' ? 'Sevgi Bağınız' : 'Mutluluk';
            
            card.innerHTML = `
                ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 120px; height: 120px; display: block; margin: 0 auto; object-fit: contain; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5));">` : `<div class="item-emoji">${icon}</div>`}
                <div class="item-name">${item.name}</div>
                <div class="item-desc" style="display:none;">
                    ${statText} artışı: +${item.value}
                </div>
                <div class="item-price">💰 ${price}</div>
                <button class="buy-btn" ${!canAfford ? 'disabled' : ''} onclick="buyItem('love', '${item.id}', ${price})">Satın Al</button>
            `;
            container.appendChild(card);
        });
    } else if (category === 'upgrades') {
        const currentLevelObj = CONFIG.TANK_LEVELS.find(t => t.level === data.tankLevel);
        const nextLevelObj = CONFIG.TANK_LEVELS.find(t => t.level === data.tankLevel + 1);
        
        if (nextLevelObj) {
            const price = data.isHardMode ? nextLevelObj.costHard : nextLevelObj.costTest;
            const canAfford = data.money >= price;
            
            const card = document.createElement('div');
            card.className = 'market-item';
            card.innerHTML = `
                <img src="assets/items/upgrade.png" alt="Akvaryum Yükseltmesi" style="width: 120px; height: 120px; display: block; margin: 0 auto; object-fit: contain; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5));">
                <div class="item-name">Kapasite Büyütme</div>
                <div class="item-desc">
                    Akvaryum kapasitesini ${currentLevelObj.capacity}'ten ${nextLevelObj.capacity} canlıya çıkarır.
                </div>
                <div class="item-price">💰 ${price}</div>
                <button class="buy-btn" ${!canAfford ? 'disabled' : ''} onclick="buyItem('upgrade', '${nextLevelObj.level}', ${price})">Yükselt</button>
            `;
            container.appendChild(card);
        } else {
            const card = document.createElement('div');
            card.className = 'market-item';
            card.innerHTML = `
                <img src="assets/items/upgrade.png" alt="Maksimum Seviye" style="width: 120px; height: 120px; display: block; margin: 0 auto; object-fit: contain; filter: grayscale(100%); opacity: 0.5;">
                <div class="item-name">Son Seviye Akvaryum</div>
                <div class="item-desc">Kapasiteniz maksimum seviyede!</div>
                <div class="item-price">-</div>
                <button class="buy-btn" disabled>Maksimum</button>
            `;
            container.appendChild(card);
        }
    } else if (category === 'decorations') {
        Object.values(CONFIG.DECORATIONS).forEach(dec => {
            const price = dec.basePrice * multiplier;
            const canAfford = data.money >= price;
            
            const card = document.createElement('div');
            card.className = 'market-item';
            
            card.innerHTML = `
                <div class="item-emoji">${dec.emoji}</div>
                <div class="item-name">${dec.name}</div>
                <div class="item-desc" style="font-size:0.8rem; margin:5px 0;">
                    ${dec.desc}
                </div>
                <div class="item-price">💰 ${price}</div>
                <button class="buy-btn" ${!canAfford ? 'disabled' : ''} onclick="openBuyModal('decoration', '${dec.id}', ${price})">
                    Satın Al
                </button>
            `;
            container.appendChild(card);
        });
    }
}

let pendingPurchase = null;

window.openBuyModal = function(type, id, price) {
    const modal = document.getElementById('buy-modal');
    const details = document.getElementById('buy-details');
    const genderSel = document.getElementById('gender-selection');
    
    pendingPurchase = { type, id, price, gender: null };

    if (type === 'creature') {
        const config = CONFIG.CREATURES[id];
        details.innerHTML = `<h3>${config.name} Satın Alınacak</h3><p>Fiyat: 💰 ${price}</p>`;
        
        if (['orkun_exe', 'viski_poodle', 'ece_gece'].includes(id)) {
            genderSel.classList.add('hidden');
            pendingPurchase.gender = (id === 'ece_gece') ? 'female' : 'male';
        } else {
            genderSel.classList.remove('hidden');
            // Reset gender selection
            document.querySelectorAll('.gender-btn').forEach(btn => btn.classList.remove('selected'));
        }
    }

    modal.classList.remove('hidden');
};

document.querySelectorAll('.gender-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
        pendingPurchase.gender = e.target.getAttribute('data-gender');
    });
});

document.getElementById('confirm-buy-btn').addEventListener('click', () => {
    if (!pendingPurchase) return;

    if (pendingPurchase.type === 'creature' && !pendingPurchase.gender) {
        showNotification('Lütfen bir cinsiyet seçin!');
        return;
    }

    buyItem(pendingPurchase.type, pendingPurchase.id, pendingPurchase.price, pendingPurchase.gender);
    document.getElementById('buy-modal').classList.add('hidden');
});

// --- GACHA (BOX) LOGIC ---
let activeGacha = null;
let isSpinning = false;

window.openGachaModal = function(boxId, price) {
    if (isSpinning) return;
    
    const data = Storage.getData();
    const box = CONFIG.BOXES[boxId];
    activeGacha = { boxId, price, boxData: box };
    
    const modal = document.getElementById('gacha-modal');
    const contentBox = document.getElementById('gacha-content-box');
    const title = document.getElementById('gacha-title');
    const poolContainer = document.getElementById('gacha-pool-container');
    const priceDisplay = document.getElementById('gacha-price-display');
    const strip = document.getElementById('gacha-strip');
    const spinBtn = document.getElementById('gacha-spin-btn');
    
    // UI Elements for Winner Screen
    document.getElementById('gacha-window-ui').style.display = 'block';
    document.getElementById('gacha-pool-title').style.display = 'block';
    poolContainer.style.display = 'flex';
    spinBtn.style.display = 'inline-block';
    document.getElementById('gacha-winner-screen').classList.add('hidden');
    
    // Reset state
    strip.style.transition = 'none';
    strip.style.transform = 'translateX(0)';
    strip.innerHTML = '';
    
    // Check if it's a legendary box (mostly epic+ drops)
    contentBox.className = 'gacha-content';
    if (box.filters.rarity && !box.filters.rarity.includes('Yaygın') && !box.filters.rarity.includes('Seyrek')) {
        contentBox.classList.add('legendary-bg');
    }
    
    title.innerText = `${box.emoji} ${box.name}`;
    priceDisplay.innerText = price;
    
    // Generate Pool UI
    poolContainer.innerHTML = '';
    let pool = Object.values(CONFIG.CREATURES).filter(c => {
        if (box.filters.rarity && !box.filters.rarity.includes(c.rarity)) return false;
        if (box.filters.category && !box.filters.category.includes(c.category)) return false;
        if (box.filters.size && !box.filters.size.includes(c.size)) return false;
        if (box.filters.ids && !box.filters.ids.includes(c.id)) return false;
        return true;
    });
    
    pool.forEach(c => {
        const itemDiv = document.createElement('div');
        const isCollected = data.collection.includes(c.id);
        
        itemDiv.className = `pool-item ${isCollected ? '' : 'unknown'}`;
        let visualHtml = (c.image && isCollected)
            ? `<img src="${c.image}" style="width:100%; height:40px; object-fit:contain; margin-bottom:5px;" />`
            : `<div class="emoji">${isCollected ? c.emoji : '❓'}</div>`;
            
        itemDiv.innerHTML = `
            ${visualHtml}
            <div class="name">${isCollected ? c.name : '???'}</div>
        `;
        poolContainer.appendChild(itemDiv);
    });
    
    // Setup Spin Button
    spinBtn.disabled = data.money < price;
    spinBtn.onclick = () => spinGacha(pool);
    
    modal.classList.remove('hidden');
};

document.getElementById('gacha-close-btn').addEventListener('click', () => {
    if (isSpinning) return;
    document.getElementById('gacha-modal').classList.add('hidden');
});

function createGachaElement(creature, isCollected) {
    const el = document.createElement('div');
    
    let extraClass = '';
    if (creature.rarity === 'Efsanevi') extraClass = ' legendary-card';
    if (creature.rarity === 'Mistik') extraClass = ' mythic-card';
    
    el.className = `gacha-item rarity-${creature.rarity.replace(/\s/g, '')}${extraClass} ${isCollected ? '' : 'unknown'}`;
    let visualHtml = (creature.image && isCollected)
        ? `<img src="${creature.image}" style="width:100%; height:60px; object-fit:contain; margin-bottom:5px;" />`
        : `<div class="emoji">${isCollected ? creature.emoji : '❓'}</div>`;
        
    el.innerHTML = `
        ${visualHtml}
        <div class="name">${isCollected ? creature.name : '???'}</div>
    `;
    return el;
}

function spinGacha(pool) {
    if (isSpinning) return;
    
    let data = Storage.getData();
    if (data.money < activeGacha.price) {
        showNotification("Yeterli paranız yok!");
        return;
    }
    
    const tankLevel = CONFIG.TANK_LEVELS.find(t => t.level === data.tankLevel);
    if (data.creatures.length >= tankLevel.capacity) {
        showNotification("Akvaryum kapasitesi dolu! Önce yer açın.");
        return;
    }

    isSpinning = true;
    document.getElementById('gacha-close-btn').style.display = 'none';
    document.getElementById('gacha-spin-btn').disabled = true;
    
    // Deduct money
    data.money -= activeGacha.price;
    Storage.saveData(data);
    updateHeader(data);
    
    const strip = document.getElementById('gacha-strip');
    strip.innerHTML = '';
    strip.style.transition = 'none';
    strip.style.transform = 'translateX(0)';
    
    // Generate 50 items
    const TOTAL_ITEMS = 60;
    const WINNER_INDEX = 50; // 50th item is the winner
    
    // Nadirliklere göre çıkma ihtimalleri (Ağırlıklar)
    const rarityWeights = {
        'Yaygın': 600,    // %60
        'Seyrek': 250,    // %25
        'Nadir': 100,     // %10
        'Destansı': 39,   // %3.9
        'Efsanevi': 10,   // %1
        'Mistik': 1       // %0.1
    };

    function getRandomCreatureFromPool(poolArray) {
        let totalWeight = 0;
        const poolWithWeights = poolArray.map(c => {
            const weight = rarityWeights[c.rarity] || 100;
            totalWeight += weight;
            return { creature: c, weight: weight };
        });
        
        let rand = Math.random() * totalWeight;
        for (let item of poolWithWeights) {
            if (rand < item.weight) return item.creature;
            rand -= item.weight;
        }
        return poolArray[poolArray.length - 1];
    }
    
    const wonCreatureConfig = getRandomCreatureFromPool(pool);
    
    for (let i = 0; i < TOTAL_ITEMS; i++) {
        let c = getRandomCreatureFromPool(pool);
        if (i === WINNER_INDEX) {
            c = wonCreatureConfig;
        }
        strip.appendChild(createGachaElement(c, data.collection.includes(c.id)));
    }
    
    // Start Animation
    // Each item is 120px + 10px margin = 130px wide
    // Target is middle of 50th item.
    // Container width is ~ 90% of screen. Let's calculate exact transform.
    
    // A quick hack to let DOM render
    setTimeout(() => {
        const itemWidth = 130;
        // The target line is at 50% of the window.
        const windowWidth = document.querySelector('.gacha-window').offsetWidth;
        const targetOffset = (WINNER_INDEX * itemWidth) + (itemWidth / 2);
        // Add some random offset so it doesn't land exactly perfect every time
        const randomFlicker = (Math.random() * 80) - 40; 
        
        const finalTransform = - (targetOffset - (windowWidth / 2) + randomFlicker);
        
        strip.style.transition = 'transform 5s cubic-bezier(0.15, 0.9, 0.1, 1)';
        strip.style.transform = `translateX(${finalTransform}px)`;
        
        // Wait for animation to finish
        setTimeout(() => {
            finishGachaSpin(wonCreatureConfig);
        }, 5500); // 5s transition + 0.5s padding
    }, 50);
}

function finishGachaSpin(wonCreatureConfig) {
    let data = Storage.getData();
    
    const lifespanSpan = wonCreatureConfig.lifespanDays;
    const randomLifespanDays = Math.random() * (lifespanSpan[1] - lifespanSpan[0]) + lifespanSpan[0];
    
    // %10 Şansla Mutant/Özel
    const isSpecial = Math.random() < 0.10;

    const newCreature = {
        id: 'c_' + Date.now(),
        type: wonCreatureConfig.id,
        name: wonCreatureConfig.name,
        gender: ['orkun_exe', 'viski_poodle'].includes(wonCreatureConfig.id) ? 'male' : (wonCreatureConfig.id === 'ece_gece' ? 'female' : (Math.random() > 0.5 ? 'male' : 'female')),
        ageHours: 0,
        maxLifespanHours: randomLifespanDays * 24,
        hunger: CONFIG.MAX_HUNGER[wonCreatureConfig.size] || 100,
        happiness: 100,
        health: 100,
        loveEce: 0,
        loveOrkun: 0,
        isSpecial: isSpecial,
        size: wonCreatureConfig.size,
        position: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }
    };

    data.creatures.push(newCreature);
    if(!data.collection.includes(wonCreatureConfig.id)) data.collection.push(wonCreatureConfig.id);
    
    Storage.saveData(data);
    updateHeader(data);
    Storage.addXP(25); // Kutu açınca 25 XP!
    
    // UI changes for Winner Screen
    document.getElementById('gacha-window-ui').style.display = 'none';
    document.getElementById('gacha-pool-title').style.display = 'none';
    document.getElementById('gacha-pool-container').style.display = 'none';
    document.getElementById('gacha-spin-btn').style.display = 'none';
    
    const winnerScreen = document.getElementById('gacha-winner-screen');
    const winnerEmoji = document.getElementById('gacha-winner-emoji');
    const winnerName = document.getElementById('gacha-winner-name');
    
    if (wonCreatureConfig.image) {
        winnerEmoji.innerHTML = `<img src="${wonCreatureConfig.image}" style="max-width: 150px; max-height: 150px; object-fit: contain;" />`;
    } else {
        winnerEmoji.innerText = wonCreatureConfig.emoji;
    }
    winnerName.innerText = `${wonCreatureConfig.name} ${isSpecial ? '✨ (Mutant)' : ''}`;
    
    if (isSpecial) {
        winnerEmoji.style.textShadow = '0 0 50px gold';
    } else {
        winnerEmoji.style.textShadow = 'none';
    }
    
    winnerScreen.classList.remove('hidden');
    
    document.getElementById('gacha-to-aquarium-btn').onclick = () => {
        window.location.href = 'game.html?noload=1';
    };
    
    isSpinning = false;
    document.getElementById('gacha-close-btn').style.display = 'block';
}

window.buyItem = function(type, id, price, gender = null) {
    let data = Storage.getData();
    
    if (data.money < price) {
        showNotification("Yeterli paranız yok!");
        return;
    }

    if (type === 'creature') {
        const tankLevel = CONFIG.TANK_LEVELS.find(t => t.level === data.tankLevel);
        if (data.creatures.length >= tankLevel.capacity) {
            showNotification("Akvaryum kapasitesi dolu!");
            return;
        }

        const config = CONFIG.CREATURES[id];
        const lifespanSpan = config.lifespanDays;
        const randomLifespanDays = Math.random() * (lifespanSpan[1] - lifespanSpan[0]) + lifespanSpan[0];

        const newCreature = {
            id: 'c_' + Date.now(),
            type: id,
            name: config.name,
            gender: gender,
            ageHours: 0,
            maxLifespanHours: randomLifespanDays * 24,
            hunger: CONFIG.MAX_HUNGER[config.size] || 100,
            happiness: 100,
            health: 100,
            loveEce: 0,
            loveOrkun: 0,
            isSpecial: false,
            size: config.size
        };

        data.creatures.push(newCreature);
        if(!data.collection.includes(id)) data.collection.push(id);
        
        data.money -= price;
        Storage.saveData(data);
        updateHeader(data);
        Storage.addXP(10); // Balık alınca XP ver
        showNotification(`${config.name} başarıyla satın alındı ve akvaryuma eklendi!`);
    } else if (type === 'decoration') {
        const config = CONFIG.DECORATIONS[id];
        
        const newDecoration = {
            id: 'd_' + Date.now(),
            type: id,
            x: 50, // Ortada başlasın
            y: 88 // Zemin hizası
        };
        
        if (!data.decorations) data.decorations = [];
        data.decorations.push(newDecoration);
        
        data.money -= price;
        Storage.saveData(data);
        updateHeader(data);
        Storage.addXP(5); // Dekorasyon 5 XP
        showNotification(`${config.name} başarıyla satın alındı ve akvaryuma eklendi!`);
    } else if (type === 'food') {
        const config = CONFIG.FOODS[id];
        if (!data.inventory.shared) data.inventory.shared = new Array(25).fill(null);
        
        let inventoryList = data.inventory.shared;
        while(inventoryList.length < 25) inventoryList.push(null);
        
        let existing = inventoryList.find(i => i && i.id === id);
        if (existing) {
            existing.quantity += config.portions;
        } else {
            let emptyIndex = inventoryList.findIndex(i => i === null);
            if (emptyIndex === -1) {
                showNotification("Ortak sandığınız dolu!");
                return;
            }
            inventoryList[emptyIndex] = { id: id, quantity: config.portions };
        }
        
        data.money -= price;
        Storage.saveData(data);
        updateHeader(data);
        showNotification(`${config.name} (${config.portions} porsiyon) satın alındı!`);
    } else if (type === 'health' || type === 'love') {
        const isHealth = type === 'health';
        const config = isHealth ? CONFIG.HEALTH_ITEMS[id] : CONFIG.LOVE_HAPPINESS_ITEMS[id];
        
        if (!data.inventory.shared) {
            data.inventory.shared = new Array(25).fill(null);
        }
        
        let inventoryList = data.inventory.shared;
        while(inventoryList.length < 25) inventoryList.push(null);
        
        let existing = inventoryList.find(i => i && i.id === id);
        
        if (existing) {
            existing.quantity += 1;
        } else {
            let emptyIndex = inventoryList.findIndex(i => i === null);
            if (emptyIndex === -1) {
                showNotification("Ortak sandığınız dolu! Lütfen önce eşya tüketin veya yer açın.");
                return;
            }
            inventoryList[emptyIndex] = { id: id, quantity: 1 };
        }
        
        data.money -= price;
        Storage.saveData(data);
        updateHeader(data);
        showNotification(`${config.name} satın alındı ve Ortak Sandık'a eklendi!`);
    } else if (type === 'upgrade') {
        const nextLevel = parseInt(id);
        const config = CONFIG.TANK_LEVELS.find(t => t.level === nextLevel);
        
        data.tankLevel = nextLevel;
        data.money -= price;
        Storage.saveData(data);
        updateHeader(data);
        showNotification(`Akvaryum kapasitesi ${config.capacity} canlıya yükseltildi! 🥳`);
        
        // Ekranı anında güncelle
        renderMarket('upgrades', data);
    }
};
