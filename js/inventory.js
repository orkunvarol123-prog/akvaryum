document.addEventListener('DOMContentLoaded', () => {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('current-user-name').innerText = currentUser === 'ece' ? 'Ece' : 'Orkun';
    document.getElementById('current-user-avatar').innerText = currentUser === 'ece' ? '👩🏻' : '🧑🏻';
    document.getElementById('private-owner-name').innerText = currentUser === 'ece' ? 'Ece' : 'Orkun';

    document.getElementById('btn-back').addEventListener('click', () => {
        window.location.href = 'game.html?noload=1';
    });

    renderInventory();

    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('item-modal').classList.add('hidden');
    });
});

function renderInventory() {
    const data = Storage.getData();
    const currentUser = Storage.getCurrentUser();
    
    // 1. Render Private Inventory (5 slots limit)
    const privateSlots = document.getElementById('private-slots');
    privateSlots.innerHTML = '';
    const privateItems = data.inventory[currentUser] || [];
    
    // 2. Render Shared Inventory (25 slots limit)
    const sharedSlots = document.getElementById('shared-slots');
    sharedSlots.innerHTML = '';
    const sharedItems = data.inventory.shared || [];
    
    // Check and expand arrays if they don't have nulls up to their limit
    while(privateItems.length < 5) privateItems.push(null);
    while(sharedItems.length < 25) sharedItems.push(null);
    
    // Re-save if we mutated the arrays
    if (!data.inventory[currentUser]) data.inventory[currentUser] = privateItems;
    if (!data.inventory.shared) data.inventory.shared = sharedItems;
    
    for (let i = 0; i < 5; i++) {
        const item = privateItems[i];
        privateSlots.appendChild(createSlot(item, 'private', i));
    }
    
    for (let i = 0; i < 25; i++) {
        const item = sharedItems[i];
        sharedSlots.appendChild(createSlot(item, 'shared', i));
    }
}

function createSlot(itemData, type, index) {
    const slot = document.createElement('div');
    slot.className = 'inv-slot';
    
    slot.draggable = true;
    slot.dataset.type = type;
    slot.dataset.index = index;

    if (!itemData) {
        slot.classList.add('empty');
    } else {
        // Find config
        let config = CONFIG.FOODS[itemData.id] || CONFIG.HEALTH_ITEMS[itemData.id] || CONFIG.LOVE_HAPPINESS_ITEMS[itemData.id];
        let icon = '📦';
        if (CONFIG.FOODS[itemData.id]) icon = '🍖';
        else if (CONFIG.HEALTH_ITEMS[itemData.id]) icon = '💊';
        else if (CONFIG.LOVE_HAPPINESS_ITEMS[itemData.id]) icon = '💝';

        if (!config) {
            icon = '❓';
            config = { name: 'Bilinmeyen Eşya' };
        }

        let iconHtml = `<div class="slot-icon">${icon}</div>`;
        if (config && config.image) {
            iconHtml = `<img src="${config.image}" alt="${config.name}" style="width: 100%; height: 100%; object-fit: contain; padding: 5px; box-sizing: border-box;">`;
        }

        slot.innerHTML = `
            ${iconHtml}
            <div class="slot-qty">${itemData.quantity}x</div>
        `;

        slot.addEventListener('click', () => {
            openItemModal(itemData, config, type, index);
        });
    }

    setupDragAndDrop(slot);
    return slot;
}

let draggedSlot = null;

function setupDragAndDrop(slot) {
    slot.addEventListener('dragstart', (e) => {
        draggedSlot = {
            type: slot.dataset.type,
            index: parseInt(slot.dataset.index)
        };
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => slot.style.opacity = '0.5', 0);
    });

    slot.addEventListener('dragend', () => {
        slot.style.opacity = '1';
        draggedSlot = null;
        document.querySelectorAll('.inv-slot').forEach(s => s.classList.remove('drag-over'));
    });

    slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    slot.addEventListener('dragenter', (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', () => {
        slot.classList.remove('drag-over');
    });

    slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        
        if (!draggedSlot) return;

        const sourceListType = draggedSlot.type;
        const sourceIndex = draggedSlot.index;
        
        const targetListType = slot.dataset.type;
        const targetIndex = parseInt(slot.dataset.index);

        if (sourceListType === targetListType && sourceIndex === targetIndex) return;

        let data = Storage.getData();
        const currentUser = Storage.getCurrentUser();
        
        let sourceArray = sourceListType === 'shared' ? data.inventory.shared : data.inventory[currentUser];
        let targetArray = targetListType === 'shared' ? data.inventory.shared : data.inventory[currentUser];

        const temp = sourceArray[sourceIndex];
        sourceArray[sourceIndex] = targetArray[targetIndex];
        targetArray[targetIndex] = temp;
        
        Storage.saveData(data);
        renderInventory();
    });
}

