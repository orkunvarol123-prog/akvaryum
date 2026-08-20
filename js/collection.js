document.addEventListener('DOMContentLoaded', () => {
    const data = Storage.getData();
    renderCollection(data);
});

function renderCollection(data) {
    const grid = document.getElementById('collection-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Tüm canllar listele (kilitli/kilitsiz)
    const creatures = Object.values(CONFIG.CREATURES);
    
    // Nadirliğe gre srla
    const rarityOrder = { 'Sradan': 1, 'Nadir': 2, 'Efsanevi': 3, 'Mistik': 4 };
    creatures.sort((a, b) => (rarityOrder[a.rarity] || 9) - (rarityOrder[b.rarity] || 9));

    creatures.forEach(creature => {
        const isUnlocked = data.collection && data.collection.includes(creature.id);
        
        const card = document.createElement('div');
        card.className = "collection-item glass-panel " + (isUnlocked ? 'unlocked' : 'locked');
        
        const filterStyle = isUnlocked ? '' : 'filter: brightness(0);';
        
        card.innerHTML = "
            <div class="collection-emoji" style="display: flex; justify-content: center; align-items: center; width: 100%; height: 80px;">
                <img src="" + creature.image + "" alt="" + creature.name + "" style="max-width: 100%; max-height: 100%; object-fit: contain; " + filterStyle + " />
            </div>
            <div class="collection-name">" + (isUnlocked ? creature.name : '???') + "</div>
        ";

        card.addEventListener('click', () => {
            showDetails(creature, isUnlocked, data);
        });

        grid.appendChild(card);
    });
}

function showDetails(creature, isUnlocked, data) {
    const details = document.getElementById('collection-details');
    if (!details) return;
    
    const filterStyle = isUnlocked ? '' : 'filter: brightness(0);';
    
    details.innerHTML = "
        <h2>" + (isUnlocked ? creature.name : '???') + "</h2>
        <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 150px; margin: 20px 0;">
            <img src="" + creature.image + "" alt="" + creature.name + "" style="max-width: 100%; max-height: 100%; object-fit: contain; drop-shadow(0 0 20px rgba(255,255,255,0.3)); " + filterStyle + " />
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px; text-align: left;">
            <p style="margin: 5px 0;"><strong>Kategori:</strong> " + (isUnlocked ? creature.category : '???') + "</p>
            <p style="margin: 5px 0;"><strong>Nadirlik:</strong> " + (isUnlocked ? creature.rarity : '???') + "</p>
            <p style="margin: 5px 0;"><strong>Boyut:</strong> " + (isUnlocked ? creature.size : '???') + "</p>
            <p style="margin: 5px 0;"><strong>Beslenme:</strong> " + (isUnlocked ? creature.diet : '???') + "</p>
            <p style="margin: 15px 0; font-style: italic; color: var(--text-muted);">
                "" + (isUnlocked ? creature.desc : 'Bu canly henz kefetmediniz. Pazar\'dan veya kutulardan bulabilirsiniz.') + ""
            </p>
        </div>
    ";
}

window.renderCollection = function() {
    const data = Storage.getData();
    renderCollection(data);
};