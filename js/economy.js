const Economy = {
    getPassiveIncome: function(creature, isHardMode) {
        if (!creature || creature.health < 30) return 0; // Hasta canlı üretmez

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

        // Ölü balıklar pazar fiyatının %10'una satılır
        if (creature.isDead) {
            const multiplier = isHardMode ? CONFIG.ECONOMY.HARD.priceMultiplier : CONFIG.ECONOMY.TEST.priceMultiplier;
            const marketPrice = config.basePrice * multiplier;
            return Math.floor(marketPrice * 0.10);
        }

        const basePrice = config.basePrice;
        let price = basePrice * 0.4; // Base: %40

        // Yaş çarpanı (Ömür yüzdesine göre)
        const agePct = (creature.ageHours / creature.maxLifespanHours) * 100;
        let ageMultiplier = 1;

        if (agePct < 10) ageMultiplier = 0.3; // Yavru
        else if (agePct < 30) ageMultiplier = 0.6; // Genç
        else if (agePct < 60) ageMultiplier = 1.0; // Yetişkin (Prime)
        else if (agePct < 80) ageMultiplier = 0.8; // Olgun
        else ageMultiplier = 0.5; // Yaşlı

        price *= ageMultiplier;

        // Mutluluk bonusu
        if (creature.happiness > 80) {
            price *= 1.2;
        }

        // Özel/Mutant balık bonusu (Al-sat kârlı)
        if (creature.isSpecial) {
            price = basePrice * (Math.random() * 3 + 2); // 2x ile 5x arası
        }

        // Hard modda genel fiyatlar yüksekse satış da etkilenebilir ama planda satış fiyatı alttadır.
        return Math.floor(price);
    }
};
