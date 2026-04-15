const fs = require('fs');
const path = require('path');
const { read, write } = require('./storage');

const imgsDir = './public/imgs';
const cardsFile = './data/cards.json';

function getRandomAttribute() {
    return Math.floor(Math.random() * 10) + 1;
}

function generateCardName(filename) {
    const base = path.basename(filename, path.extname(filename));
    return base.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function scanImagesDirectory() {
    try {
        if (!fs.existsSync(imgsDir)) {
            return;
        }

        const files = fs.readdirSync(imgsDir).filter(f => 
            /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
        );

        const cards = read(cardsFile);
        const existingImages = new Set(cards.map(c => c.image));
        let changed = false;

        files.forEach(file => {
            const imagePath = `imgs/${file}`;
            if (!existingImages.has(imagePath)) {
                const newCard = {
                    id: Math.floor(Date.now() / 1000) + Math.random(),
                    name: generateCardName(file),
                    price: 500,
                    image: imagePath,
                    beauty: getRandomAttribute(),
                    charm: getRandomAttribute(),
                    kind: getRandomAttribute()
                };
                cards.push(newCard);
                changed = true;
                console.log(`[CardScanner] Added new card: ${newCard.name} (${imagePath})`);
            }
        });

        if (changed) {
            write(cardsFile, cards);
        }
    } catch (e) {
        console.error('[CardScanner] Error:', e.message);
    }
}

function startScanner() {
    scanImagesDirectory();
    setInterval(scanImagesDirectory, 5 * 60 * 1000);
}

module.exports = { startScanner, scanImagesDirectory };
