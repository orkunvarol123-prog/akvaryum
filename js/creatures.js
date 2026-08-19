const IMAGE_CACHE = {};
function getCachedImage(src) {
    if (!IMAGE_CACHE[src]) {
        const img = new Image();
        img.src = src;
        IMAGE_CACHE[src] = img;
    }
    return IMAGE_CACHE[src];
}

class Creature {
    constructor(data) {
        this.dataRef = data;
        this.id = data.id;
        this.type = data.type; // key in CONFIG.CREATURES
        this.name = data.name;
        this.gender = data.gender;
        this.ageHours = data.ageHours;
        this.maxLifespanHours = data.maxLifespanHours;
        this.hunger = data.hunger; // 0-100
        this.happiness = data.happiness; // 0-100
        this.health = data.health; // 0-100
        this.loveEce = data.loveEce; // 0-10
        this.loveOrkun = data.loveOrkun; // 0-10
        this.isSpecial = data.isSpecial;
        this.isDead = data.isDead || false;
        this.size = data.size;
        
        this.maxHunger = CONFIG.MAX_HUNGER[this.size] || 100;
        this.hunger = data.hunger !== undefined ? data.hunger : this.maxHunger;
        this.hunger = Math.min(this.hunger, this.maxHunger);
        this.isEating = false;
        
        // Speech Bubble
        this.speechMessage = null;
        this.speechTimer = 0;
        
        this.config = CONFIG.CREATURES[this.type];
        
        this.isBottomDweller = (this.config.category === 'Salyangoz' || this.config.category === 'Karides' || this.config.category === 'Yengeç');
        this.pauseTimer = 0;
        
        // Visual positioning
        this.x = data.position ? data.position.x : Math.random() * 80 + 10;
        
        if (this.isBottomDweller) {
            this.y = data.position ? data.position.y : 82 + Math.random() * 4; // Dipte (82-86)
        } else {
            this.y = data.position ? data.position.y : Math.random() * 75 + 10; // Havada (10-85)
        }
        
        // Movement logic
        this.targetX = this.x;
        this.targetY = this.y;
        if (this.isBottomDweller) {
            this.speed = Math.random() * 0.2 + 0.2; // Dip canlıları daha yavaş
        } else {
            this.speed = Math.random() * 0.5 + 0.5; // Normal balıklar
        }
        this.direction = 1; // 1 for right, -1 for left
    }

    update(deltaTime, activeFoods = []) {
        if (this.isDead) {
            this.speechMessage = null;
            // Ölü balık sadece dibe çöker
            if (this.y < 88) {
                this.y += deltaTime * 0.005; 
            } else {
                this.y = 88; // Dipte dur
            }
            return; // Diğer tüm zeka (AI) mantığını atla
        }

        // Konuşma Balonu Mantığı Kaldırıldı

        const hungerPct = (this.hunger / this.maxHunger) * 100;

        // Açlık %30 ve altındaysa yeme gitme moduna gir
        if (hungerPct <= 30) {
            this.isEating = true;
        } else if (hungerPct >= 90) {
            // %90 veya üstü tokken yemeyi bırak
            this.isEating = false;
        }

        // AI: Yeme modundaysa ve ekranda yem varsa en yakınına git
        let targetFood = null;
        if (this.isEating && activeFoods.length > 0) {
            let minDist = Infinity;
            activeFoods.forEach(food => {
                // Check if suitable
                const config = CONFIG.FOODS[food.configId];
                if (config) {
                    const dist = Math.sqrt(Math.pow(food.x - this.x, 2) + Math.pow(food.y - this.y, 2));
                    if (dist < minDist) {
                        minDist = dist;
                        targetFood = food;
                    }
                }
            });
        }

        if (targetFood) {
            this.targetX = targetFood.x;
            // Dip canlıları yeme doğru yukarı yüzmez, dipte yemin düşmesini bekler/gider
            this.targetY = this.isBottomDweller ? 88 : targetFood.y;

            // Eğer yeme ulaştıysa (yakınsa) ye
            const distToFood = Math.sqrt(Math.pow(this.targetX - this.x, 2) + Math.pow(this.targetY - this.y, 2));
            if (distToFood < 5) {
                // Yeme işlemi
                const portionNeeded = CONFIG.PORTION_CONSUMPTION[this.size] || 1;
                const portionToEat = Math.min(portionNeeded, targetFood.portions);
                
                targetFood.portions -= portionToEat;
                
                // 1 porsiyon = 10 açlık barı
                this.dataRef.hunger += portionToEat * 10;
                if (this.dataRef.hunger >= this.maxHunger) {
                    this.dataRef.hunger = this.maxHunger;
                }
                
                // Anlık %90'ı geçtiyse hemen yemeyi bırak
                const newHungerPct = (this.dataRef.hunger / this.maxHunger) * 100;
                if (newHungerPct >= 90) {
                    this.isEating = false;
                }
                
                this.hunger = this.dataRef.hunger;
                
                // Mutluluğu yemin kalitesine göre (oransal) artır
                const totalPortions = CONFIG.FOODS[targetFood.configId]?.portions || 1;
                this.dataRef.happiness += (targetFood.happinessRestore / totalPortions) * portionToEat;
                if (this.dataRef.happiness > 100) this.dataRef.happiness = 100;
                this.happiness = this.dataRef.happiness;
                
                // Yem yiyince 5 XP ver
                if (window.Storage && window.Storage.addXP) {
                    window.Storage.addXP(5);
                }

                // Pick a new random target since we just ate
                this.targetX = Math.random() * 80 + 10;
                this.targetY = this.isBottomDweller ? (90 + Math.random() * 5) : (Math.random() * 80 + 10);
            }
        }

        // Move towards target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        let shouldMove = true;
        if (this.isBottomDweller && !targetFood) {
            if (this.pauseTimer > 0) {
                this.pauseTimer -= deltaTime;
                shouldMove = false;
            } else if (Math.random() < 0.005) { // Küçük bir ihtimalle dur
                this.pauseTimer = 2000 + Math.random() * 3000; // 2-5 saniye bekle
                shouldMove = false;
            }
        }
        
        if (dist > 1 && shouldMove) {
            // Yeme gidiyorsa hız multiplier'ı 3x, normal dolanıyorsa 1x
            const currentSpeedMultiplier = targetFood ? 3.0 : 1.0;
            this.x += (dx / dist) * this.speed * currentSpeedMultiplier * deltaTime * 0.006;
            this.y += (dy / dist) * this.speed * currentSpeedMultiplier * deltaTime * 0.006;
            this.direction = dx > 0 ? 1 : -1;
        } else if (dist <= 1 && !targetFood) {
            // Pick new target only if not currently chasing food
            this.targetX = Math.random() * 80 + 10;
            this.targetY = this.isBottomDweller ? (82 + Math.random() * 4) : (Math.random() * 75 + 10);
        }
    }

