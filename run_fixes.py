import os
import re

game_js_path = r'E:\Gravity Project\akvaryum-oyunu\akvaryum-oyunu\js\game.js'
with open(game_js_path, 'r', encoding='utf-8') as f:
    game_js = f.read()

# 1. Add noload logic
game_js = re.sub(
    r'if \(loadingOverlay && loadingFill\) \{\s*let progress = 0;',
    '''if (loadingOverlay && loadingFill) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('noload') === '1') {
                loadingOverlay.remove();
            } else {
                let progress = 0;''',
    game_js
)

game_js = re.sub(
    r'setTimeout\(loadStep, 300\);\s*\}',
    '''setTimeout(loadStep, 300);
            }
        }''',
    game_js,
    count=1
)

# 2. Fix water decay logic
game_js = re.sub(
    r'let waterDecayRate = 1;\s*if \(numCreatures > 5 && numCreatures <= 10\) waterDecayRate = 1\.5;\s*else if \(numCreatures > 10 && numCreatures <= 20\) waterDecayRate = 2;\s*else if \(numCreatures > 20\) waterDecayRate = 3;\s*// Ger.*?data\.waterQuality -= baseWaterDecay;',
    '''let waterDecayRate = 1;
    if (numCreatures > 5 && numCreatures <= 10) waterDecayRate = 1.2;
    else if (numCreatures > 10 && numCreatures <= 20) waterDecayRate = 1.5;
    else if (numCreatures > 20) waterDecayRate = 2.0;

    const realElapsedMinutes = elapsedMs / 60000;
    
    // 24 saatte (1440 dk) 100 kirlilik azalması = dakikada ~0.0694. 
    let baseWaterDecay = 0.0694 * waterDecayRate * realElapsedMinutes;
    
    // Dekorasyon bonusu
    if (waterBuff > 0) {
        baseWaterDecay = baseWaterDecay * (1 - (waterBuff / 100));
        if (baseWaterDecay < 0) baseWaterDecay = 0;
    }
    
    data.waterQuality -= baseWaterDecay;''',
    game_js,
    flags=re.DOTALL
)

with open(game_js_path, 'w', encoding='utf-8') as f:
    f.write(game_js)

# 3. Economy.js
eco_js_path = r'E:\Gravity Project\akvaryum-oyunu\akvaryum-oyunu\js\economy.js'
with open(eco_js_path, 'r', encoding='utf-8') as f:
    eco_js = f.read()

eco_js = eco_js.replace('income = isHardMode ? (config.basePrice * 0.05) : (config.basePrice * 0.1);', 'income = isHardMode ? (config.basePrice * 0.001) : (config.basePrice * 0.003);')

with open(eco_js_path, 'w', encoding='utf-8') as f:
    f.write(eco_js)

# 4. Links in market.js, inventory.js, collection.html
for p in [r'E:\Gravity Project\akvaryum-oyunu\akvaryum-oyunu\js\market.js', r'E:\Gravity Project\akvaryum-oyunu\akvaryum-oyunu\js\inventory.js', r'E:\Gravity Project\akvaryum-oyunu\akvaryum-oyunu\collection.html']:
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("window.location.href = 'game.html'", "window.location.href = 'game.html?noload=1'")
    content = content.replace("window.location.href='game.html'", "window.location.href='game.html?noload=1'")
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done")
