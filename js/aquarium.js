class AquariumRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.decCanvas = document.getElementById('decoration-canvas');
        if (this.decCanvas) {
            this.decCtx = this.decCanvas.getContext('2d');
        }
        this.creatures = [];
        this.activeFoods = []; // Ekranda süzülen yemler
        this.decorations = []; // Ekranda duran dekorasyonlar
        this.lastTime = performance.now();

        // Image Cache
        this.imageCache = {};
        this.preloadFoodImages();

        this.isFeedMode = false;
        this.isMovingDecoration = false;
        this.movingDecorationId = null;
        this.selectedFoodConfig = null;
        this.onFoodDrop = null; // Yem bırakıldığında tetiklenecek callback
        this.onDecorationClick = null; // Dekorasyon tıklandığında tetiklenecek callback
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Click listener for selecting creatures and dropping food
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.onCreatureClick = null; // Callback
    }

    preloadFoodImages() {
        Object.values(CONFIG.FOODS).forEach(food => {
            if (food.image) {
                const img = new Image();
                img.src = food.image;
                this.imageCache[food.id] = img;
            }
        });
    }

    setDecorations(decData) {
        this.decorations = decData || [];
    }

    handleMouseMove(e) {
        if (this.isFeedMode) {
            this.canvas.style.cursor = 'crosshair';
        } else if (this.isMovingDecoration) {
            this.canvas.style.cursor = 'grabbing';
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const dec = this.decorations.find(d => d.id === this.movingDecorationId);
            if (dec) {
                dec.x = (mouseX / this.canvas.width) * 100;
                dec.y = (mouseY / this.canvas.height) * 100;
                
                // Kum hizasını geçmesin
                if (dec.y < 20) dec.y = 20;
                if (dec.y > 90) dec.y = 90;
                if (dec.x < 5) dec.x = 5;
                if (dec.x > 95) dec.x = 95;
            }
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    setFeedMode(isActive, foodConfig) {
        this.isFeedMode = isActive;
        this.selectedFoodConfig = foodConfig;
    }

    addFood(pctX, pctY, config) {
        const food = {
            id: 'food_' + Date.now() + Math.random(),
            configId: config.id,
            name: config.name,
            x: pctX,
            y: pctY, // Starts where clicked
            portions: config.portions,
            hungerRestore: config.hungerRestore,
            happinessRestore: config.happinessRestore
        };
        this.activeFoods.push(food);
    }

    setFoods(foodsData) {
        this.activeFoods = foodsData || [];
    }

    handleClick(e) {
        // Eğer temizlik modu açıksa (bunu game.js hallediyor ama yine de)
        if (window.isCleaningMode) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Dekorasyon yerleştirme modundaysa
        if (this.isMovingDecoration) {
            this.isMovingDecoration = false;
            this.movingDecorationId = null;
            this.canvas.style.cursor = 'default';
            return;
        }

        // Yem atma modundaysa
        if (this.isFeedMode && this.selectedFoodConfig) {
            const pctX = (mouseX / this.canvas.width) * 100;
            const pctY = (mouseY / this.canvas.height) * 100;
            if (typeof this.onFoodDrop === 'function') {
                this.onFoodDrop(pctX, pctY, this.selectedFoodConfig);
            }
            return; // Balık tıklamasını engelle
        }

        // Tıklananı Bul
        let clickedCreature = null;
        for (let c of this.creatures) {
            const px = (c.x / 100) * (this.canvas.width / (window.devicePixelRatio || 1));
            const py = (c.y / 100) * (this.canvas.height / (window.devicePixelRatio || 1));
            
            let hitRadius = 80;
            switch(c.size) {
                case 'Mini': hitRadius = 80; break;
                case 'Küçük': hitRadius = 100; break;
                case 'Orta': hitRadius = 130; break;
                case 'Büyük': hitRadius = 180; break;
                case 'Dev': hitRadius = 250; break;
            }

            const dist = Math.sqrt(Math.pow(px - mouseX, 2) + Math.pow(py - mouseY, 2));
            if (dist < hitRadius) { 
                clickedCreature = c;
                break;
            }
        }

        if (clickedCreature && typeof this.onCreatureClick === 'function') {
            this.onCreatureClick(clickedCreature);
            return; // Önce canlıya tıklandıysa dekorasyonu es geç
        }

        // Tıklanan Dekorasyonu Bul
        let clickedDec = null;
        for (let d of this.decorations) {
            const config = CONFIG.DECORATIONS[d.type];
            if(!config) continue;
            
            const px = (d.x / 100) * (this.canvas.width / (window.devicePixelRatio || 1));
            const py = (d.y / 100) * (this.canvas.height / (window.devicePixelRatio || 1));
            const hitRadius = 60 * config.scale; // Boyuta göre tıklama alanı

            const dist = Math.sqrt(Math.pow(px - mouseX, 2) + Math.pow(py - mouseY, 2));
            if (dist < hitRadius) { 
                clickedDec = d;
                break;
            }
        }

        if (clickedDec && typeof this.onDecorationClick === 'function') {
            this.onDecorationClick(clickedDec);
        }
    }

    resize() {
        const container = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = container.clientWidth * dpr;
        this.canvas.height = container.clientHeight * dpr;
        this.canvas.style.width = container.clientWidth + 'px';
        this.canvas.style.height = container.clientHeight + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (this.decCanvas) {
            this.decCanvas.width = container.clientWidth * dpr;
            this.decCanvas.height = container.clientHeight * dpr;
            this.decCanvas.style.width = container.clientWidth + 'px';
            this.decCanvas.style.height = container.clientHeight + 'px';
            this.decCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
    }

    setCreatures(creaturesData) {
        // Sadece yeni veya güncellenmiş objeleri yönetmek daha karmaşık ama 
        // basitlik açısından her seferinde yeniden oluşturabiliriz veya 
        // ID ile senkronize edebiliriz.
        this.creatures = creaturesData.map(cData => {
            const existing = this.creatures.find(c => c.id === cData.id);
            if (existing) {
                // Update data ref so modifications go to current gameData
                existing.dataRef = cData;
                // Update stats without resetting position
                existing.hunger = cData.hunger;
                existing.happiness = cData.happiness;
                existing.health = cData.health;
                existing.ageHours = cData.ageHours;
                existing.isDead = cData.isDead || false;
                existing.name = cData.name; // Senkronize et (isim değiştiyse hemen yansısın)
                return existing;
            } else {
                return new Creature(cData);
            }
        });
    }

    render() {
        const currentTime = performance.now();
        let deltaTime = currentTime - this.lastTime;
        if (deltaTime > 100) deltaTime = 100; // Arka planda bekleme süresini sınırla
        this.lastTime = currentTime;

        // Clear canvas (background is handled by CSS)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dekorasyonları Çiz (Yeni decoration-canvas'a)
        if (this.decCtx) {
            this.decCtx.clearRect(0, 0, this.decCanvas.width, this.decCanvas.height);
            for (let d of this.decorations) {
                const config = CONFIG.DECORATIONS[d.type];
                if (!config) continue;

                const dx = (d.x / 100) * this.decCanvas.width;
                const dy = (d.y / 100) * this.decCanvas.height;
                
                this.decCtx.save();
                this.decCtx.translate(dx, dy);
                
                // Eğer taşınıyorsa yarı saydam yap
                if (this.isMovingDecoration && this.movingDecorationId === d.id) {
                    this.decCtx.globalAlpha = 0.5;
                }

                const sizeConfig = { 'Mini': 60, 'Küçük': 80, 'Orta': 120, 'Büyük': 180, 'Dev': 250 };
                const sizePx = sizeConfig[c.size] || 80;
                
                if (config.image && this.imageCache[config.id]) {
                    const img = this.imageCache[config.id];
                    if (img.complete) {
                        this.ctx.drawImage(img, -sizePx/2, -sizePx/2, sizePx, sizePx);
                    }
                } else {
                    const fontSize = sizePx * 0.8;
                    this.ctx.font = fontSize + 'px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(config.emoji, 0, 0);
                }
                
                this.ctx.restore();
            }
        }

        // Update and draw foods
        for (let i = this.activeFoods.length - 1; i >= 0; i--) {
            let food = this.activeFoods[i];
            
            // Batma mekaniği (y ekseninde aşağı inme)
            if (food.y < 92.5) { // %92.5 seviyesine (kumun tam ortası) kadar batar
                food.y += (1.0 * deltaTime * 0.005); // Yavaşça bat
            }

            // Çizim
            const fx = (food.x / 100) * this.canvas.width;
            const fy = (food.y / 100) * this.canvas.height;
            
            this.ctx.save();
            this.ctx.translate(fx, fy);
            
            const config = CONFIG.FOODS[food.configId];
            if (config && this.imageCache[food.configId]) {
                const img = this.imageCache[food.configId];
                if (img.complete) {
                    const size = 70; // 70x70 piksel boyutunda çiz (eski: 50)
                    this.ctx.drawImage(img, -size/2, -size/2, size, size);
                }
            } else {
                this.ctx.font = "20px Arial";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText("🍗", 0, 0);
            }
            
            // Porsiyon göstergesi
            this.ctx.font = "12px Arial";
            this.ctx.fillStyle = "white";
            this.ctx.fillText(Math.floor(food.portions), 0, -15);
            this.ctx.restore();

            // Porsiyon bittiyse sil
            if (food.portions <= 0) {
                this.activeFoods.splice(i, 1);
            }
        }

        // Update and draw creatures
        this.creatures.forEach(creature => {
            creature.update(deltaTime, this.activeFoods);
            creature.draw(this.ctx, this.canvas.width, this.canvas.height);
        });

        // Loop
        requestAnimationFrame(() => this.render());
    }
}
