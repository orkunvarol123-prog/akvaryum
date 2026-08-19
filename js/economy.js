const Economy = {
    getPassiveIncome: function(creature, isHardMode) {
        if (!creature || creature.health < 30) return 0; // Hasta canlÄ± Ã¼retmez

        const config = CONFIG.CREATURES[creature.type];
        if (!config) return 0;

        let income = 0;
        if (config.passiveIncome) {
            income = isHardMode ? config.passiveIncome.hard : config.passiveIncome.test;
        } else {
            income = isHardMode ? (config.basePrice * 0.001) : (config.basePrice * 0.003);
        }

        // Mutluluk bonusu
        if (creature.happiness > 70) {
            income *= 1.5;
        }

        return income;
    },

    calculateSellPrice: function(creature, isHardMode) {
        const config = CONFIG.CREATURES[creature.type];
        if (!config) return 0;

        // Ã–lÃ¼ balÄ±klar pazar fiyatÄ±nÄ±n %10'una satÄ±lÄ±r
        if (creature.isDead) {
            const multiplier = isHardMode ? CONFIG.ECONOMY.HARD.priceMultiplier : CONFIG.ECONOMY.TEST.priceMultiplier;
            const marketPrice = config.basePrice * multiplier;
            return Math.floor(marketPrice * 0.10);
        }

        const basePrice = config.basePrice;
        let price = basePrice * 0.4; // Base: %40

        // YaÅŸ Ã§arpanÄ± (Ã–mÃ¼r yÃ¼zdesine gÃ¶re)
        const agePct = (creature.ageHours / creature.maxLifespanHours) * 100;
        let ageMultiplier = 1;

        if (agePct < 10) ageMultiplier = 0.3; // Yavru
        else if (agePct < 30) ageMultiplier = 0.6; // GenÃ§
        else if (agePct < 60) ageMultiplier = 1.0; // YetiÅŸkin (Prime)
        else if (agePct < 80) ageMultiplier = 0.8; // Olgun
        else ageMultiplier = 0.5; // YaÅŸlÄ±

        price *= ageMultiplier;

        // Mutluluk bonusu
        if (creature.happiness > 80) {
            price *= 1.2;
        }

        // Ã–zel/Mutant balÄ±k bonusu (Al-sat kÃ¢rlÄ±)
        if (creature.isSpecial) {
            price = basePrice * (Math.random() * 3 + 2); // 2x ile 5x arasÄ±
        }

        // Hard modda genel fiyatlar yÃ¼ksekse satÄ±ÅŸ da etkilenebilir ama planda satÄ±ÅŸ fiyatÄ± alttadÄ±r.
        return Math.floor(price);
    }
};