let activeItemContext = null;

function openItemModal(item, config, locationType, index) {
    const modal = document.getElementById('item-modal');
    const details = document.getElementById('item-details');
    const useBtn = document.getElementById('use-item-btn');
    
    activeItemContext = { item, config, locationType, index };

    let desc = "";
    if (CONFIG.FOODS[item.id]) {
        desc = "Bu yemi 'Kullan' dediğinizde akvaryum ekranına dönersiniz ve farenizle tıklayarak dilediğiniz yere atabilirsiniz.";
    } else if (CONFIG.HEALTH_ITEMS[item.id]) {
        desc = `Bu iksir balığın sağlığını ${config.healthRestore} artırır.`;
    } else if (CONFIG.LOVE_HAPPINESS_ITEMS[item.id]) {
        if (config.type === 'love') desc = `Bu kek balığın sana olan sevgisini ${config.value} artırır.`;
        if (config.type === 'happiness') desc = `Bu serum balığın mutluluğunu ${config.value} artırır.`;
    }

    let iconHtml = '';
    if (config && config.image) {
        iconHtml = `<img src="${config.image}" alt="${config.name}" style="width: 120px; height: 120px; object-fit: contain; display: block; margin: 0 auto 10px auto; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5));">`;
    }

    details.innerHTML = `
        ${iconHtml}
        <h2>${config.name}</h2>
        <p>Miktar: <strong id="modal-item-qty" style="color:var(--accent); font-size:1.2rem;">${item.quantity}</strong></p>
        <p style="margin-top:10px; color:var(--secondary); font-size:0.9rem;">${desc}</p>
        <div id="target-list-container" style="display:none; margin-top:20px; max-height:250px; overflow-y:auto; text-align:left;"></div>
    `;

    useBtn.style.display = 'inline-block';
    modal.classList.remove('hidden');
}

document.getElementById('use-item-btn').addEventListener('click', () => {
    if (!activeItemContext) return;
    const { item, config } = activeItemContext;
    
    if (CONFIG.FOODS[item.id]) {
        let data = Storage.getData();
        data.pendingFeedItem = item.id;
        Storage.saveData(data);
        window.location.href = 'game.html?noload=1';
        return;
    }

    // İksir veya Kek ise liste aç
    const useBtn = document.getElementById('use-item-btn');
    const listContainer = document.getElementById('target-list-container');
    
    useBtn.style.display = 'none'; // Kullan tuşunu gizle, listeyi göster
    listContainer.style.display = 'block';
    
    renderTargetList();
});

