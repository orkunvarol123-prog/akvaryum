const Feeding = {
    feed: function(gameData, foodId) {
        const foodItem = gameData.inventory.shared.find(item => item.id === foodId);
        
        if (!foodItem || foodItem.quantity <= 0) {
            showNotification("Bu yemden kalmadı!");
            return false;
        }

        const foodConfig = CONFIG.FOODS[foodId];
        if (!foodConfig) return false;

        let totalPortionsConsumed = 0;

        // Try to feed creatures based on their size and hunger
        // Only creatures with hunger < 80 will eat to not waste food
        const hungryCreatures = gameData.creatures.filter(c => c.hunger < 80);
        
        if (hungryCreatures.length === 0) {
            showNotification("Şu an kimse aç değil!");
            return false;
        }

        hungryCreatures.forEach(c => {
            // Check if food is suitable
            const cConfig = CONFIG.CREATURES[c.type];
            if (!foodConfig.suitableFor.includes('Tüm canlılar') && 
                !foodConfig.suitableFor.includes(cConfig.category)) {
                return; // Skip if not suitable
            }

            const portionNeeded = CONFIG.PORTION_CONSUMPTION[cConfig.size] || 1;
            
            // For simplicity, we just deduct 1 portion from inventory per feed action,
            // or we deduct the portions needed. In the plan: 
            // "Her besleme 1 porsiyon harcar" originally, then "Canlının boyutuna göre değişir".
            // Let's deduct from the shared inventory. Wait, the plan says:
            // "Yem alırsan 50 porsiyon gelir". We store portions in inventory as 'quantity'.
            
            if (foodItem.quantity >= portionNeeded) {
                foodItem.quantity -= portionNeeded;
                totalPortionsConsumed += portionNeeded;
                
                // Restore stats
                c.hunger += foodConfig.hungerRestore;
                if (c.hunger > 100) c.hunger = 100;
                
                c.happiness += foodConfig.happinessRestore;
                if (c.happiness > 100) c.happiness = 100;
                
                // Add love to current user
                const user = Storage.getCurrentUser();
                if (user === 'ece') {
                    c.loveEce = Math.min(10, c.loveEce + 0.1); // Slow increase
                } else {
                    c.loveOrkun = Math.min(10, c.loveOrkun + 0.1);
                }
            }
        });

        if (totalPortionsConsumed > 0) {
            showNotification(`${totalPortionsConsumed} porsiyon ${foodConfig.name} atıldı!`);
            
            // Remove from inventory if 0
            if (foodItem.quantity <= 0) {
                gameData.inventory.shared = gameData.inventory.shared.filter(i => i.id !== foodId);
                showNotification(`${foodConfig.name} bitti! Marketten yenisini almalısın.`);
            }
            return true;
        } else {
            showNotification("Yem yetersiz veya bu yemi yiyebilecek canlı yok.");
            return false;
        }
    }
};