    draw(ctx, canvasWidth, canvasHeight) {
        const px = (this.x / 100) * canvasWidth;
        const py = (this.y / 100) * canvasHeight;
        
        ctx.save();
        ctx.translate(px, py);
        
        if (this.isDead) {
            // Ölü balıklar ters döner ve soluklaşır
            ctx.scale(1, -1);
            ctx.globalAlpha = 0.5;
        } else {
            // Standart balık emojileri (🐟, 🐠 vb.) sola dönüktür.
            if (this.direction === 1 && this.config.category !== 'Yengeç') {
                ctx.scale(-1, 1);
            }
        }

        // Determine size based on config size
        let fontSize = 70; // Default
        switch (this.size) {
            case 'Mini': fontSize = 60; break;
            case 'Küçük': fontSize = 90; break;
            case 'Orta': fontSize = 130; break;
            case 'Büyük': fontSize = 180; break;
            case 'Dev': fontSize = 240; break;
        }

        // Yaşa göre büyüme mekaniği (Ömrünün ilk %25'inde %50'den %100'e büyür)
        const agePct = this.getLifespanPercentage();
        const growthFactor = Math.min(1.0, agePct / 25);
        const currentScale = 0.5 + (0.5 * growthFactor);
        const currentFontSize = fontSize * currentScale;

        let drawnH = currentFontSize * 1.2; // Emojiler için varsayılan yükseklik

        if (this.config.image) {
            const img = getCachedImage(this.config.image);
            if (img.complete && img.naturalWidth !== 0) {
                // Balık boyutlarını belirgin şekilde büyüt (x2.5)
                const scaleMultiplier = this.config.scale || 1;
                const w = currentFontSize * 2.5 * scaleMultiplier; 
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                const h = w / aspectRatio; 
                
                ctx.drawImage(img, -w/2, -h/2, w, h);
                drawnH = h; // Gerçek çizim yüksekliğini kaydet
            } else {
                ctx.font = `${currentFontSize}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(this.config.emoji, 0, 0);
            }
        } else {
            ctx.font = `${currentFontSize}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.config.emoji, 0, 0);
        }

        if (this.isDead) {
            ctx.scale(1, -1); 
        } else if (this.direction === 1 && this.config.category !== 'Yengeç') {
            ctx.scale(-1, 1); 
        }
        
        // Balığın kafasının tam olarak nerede bittiğini (yarı yüksekliğini) hesapla
        const baseOffset = drawnH / 2;
        
        ctx.textAlign = "center"; // <--- BÜTÜN METİNLERİ X EKSENİNDE ORTALA
        ctx.textBaseline = "middle";
        
        ctx.font = "bold 15px Nunito";
        ctx.fillStyle = "white";
        ctx.fillText(this.name, 0, -(baseOffset + 12));
        
        // If special, add a sparkle
        if (this.isSpecial) {
            ctx.fillText("✨", 15, -(baseOffset - 8));
        }

        // Konuşma Balonu çizimi kaldırıldı

        ctx.restore();
    }
    
    getLifespanPercentage() {
        return (this.ageHours / this.maxLifespanHours) * 100;
    }
}