function renderTargetList() {
    if (!activeItemContext) return;
    const { item, config, locationType } = activeItemContext;
    const listContainer = document.getElementById('target-list-container');
    const currentUser = Storage.getCurrentUser();
    let data = Storage.getData();
    
    if (data.creatures.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center;">Akvaryumda hiç canlı yok!</p>';
        return;
    }

    listContainer.innerHTML = '<h3>Hangi canlıya uygulamak istersiniz?</h3><div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;"></div>';
    const listDiv = listContainer.querySelector('div');

    data.creatures.forEach(c => {
        const cConfig = CONFIG.CREATURES[c.type];
        
        let statText = '';
        let statColor = 'white';
        let barPct = 0;
        
        if (CONFIG.HEALTH_ITEMS[item.id]) {
            statText = `Sağlık: ${Math.floor(c.health)}/100`;
            barPct = c.health;
            if (c.health < 40) statColor = 'var(--danger)';
            else if (c.health < 80) statColor = 'var(--accent)';
            else statColor = 'var(--success)';
        } else if (CONFIG.LOVE_HAPPINESS_ITEMS[item.id]) {
            if (config.type === 'love') {
                const loveVal = currentUser === 'ece' ? c.loveEce : c.loveOrkun;
                statText = `Sevgi Bağınız: ${Math.floor(loveVal)}/10`;
                barPct = (loveVal / 10) * 100;
                statColor = '#ff6b81'; // Pembe/Kırmızı kalp rengi
            } else if (config.type === 'happiness') {
                statText = `Mutluluk: ${Math.floor(c.happiness)}/100`;
                barPct = c.happiness;
                if (c.happiness < 40) statColor = 'var(--danger)';
                else statColor = 'var(--success)';
            }
        }

        const btn = document.createElement('div');
        btn.className = 'glass-panel';
        btn.style.cssText = 'padding:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; border: 1px solid rgba(255,255,255,0.1); border-radius:8px; transition:all 0.2s ease;';
        btn.onmouseover = () => btn.style.background = 'rgba(255,255,255,0.2)';
        btn.onmouseout = () => btn.style.background = 'transparent';
        
        btn.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.5rem;">${cConfig.emoji}</span>
                <span style="font-weight:bold;">${c.name}</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <span style="font-size:0.9rem; color:${statColor};">${statText}</span>
                <div style="width:80px; height:6px; background:rgba(0,0,0,0.3); border-radius:3px; overflow:hidden; margin-top:5px;">
                    <div style="width:${barPct}%; height:100%; background:${statColor}; transition:width 0.3s ease;"></div>
                </div>
            </div>
        `;

        btn.addEventListener('click', () => {
            applyItemToCreature(c.id);
        });

        listDiv.appendChild(btn);
    });
}

function applyItemToCreature(creatureId) {
    if (!activeItemContext) return;
    const { item, config, locationType } = activeItemContext;
    let data = Storage.getData();
    const currentUser = Storage.getCurrentUser();
    
    const creature = data.creatures.find(c => c.id === creatureId);
    if (!creature) return;

    // Etkiyi Uygula
    if (CONFIG.HEALTH_ITEMS[item.id]) {
        if (creature.health >= 100) {
            showNotification(`${creature.name} zaten tamamen sağlıklı!`);
            return;
        }
        creature.health = Math.min(100, creature.health + config.healthRestore);
        showNotification(`${creature.name} iyileşti! (Sağlık +${config.healthRestore}) 💖`);
    } else if (CONFIG.LOVE_HAPPINESS_ITEMS[item.id]) {
        if (config.type === 'love') {
            if (currentUser === 'ece') {
                if (creature.loveEce >= 10) { showNotification(`${creature.name} sana zaten sırılsıklam aşık!`); return; }
                creature.loveEce = Math.min(10, creature.loveEce + config.value);
            } else {
                if (creature.loveOrkun >= 10) { showNotification(`${creature.name} sana zaten sırılsıklam aşık!`); return; }
                creature.loveOrkun = Math.min(10, creature.loveOrkun + config.value);
            }
            showNotification(`${creature.name} ile bağın güçlendi! 💕`);
        } else if (config.type === 'happiness') {
            if (creature.happiness >= 100) {
                showNotification(`${creature.name} zaten çok mutlu!`);
                return;
            }
            creature.happiness = Math.min(100, creature.happiness + config.value);
            showNotification(`${creature.name} çok mutlu oldu! ✨`);
        }
    }

    // Eşyayı Düş
    const inventoryList = locationType === 'shared' ? data.inventory.shared : data.inventory[currentUser];
    const itemIndex = inventoryList.findIndex(i => i.id === item.id);
    
    if (itemIndex !== -1) {
        inventoryList[itemIndex].quantity -= 1;
        activeItemContext.item.quantity = inventoryList[itemIndex].quantity; // Referans güncelle
        
        if (inventoryList[itemIndex].quantity <= 0) {
            inventoryList.splice(itemIndex, 1);
            document.getElementById('item-modal').classList.add('hidden');
        } else {
            // Miktarı ve yeni statüleri güncelle
            document.getElementById('modal-item-qty').innerText = activeItemContext.item.quantity;
            Storage.saveData(data); // Listeyi çizmeden önce kaydet ki güncel veri okunsun
            renderTargetList();
        }
    }

    Storage.saveData(data);
    renderInventory();
}
