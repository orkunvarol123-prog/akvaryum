const CONFIG = {
    // Ekonomi modları
    ECONOMY: {
        TEST: {
            priceMultiplier: 1,
            passiveIncomeMultiplier: 1,
            dailyReward: 100,
            startingMoney: 500,
            foodPriceMultiplier: 1
        },
        HARD: {
            priceMultiplier: 3,
            passiveIncomeMultiplier: 0.25,
            dailyReward: 25,
            startingMoney: 200,
            foodPriceMultiplier: 2
        }
    },

    // Tank kapasiteleri
    TANK_LEVELS: [
        { level: 1, capacity: 5, costTest: 0, costHard: 0 },
        { level: 2, capacity: 10, costTest: 300, costHard: 900 },
        { level: 3, capacity: 15, costTest: 800, costHard: 2400 },
        { level: 4, capacity: 20, costTest: 2000, costHard: 6000 },
        { level: 5, capacity: 25, costTest: 5000, costHard: 15000 },
        { level: 6, capacity: 30, costTest: 12000, costHard: 36000 }
    ],

    // Canlı türleri veritabanı (Örnek başlangıç seti)
    CREATURES: {
        'salyangoz': { id: 'salyangoz', name: 'Elma Salyangozu', category: 'Salyangoz', rarity: 'Sıradan', basePrice: 10, size: 'Mini', lifespanDays: [15, 20], emoji: '🐌', image: 'assets/fish/salyangoz.png', unlockLevel: 1 },
        'karides': { id: 'karides', name: 'Kiraz Karides', category: 'Karides', rarity: 'Sıradan', basePrice: 20, size: 'Mini', lifespanDays: [10, 15], emoji: '🦐', image: 'assets/fish/karides.png', unlockLevel: 1 },
        'neon_tetra': { id: 'neon_tetra', name: 'Neon Tetra', category: 'Balık', rarity: 'Sıradan', basePrice: 30, size: 'Mini', lifespanDays: [7, 10], emoji: '🐟', image: 'assets/fish/neon_tetra.png', unlockLevel: 1 },
        'lepistes': { id: 'lepistes', name: 'Lepistes', category: 'Balık', rarity: 'Sıradan', basePrice: 40, size: 'Mini', lifespanDays: [5, 8], emoji: '🐟', image: 'assets/fish/lepistes.png', unlockLevel: 2 },
        'japon_baligi': { id: 'japon_baligi', name: 'Japon Balığı', category: 'Balık', rarity: 'Sıradan', basePrice: 50, size: 'Küçük', lifespanDays: [7, 10], emoji: '🐠', image: 'assets/fish/japon_baligi.png', unlockLevel: 2 },
        'copcu': { id: 'copcu', name: 'Bronz Çöpçü', category: 'Balık', rarity: 'Sıradan', basePrice: 60, size: 'Mini', lifespanDays: [10, 15], emoji: '🧹', image: 'assets/fish/copcu.png', unlockLevel: 3 },
        'zebra': { id: 'zebra', name: 'Zebrabalığı', category: 'Balık', rarity: 'Sıradan', basePrice: 70, size: 'Mini', lifespanDays: [5, 9], emoji: '🦓', image: 'assets/fish/zebra.png', unlockLevel: 3 },
        'moli': { id: 'moli', name: 'Moli Balığı', category: 'Balık', rarity: 'Sıradan', basePrice: 80, size: 'Küçük', lifespanDays: [6, 9], emoji: '🐠', image: 'assets/fish/moli.png', unlockLevel: 4 },
        'plati': { id: 'plati', name: 'Plati Balığı', category: 'Balık', rarity: 'Sıradan', basePrice: 90, size: 'Küçük', lifespanDays: [6, 9], emoji: '🐟', image: 'assets/fish/plati.png', unlockLevel: 4 },
        'nerite': { id: 'nerite', name: 'Nerite Salyangozu', category: 'Salyangoz', rarity: 'Sıradan', basePrice: 25, size: 'Mini', lifespanDays: [12, 18], emoji: '🐚', image: 'assets/fish/nerite.png', unlockLevel: 2 },
        'endler': { id: 'endler', name: 'Endler Lepistesi', category: 'Balık', rarity: 'Sıradan', basePrice: 45, size: 'Mini', lifespanDays: [4, 7], emoji: '🐟', image: 'assets/fish/endler.png', unlockLevel: 3 },
        
        'kirmizi_yengec': { id: 'kirmizi_yengec', name: 'Kırmızı Kıskaçlı Yengeç', category: 'Yengeç', rarity: 'Yaygın', basePrice: 150, size: 'Mini', lifespanDays: [10, 15], emoji: '🦀', image: 'assets/fish/kirmizi_yengec.png', unlockLevel: 11 },
        'vampir_yengec': { id: 'vampir_yengec', name: 'Vampir Yengeç', category: 'Yengeç', rarity: 'Sıradışı', basePrice: 350, size: 'Mini', lifespanDays: [12, 18], emoji: '🦀', image: 'assets/fish/vampir_yengec.png', unlockLevel: 8 },
        'kemanci_yengec': { id: 'kemanci_yengec', name: 'Kemancı Yengeç', category: 'Yengeç', rarity: 'Sıradışı', basePrice: 200, size: 'Mini', lifespanDays: [15, 20], emoji: '🦀', image: 'assets/fish/kemanci_yengec.png', unlockLevel: 6 },
        
        'beta': { id: 'beta', name: 'Beta Balığı', category: 'Balık', rarity: 'Yaygın', basePrice: 120, size: 'Küçük', lifespanDays: [7, 10], emoji: '🐡', image: 'assets/fish/beta.png', unlockLevel: 5 },
        'kilickuyruk': { id: 'kilickuyruk', name: 'Kılıçkuyruk', category: 'Balık', rarity: 'Yaygın', basePrice: 130, size: 'Küçük', lifespanDays: [8, 12], emoji: '🗡️', image: 'assets/fish/kilickuyruk.png', unlockLevel: 5 },
        'ember_tetra': { id: 'ember_tetra', name: 'Ember Tetra', category: 'Balık', rarity: 'Yaygın', basePrice: 140, size: 'Mini', lifespanDays: [5, 8], emoji: '🔥', image: 'assets/fish/ember_tetra.png', unlockLevel: 6 },
        'cuce_gurami': { id: 'cuce_gurami', name: 'Cüce Gurami', category: 'Balık', rarity: 'Yaygın', basePrice: 160, size: 'Küçük', lifespanDays: [6, 9], emoji: '🐠', image: 'assets/fish/cuce_gurami.png', unlockLevel: 6 },
        'kardinal': { id: 'kardinal', name: 'Kardinal Tetra', category: 'Balık', rarity: 'Sıradışı', basePrice: 190, size: 'Mini', lifespanDays: [6, 9], emoji: '🔴', image: 'assets/fish/kardinal.png', unlockLevel: 7 },
        'otocinclus': { id: 'otocinclus', name: 'Otocinclus', category: 'Balık', rarity: 'Sıradışı', basePrice: 210, size: 'Mini', lifespanDays: [8, 13], emoji: '🌿', image: 'assets/fish/otocinclus.png', unlockLevel: 7 },
        'melek_baligi': { id: 'melek_baligi', name: 'Melek Balığı', category: 'Balık', rarity: 'Sıradışı', basePrice: 250, size: 'Orta', lifespanDays: [7, 10], emoji: '👼', image: 'assets/fish/melek_baligi.png', unlockLevel: 8 },
        'amano_karides': { id: 'amano_karides', name: 'Amano Karidesi', category: 'Karides', rarity: 'Yaygın', basePrice: 150, size: 'Mini', lifespanDays: [15, 25], emoji: '🦐', image: 'assets/fish/amano_karides.png', unlockLevel: 5 },
        'mavi_melek': { id: 'mavi_melek', name: 'Mavi Melek Karides', category: 'Karides', rarity: 'Yaygın', basePrice: 180, size: 'Mini', lifespanDays: [10, 15], emoji: '🦋', image: 'assets/fish/mavi_melek.png', unlockLevel: 6 },
        'panda_copcu': { id: 'panda_copcu', name: 'Panda Çöpçü', category: 'Balık', rarity: 'Yaygın', basePrice: 170, size: 'Mini', lifespanDays: [8, 12], emoji: '🐼', image: 'assets/fish/panda_copcu.png', unlockLevel: 6 },
        'kuhli': { id: 'kuhli', name: 'Kuhli (Yılan Balığı)', category: 'Balık', rarity: 'Sıradışı', basePrice: 200, size: 'Küçük', lifespanDays: [15, 20], emoji: '🐍', image: 'assets/fish/kuhli.png', unlockLevel: 7 },
        'bal_gurami': { id: 'bal_gurami', name: 'Bal Gurami', category: 'Balık', rarity: 'Sıradışı', basePrice: 230, size: 'Küçük', lifespanDays: [7, 11], emoji: '🍯', image: 'assets/fish/bal_gurami.png', unlockLevel: 8 },
        
        'cuce_vatoz': { id: 'cuce_vatoz', name: 'Cüce Vatoz', category: 'Balık', rarity: 'Sıradışı', basePrice: 350, size: 'Küçük', lifespanDays: [15, 22], emoji: '🦇', unlockLevel: 9, image: 'assets/fish/cuce_vatoz.png' },
        'ramirezi': { id: 'ramirezi', name: 'Ramirezi', category: 'Balık', rarity: 'Sıradışı', basePrice: 400, size: 'Küçük', lifespanDays: [8, 12], emoji: '🦋', unlockLevel: 9, image: 'assets/fish/ramirezi.png' },
        'kribensis': { id: 'kribensis', name: 'Kribensis', category: 'Balık', rarity: 'Nadir', basePrice: 450, size: 'Küçük', lifespanDays: [10, 14], emoji: '🐠', unlockLevel: 10, image: 'assets/fish/kribensis.png' },
        'palyaco': { id: 'palyaco', name: 'Palyaço Balığı', category: 'Balık', rarity: 'Nadir', basePrice: 500, size: 'Küçük', lifespanDays: [9, 14], emoji: '🤡', unlockLevel: 10, image: 'assets/fish/palyaco_baligi.png' },
        'cuce_puffer': { id: 'cuce_puffer', name: 'Cüce Puffer', category: 'Balık', rarity: 'Nadir', basePrice: 1500, size: 'Mini', lifespanDays: [10, 16], emoji: '🐡', unlockLevel: 12, image: 'assets/fish/cuce_puffer.png' },
        'cam_kedi': { id: 'cam_kedi', name: 'Cam Kedibalığı', category: 'Balık', rarity: 'Nadir', basePrice: 2200, size: 'Küçük', lifespanDays: [15, 25], emoji: '🧊', unlockLevel: 12, image: 'assets/fish/cam_kedi.png' },
        
        'discus': { id: 'discus', name: 'Discus', category: 'Balık', rarity: 'Nadir', basePrice: 2500, size: 'Orta', lifespanDays: [12, 18], emoji: '🥏', unlockLevel: 13, image: 'assets/fish/discus.png' },
        'vahsi_beta': { id: 'vahsi_beta', name: 'Vahşi Beta (Macrostoma)', category: 'Balık', rarity: 'Destansı', basePrice: 5000, size: 'Küçük', lifespanDays: [25, 40], emoji: '🐉', unlockLevel: 14, image: 'assets/fish/vahsi_beta.png' },
        
        'zebra_pleco': { id: 'zebra_pleco', name: 'Zebra Pleco (L46)', category: 'Balık', rarity: 'Destansı', basePrice: 6500, size: 'Küçük', lifespanDays: [20, 28], emoji: '🦓', unlockLevel: 15, image: 'assets/fish/zebra_pleco.png' },
        'mandarin': { id: 'mandarin', name: 'Mandarin Balığı', category: 'Balık', rarity: 'Destansı', basePrice: 8000, size: 'Küçük', lifespanDays: [22, 35], emoji: '🌈', unlockLevel: 16, image: 'assets/fish/mandarin.png' },
        
        'altum_melek': { id: 'altum_melek', name: 'Altum Melek Balığı', category: 'Balık', rarity: 'Destansı', basePrice: 10000, size: 'Orta', lifespanDays: [22, 30], emoji: '👼', unlockLevel: 17, image: 'assets/fish/altum_melek.png' },
        'deniz_ati': { id: 'deniz_ati', name: 'Hipokampüs (Deniz Atı)', category: 'Balık', rarity: 'Destansı', basePrice: 45000, size: 'Küçük', lifespanDays: [30, 50], emoji: '🎠', unlockLevel: 18, image: 'assets/fish/deniz_ati.png' },

        // KOZMİK SEVİYE (En Üst Nadirlik)
        'orkun_exe': { id: 'orkun_exe', name: 'Orkun.exe Balığı', category: 'Balık', rarity: 'Efsanevi', basePrice: 200000, size: 'Büyük', scale: 1.5, lifespanDays: [100, 200], emoji: '👾', unlockLevel: 19, image: 'assets/fish/orkun_exe.png?v=2' },
        'ece_gece': { id: 'ece_gece', name: 'Ece Gece Balığı', category: 'Balık', rarity: 'Efsanevi', basePrice: 200000, size: 'Küçük', scale: 1.6, lifespanDays: [100, 200], emoji: '🌌', unlockLevel: 19, image: 'assets/fish/ece_gece.png?v=2' },
        'viski_poodle': { id: 'viski_poodle', name: 'Viski Poodle Balığı', category: 'Balık', rarity: 'Efsanevi', basePrice: 200000, size: 'Küçük', scale: 1.4, lifespanDays: [100, 200], emoji: '🐩', unlockLevel: 19, image: 'assets/fish/viski_poodle.png?v=6' },

        'siyah_neon': { id: 'siyah_neon', name: 'Siyah Neon Tetra', category: 'Balık', rarity: 'Sıradan', basePrice: 35, size: 'Mini', lifespanDays: [6, 9], emoji: '🐟', unlockLevel: 2, image: 'assets/fish/siyah_neon.png' },
        'kirmizi_burun': { id: 'kirmizi_burun', name: 'Kırmızı Burun Tetra', category: 'Balık', rarity: 'Sıradan', basePrice: 45, size: 'Mini', lifespanDays: [5, 8], emoji: '🔴', unlockLevel: 3, image: 'assets/fish/kirmizi_burun.png' },
        'rasbora': { id: 'rasbora', name: 'Harlequin Rasbora', category: 'Balık', rarity: 'Sıradan', basePrice: 55, size: 'Mini', lifespanDays: [6, 10], emoji: '🐠', unlockLevel: 3, image: 'assets/fish/rasbora.png' },
        'helena': { id: 'helena', name: 'Katil Salyangoz', category: 'Salyangoz', rarity: 'Sıradan', basePrice: 40, size: 'Mini', lifespanDays: [10, 15], emoji: '🐌', unlockLevel: 4, image: 'assets/fish/helena.png' },
        'minare_salyangoz': { id: 'minare_salyangoz', name: 'Minare Salyangozu', category: 'Salyangoz', rarity: 'Sıradan', basePrice: 15, size: 'Mini', lifespanDays: [12, 20], emoji: '🐚', unlockLevel: 1, image: 'assets/fish/minare_salyangoz.png' },
        'hayalet_karides': { id: 'hayalet_karides', name: 'Hayalet Karides', category: 'Karides', rarity: 'Sıradan', basePrice: 25, size: 'Mini', lifespanDays: [8, 12], emoji: '👻', unlockLevel: 2, image: 'assets/fish/hayalet_karides.png' },
        'sari_ates': { id: 'sari_ates', name: 'Sarı Ateş Karides', category: 'Karides', rarity: 'Sıradan', basePrice: 50, size: 'Mini', lifespanDays: [10, 15], emoji: '💛', unlockLevel: 3, image: 'assets/fish/sari_ates.png' },
        'kaplan_karides': { id: 'kaplan_karides', name: 'Kaplan Karides', category: 'Karides', rarity: 'Yaygın', basePrice: 150, size: 'Mini', lifespanDays: [12, 18], emoji: '🐅', unlockLevel: 6, image: 'assets/fish/kaplan_karides.png' },
        'cuce_copcu': { id: 'cuce_copcu', name: 'Cüce Çöpçü', category: 'Balık', rarity: 'Sıradan', basePrice: 65, size: 'Mini', lifespanDays: [8, 12], emoji: '🧹', unlockLevel: 4, image: 'assets/fish/cuce_copcu.png' },
        'julii_copcu': { id: 'julii_copcu', name: 'Julii Çöpçü', category: 'Balık', rarity: 'Yaygın', basePrice: 140, size: 'Mini', lifespanDays: [10, 15], emoji: '🐆', unlockLevel: 6, image: 'assets/fish/julii_copcu.png' },
        'sterbai_copcu': { id: 'sterbai_copcu', name: 'Sterbai Çöpçü', category: 'Balık', rarity: 'Nadir', basePrice: 450, size: 'Küçük', lifespanDays: [12, 18], emoji: '🟠', unlockLevel: 9, image: 'assets/fish/sterbai_copcu.png' },
        'penguen_tetra': { id: 'penguen_tetra', name: 'Penguen Tetra', category: 'Balık', rarity: 'Yaygın', basePrice: 110, size: 'Küçük', lifespanDays: [6, 9], emoji: '🐧', unlockLevel: 5, image: 'assets/fish/penguen_tetra.png' },
        'limon_tetra': { id: 'limon_tetra', name: 'Limon Tetra', category: 'Balık', rarity: 'Yaygın', basePrice: 130, size: 'Mini', lifespanDays: [6, 10], emoji: '🍋', unlockLevel: 6, image: 'assets/fish/limon_tetra.png' },
        'kiraz_barb': { id: 'kiraz_barb', name: 'Kiraz Barb', category: 'Balık', rarity: 'Yaygın', basePrice: 160, size: 'Küçük', lifespanDays: [7, 11], emoji: '🍒', unlockLevel: 7, image: 'assets/fish/kiraz_barb.png' },
        'kaplan_barb': { id: 'kaplan_barb', name: 'Kaplan Barb', category: 'Balık', rarity: 'Yaygın', basePrice: 180, size: 'Küçük', lifespanDays: [7, 12], emoji: '🐅', unlockLevel: 7, image: 'assets/fish/kaplan_barb.png' },
        'mavi_gurami': { id: 'mavi_gurami', name: 'Mavi Gurami', category: 'Balık', rarity: 'Sıradışı', basePrice: 220, size: 'Orta', lifespanDays: [8, 14], emoji: '🔵', unlockLevel: 8, image: 'assets/fish/mavi_gurami.png' },
        'altin_elma': { id: 'altin_elma', name: 'Altın Elma Salyangozu', category: 'Salyangoz', rarity: 'Sıradışı', basePrice: 300, size: 'Mini', lifespanDays: [15, 25], emoji: '🟡', unlockLevel: 9, image: 'assets/fish/altin_elma.png' },
        'kanli_tetra': { id: 'kanli_tetra', name: 'Kanlı Tetra', category: 'Balık', rarity: 'Yaygın', basePrice: 175, size: 'Küçük', lifespanDays: [6, 10], emoji: '🩸', unlockLevel: 7, image: 'assets/fish/kanli_tetra.png' },
        'gokkusagi_baligi': { id: 'gokkusagi_baligi', name: 'Gökkuşağı Balığı', category: 'Balık', rarity: 'Nadir', basePrice: 850, size: 'Orta', lifespanDays: [10, 15], emoji: '🌈', unlockLevel: 11, image: 'assets/fish/gokkusagi_baligi.png' },
        'brikardi': { id: 'brikardi', name: 'Prenses Cichlid', category: 'Balık', rarity: 'Nadir', basePrice: 650, size: 'Küçük', lifespanDays: [12, 18], emoji: '👑', unlockLevel: 10, image: 'assets/fish/brikardi.png' }
    },

    // Konuşma Balonu Mesajları
    CHATTER_MESSAGES: {
        HUNGRY: ["Açlıktan öleceğim!", "Yem yok mu?", "Midem gurulduyor...", "Lütfen biraz yem!", "Çok açım!", "Açlıktan yüzemiyorum..."],
        HAPPY: ["Burası harika!", "Sizi çok seviyorum!", "Suyun tadı enfes!", "Bugün çok enerjiğim!", "Glub glub... :)", "Yüzmek ne güzel!"],
        SAD: ["Kimse beni sevmiyor...", "Çok sıkıcı...", "Biraz ilgi lütfen...", "Burada yalnız hissediyorum.", "Üzgünüm..."],
        RANDOM: ["Baloncuklara bayılıyorum!", "Şu cama vurmayın lütfen.", "Ben bir balığım!", "Akvaryumun en güzeli benim!", "Bugün ne kadar da güzel bir gün.", "Tuzlu su mu tatlı su mu?", "Yüz, yüz, hep aynı..."]
    },

    // Sürpriz Kutular (Gacha)
    BOXES: {
        'box_common': { id: 'box_common', name: 'Sıradan Kutu', emoji: '📦', image: 'assets/chest/chest_gray.png', price: 100, filters: { rarity: ['Sıradan'] }, desc: 'Sadece sıradan canlılar çıkar.' },
        'box_uncommon': { id: 'box_uncommon', name: 'Yaygın Kutu', emoji: '🎁', image: 'assets/chest/chest_green.png', price: 250, filters: { rarity: ['Sıradan', 'Yaygın'] }, desc: 'Yaygın canlılar çıkma ihtimali yüksek.' },
        'box_rare': { id: 'box_rare', name: 'Nadir Kutu', emoji: '✨', image: 'assets/chest/chest_blue.png', price: 800, filters: { rarity: ['Yaygın', 'Sıradışı', 'Nadir'] }, desc: 'Şanslıysanız nadir canlılar bulabilirsiniz.' },
        'box_epic': { id: 'box_epic', name: 'Sıradışı Kutu', emoji: '🌟', image: 'assets/chest/chest_purple.png', price: 3000, filters: { rarity: ['Sıradışı', 'Nadir', 'Destansı'] }, desc: 'Gerçekten değerli canlılar içerir.' },
        'box_legendary': { id: 'box_legendary', name: 'Destansı Kutu', emoji: '👑', image: 'assets/chest/chest_pink.png', price: 10000, filters: { rarity: ['Destansı'] }, desc: 'Destansı canlılardan biri garanti.' },
        'box_mythic': { id: 'box_mythic', name: 'Efsanevi Kutu', emoji: '💎', image: 'assets/chest/chest_yellow.png', price: 50000, filters: { rarity: ['Destansı', 'Efsanevi'] }, desc: 'Sadece en efsanevi varlıkları içerir.' },
        'box_snail': { id: 'box_snail', name: 'Salyangoz Kutusu', emoji: '🐌', image: 'assets/chest/chest_salyangoz.png', price: 500, filters: { category: ['Salyangoz'] }, desc: 'Sadece salyangoz türleri çıkar.' },
        'box_shrimp': { id: 'box_shrimp', name: 'Karides Kutusu', emoji: '🦐', image: 'assets/chest/chest_karides.png', price: 800, filters: { category: ['Karides'] }, desc: 'Sadece karides türleri çıkar.' },
        'box_mini_fish': { id: 'box_mini_fish', name: 'Mini Balık Kutusu', emoji: '🐟', image: 'assets/chest/chest_küçükbalık.png', price: 800, filters: { category: ['Balık'], size: ['Mini'] }, desc: 'Sadece Mini boyuttaki balıklar çıkar.' },
        'box_crab': { id: 'box_crab', name: 'Yengeç Kutusu', emoji: '🦀', image: 'assets/chest/chest_yengeç.png', price: 1000, filters: { category: ['Yengeç'] }, desc: 'Sadece yengeç türleri çıkar.' },
        'box_big_fish': { id: 'box_big_fish', name: 'Büyük Balık Kutusu', emoji: '🐡', image: 'assets/chest/chest_büyükbalık.png', price: 2000, filters: { category: ['Balık'], size: ['Küçük', 'Orta', 'Büyük', 'Dev'] }, desc: 'Daha iri balıklar (Küçük, Orta vb.) çıkar.' },
        'box_exotic_fish': { id: 'box_exotic_fish', name: 'Egzotik Balık Kutusu', emoji: '✨', image: 'assets/chest/chest_egzotik.png', price: 5000, filters: { category: ['Balık'], rarity: ['Sıradışı', 'Nadir', 'Destansı', 'Efsanevi'] }, desc: 'Sadece Sıradışı ve daha nadir balıklar çıkar.' }
    },

    // Yemler
    FOODS: {
        'temel_pul_yem': { id: 'temel_pul_yem', name: 'Temel Pul Yem', image: 'assets/foods/temel_pul_yem.png?v=4', quality: 1, basePrice: 5, portions: 5, hungerRestore: 15, happinessRestore: 2 },
        'su_piresi': { id: 'su_piresi', name: 'Su Piresi', image: 'assets/foods/su_piresi.png?v=4', quality: 2, basePrice: 10, portions: 8, hungerRestore: 20, happinessRestore: 5 },
        'kaliteli_pul_yem': { id: 'kaliteli_pul_yem', name: 'Kaliteli Pul Yem', image: 'assets/foods/kaliteli_pul_yem.png?v=4', quality: 3, basePrice: 15, portions: 10, hungerRestore: 25, happinessRestore: 8 },
        'karides_kurusu': { id: 'karides_kurusu', name: 'Karides Kurusu', image: 'assets/foods/karides_kurusu.png?v=4', quality: 4, basePrice: 45, portions: 15, hungerRestore: 40, happinessRestore: 15 },
        'kraliyet_ziyafeti': { id: 'kraliyet_ziyafeti', name: 'Kraliyet Ziyafeti', image: 'assets/foods/kraliyet_ziyafeti.png?v=4', quality: 5, basePrice: 250, portions: 50, hungerRestore: 100, happinessRestore: 50 }
    },

    // Boyuta göre porsiyon tüketimi
    PORTION_CONSUMPTION: {
        'Mini': 1,
        'Küçük': 3,
        'Orta': 6,
        'Büyük': 12,
        'Dev': 25
    },

    // Boyuta göre maksimum açlık kapasitesi
    MAX_HUNGER: {
        'Mini': 50,
        'Küçük': 100,
        'Orta': 200,
        'Büyük': 350,
        'Dev': 500
    },

    // Sağlık Eşyaları
    HEALTH_ITEMS: {
        'vitamin': { id: 'vitamin', name: 'Vitamin Damlası', image: 'assets/items/vitamin.png', basePrice: 15, healthRestore: 10 },
        'antibiyotik': { id: 'antibiyotik', name: 'Balık Antibiyotiği', image: 'assets/items/antibiyotik.png', basePrice: 50, healthRestore: 40 },
        'mucize_iksir': { id: 'mucize_iksir', name: 'Mucize İksir', image: 'assets/items/mucize_iksir.png', basePrice: 200, healthRestore: 100 }
    },

    // Sevgi & Mutluluk
    LOVE_HAPPINESS_ITEMS: {
        'kalp_keki': { id: 'kalp_keki', name: 'Küçük Kalp Keki', image: 'assets/items/kalp_keki.png', type: 'love', basePriceTest: 150, basePriceHard: 500, value: 1 },
        'buyuk_kalp_keki': { id: 'buyuk_kalp_keki', name: 'Büyük Kalp Keki', image: 'assets/items/buyuk_kalp_keki.png', type: 'love', basePriceTest: 400, basePriceHard: 1350, value: 3 },
        'hafif_serum': { id: 'hafif_serum', name: 'Hafif Serum', image: 'assets/items/hafif_serum.png', type: 'happiness', basePriceTest: 100, basePriceHard: 350, value: 10 },
        'yogun_serum': { id: 'yogun_serum', name: 'Yoğun Mutluluk Serumu', image: 'assets/items/yogun_serum.png', type: 'happiness', basePriceTest: 300, basePriceHard: 1000, value: 40 }
    },

    // Dekorasyonlar
    DECORATIONS: {
        'kucuk_tas': { id: 'kucuk_tas', name: 'Küçük Taş', emoji: '🪨', basePrice: 50, buffType: 'none', buffValue: 0, scale: 1.0, desc: 'Akvaryuma doğal bir hava katar.' },
        'yosun': { id: 'yosun', name: 'Su Yosunu', emoji: '🌿', basePrice: 200, buffType: 'water', buffValue: 10, scale: 1.5, desc: 'Su kirlenmesini yavaşlatır.' },
        'denizalti': { id: 'denizalti', name: 'Batık Denizaltı', emoji: '🚢', basePrice: 800, buffType: 'happiness', buffValue: 5, scale: 2.0, desc: 'Balıkların daha mutlu olmasını sağlar.' },
        'hazine': { id: 'hazine', name: 'Hazine Sandığı', emoji: '💎', basePrice: 2500, buffType: 'income', buffValue: 10, scale: 1.2, desc: 'Ekstra pasif gelir kazandırır.' },
        'sato': { id: 'sato', name: 'Denizaltı Şatosu', emoji: '🏰', basePrice: 8000, buffType: 'all', buffValue: 15, scale: 3.5, desc: 'Tüm özellikleri olumlu etkiler!' }
    }
};
