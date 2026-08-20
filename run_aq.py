import os
import re

file_path = r'E:\Gravity Project\akvaryum-oyunu\akvaryum-oyunu\js\aquarium.js'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace resize logic
resize_new = '''    resize() {
        const container = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = container.clientWidth * dpr;
        this.canvas.height = container.clientHeight * dpr;
        this.canvas.style.width = container.clientWidth + 'px';
        this.canvas.style.height = container.clientHeight + 'px';
        
        this.decCanvas.width = container.clientWidth * dpr;
        this.decCanvas.height = container.clientHeight * dpr;
        this.decCanvas.style.width = container.clientWidth + 'px';
        this.decCanvas.style.height = container.clientHeight + 'px';
        
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.decCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        this.renderDecorations();
    }'''
code = re.sub(r'    resize\(\) \{[\s\S]*?this\.renderDecorations\(\);\s*\}', resize_new, code)

# Update mouse click scaling
hit_new = '''            const px = (c.x / 100) * (this.canvas.width / (window.devicePixelRatio || 1));
            const py = (c.y / 100) * (this.canvas.height / (window.devicePixelRatio || 1));'''
code = code.replace('const px = (c.x / 100) * this.canvas.width;\n            const py = (c.y / 100) * this.canvas.height;', hit_new)

# Update decoration hit logic
hit_dec = '''            const px = (d.x / 100) * (this.canvas.width / (window.devicePixelRatio || 1));
            const py = (d.y / 100) * (this.canvas.height / (window.devicePixelRatio || 1));'''
code = code.replace('const px = (d.x / 100) * this.canvas.width;\n            const py = (d.y / 100) * this.canvas.height;', hit_dec)

# Render fish using images instead of emojis
fish_render = '''                // Balığı çiz
                const sizeConfig = { 'Mini': 60, 'Küçük': 80, 'Orta': 120, 'Büyük': 180, 'Dev': 250 };
                const sizePx = sizeConfig[c.size] || 80;
                
                if (config.image && this.imageCache[config.id]) {
                    const img = this.imageCache[config.id];
                    if (img.complete) {
                        this.ctx.drawImage(img, -sizePx/2, -sizePx/2, sizePx, sizePx);
                    }
                } else {
                    const fontSize = sizePx * 0.8;
                    this.ctx.font = fontSize + "px Arial";
                    this.ctx.textAlign = "center";
                    this.ctx.textBaseline = "middle";
                    this.ctx.fillText(config.emoji, 0, 0);
                }'''
code = re.sub(r'                const fontSize = 60 \* config\.scale;[\s\S]*?this\.ctx\.fillText\(config\.emoji, 0, 0\);', fish_render, code)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
