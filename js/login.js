document.addEventListener('DOMContentLoaded', () => {
    // Generate background bubbles
    const bubblesContainer = document.getElementById('bubbles');
    for (let i = 0; i < 20; i++) {
        createBubble(bubblesContainer);
    }

    // Loading Bar Logic
    const loadingFill = document.getElementById('loading-bar-fill');
    const loadingContainer = document.getElementById('loading-container');
    const userSelection = document.getElementById('user-selection');
    const actions = document.getElementById('actions');

    let progress = 0;
    function loadStep() {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            loadingFill.style.width = `${progress}%`;
            setTimeout(() => {
                loadingContainer.classList.add('hidden');
                userSelection.classList.remove('hidden');
                actions.classList.remove('hidden');
            }, 500);
        } else {
            loadingFill.style.width = `${progress}%`;
            setTimeout(loadStep, Math.random() * 500 + 200);
        }
    }
    setTimeout(loadStep, 300);

    // User selection logic
    const userButtons = document.querySelectorAll('.user-btn');
    userButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const user = btn.getAttribute('data-user');
            login(user);
        });
    });

    // Reset game logic
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => {
        if(confirm('Tüm ilerleme sıfırlanacak. Emin misiniz?')) {
            Storage.resetGame();
            showNotification('Oyun sıfırlandı.');
        }
    });

    // Check if game needs initial setup
    const data = Storage.getData();
    if(data.creatures.length === 0 && data.money === 500) {
        // Initial setup will be handled in game.js when first logged in,
        // or we can add the starting fish here. Let's do it here so the game starts with a fish.
        initializeFirstFish(data);
    }
});

function login(user) {
    Storage.setCurrentUser(user);
    Storage.addLog(`${user === 'ece' ? 'Ece' : 'Orkun'} oyuna giriş yaptı.`);
    
    // Redirect to game page
    window.location.href = 'game.html';
}

function createBubble(container) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    // Randomize bubble properties
    const size = Math.random() * 30 + 10; // 10px to 40px
    const left = Math.random() * 100; // 0% to 100%
    const duration = Math.random() * 5 + 5; // 5s to 10s
    const delay = Math.random() * 5; // 0s to 5s

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${left}%`;
    bubble.style.animationDuration = `${duration}s`;
    bubble.style.animationDelay = `${delay}s`;

    container.appendChild(bubble);

    // Recreate bubble after animation to keep the loop going smoothly
    setTimeout(() => {
        bubble.remove();
        createBubble(container);
    }, (duration + delay) * 1000);
}

function initializeFirstFish(data) {
    // Generate a starting fish (Japon Balığı)
    const startingFish = {
        id: 'fish_' + Date.now(),
        type: 'japon_baligi',
        name: 'Japon',
        gender: Math.random() > 0.5 ? 'male' : 'female',
        ageHours: 12, // Başlangıçta 12 saatlik (Genç/Yetişkin başı)
        maxLifespanHours: 8.5 * 24, // Ortalama 8.5 gün
        hunger: 100,
        happiness: 80,
        health: 100,
        loveEce: 0,
        loveOrkun: 0,
        createdAt: new Date().toISOString(),
        isSpecial: false,
        size: 'small',
        position: { x: 50, y: 50 } // Percentage based position
    };

    data.creatures.push(startingFish);
    data.collection.push('japon_baligi');
    Storage.saveData(data);
    Storage.addLog('Oyun başladı! İlk Japon Balığı akvaryuma eklendi.');
}
