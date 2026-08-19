document.addEventListener('DOMContentLoaded', () => {
    const data = Storage.getData();
    if (!data.collection) {
        data.collection = [];
        Storage.saveData(data);
    }

    const grid = document.getElementById('collection-grid');
    
    // Yalnızca Balık/Özel canlı türlerini alıyoruz (CONFIG.CREATURES)
    const allCreatures = Object.values(CONFIG.CREATURES);
    
    // Update stats
    const unlockedCount = data.collection.length;
    const totalCount = allCreatures.length;
    document.getElementById('collection-stats').innerText = `Keşfedilen Türler: ${unlockedCount} / ${totalCount}`;

    // Render items
    allCreatures.forEach(creature => {
        const isUnlocked = data.collection.includes(creature.id);
        const card = document.createElement('div');
        card.className = `collection-item glass-panel ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        card.innerHTML = `
            <div class="collection-emoji">${creature.emoji}</div>
            <div class="collection-name">${isUnlocked ? creature.name : '???'}</div>
        `;

        if (isUnlocked) {
            card.addEventListener('click', () => {
                showCreatureDetails(creature);
            });
        }
        
        grid.appendChild(card);
    });
});

function showCreatureDetails(creature) {
    const modal = document.getElementById('collection-modal');
    const details = document.getElementById('collection-details');
    
    details.innerHTML = `
        <h2>${creature.name}</h2>
        <div style="font-size: 5rem; text-align: center; margin: 20px 0; text-shadow: 0 0 20px rgba(255,255,255,0.3);">${creature.emoji}</div>
        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px; text-align: left;">
            <p style="margin: 5px 0;"><strong>Kategori:</strong> ${creature.category}</p>
            <p style="margin: 5px 0;"><strong>Nadirlik:</strong> ${creature.rarity}</p>
            <p style="margin: 5px 0;"><strong>Boyut Sınıfı:</strong> ${creature.size}</p>
            <p style="margin: 5px 0;"><strong>Ortalama Ömür:</strong> ${creature.lifespanDays[0]} - ${creature.lifespanDays[1]} Gün</p>
        </div>
        <div style="margin-top: 15px; font-size: 0.9rem; color: var(--secondary);">
            Bu canlıyı akvaryumunuza eklediniz ve koleksiyonunuza kattınız!
        </div>
    `;
    
    modal.classList.remove('hidden');
}
