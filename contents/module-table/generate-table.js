// Module data - easy to reorder and maintain
const moduleData = {
    "Productivity": [
        { tier: 1, quality: 'normal', bonus: 4 },
        { tier: 1, quality: 'uncommon', bonus: 5 },
        { tier: 2, quality: 'normal', bonus: 6 },
        { tier: 1, quality: 'rare', bonus: 6 },
        { tier: 2, quality: 'uncommon', bonus: 7 },
        { tier: 1, quality: 'epic', bonus: 7 },
        { tier: 2, quality: 'rare', bonus: 9 },
        { tier: 3, quality: 'normal', bonus: 10 },
        { tier: 1, quality: 'legendary', bonus: 10 },
        { tier: 2, quality: 'epic', bonus: 11 },
        { tier: 3, quality: 'uncommon', bonus: 13 },
        { tier: 2, quality: 'legendary', bonus: 15 },
        { tier: 3, quality: 'rare', bonus: 16 },
        { tier: 3, quality: 'epic', bonus: 19 },
        { tier: 3, quality: 'legendary', bonus: 25 },
    ],
    "Speed": [
        { tier: 1, quality: 'normal', bonus: 20 },
        { tier: 1, quality: 'uncommon', bonus: 26 },
        { tier: 2, quality: 'normal', bonus: 30 },
        { tier: 1, quality: 'rare', bonus: 32 },
        { tier: 1, quality: 'epic', bonus: 38 },
        { tier: 2, quality: 'uncommon', bonus: 39 },
        { tier: 2, quality: 'rare', bonus: 48 },
        { tier: 3, quality: 'normal', bonus: 50 },
        { tier: 1, quality: 'legendary', bonus: 50 },
        { tier: 2, quality: 'epic', bonus: 57 },
        { tier: 3, quality: 'uncommon', bonus: 65 },
        { tier: 2, quality: 'legendary', bonus: 75 },
        { tier: 3, quality: 'rare', bonus: 80 },
        { tier: 3, quality: 'epic', bonus: 95 },
        { tier: 3, quality: 'legendary', bonus: 125 },
    ],
    "Quality": [
        { tier: 1, quality: 'normal', bonus: 1 },
        { tier: 1, quality: 'uncommon', bonus: 1.3 },
        { tier: 1, quality: 'rare', bonus: 1.6 },
        { tier: 1, quality: 'epic', bonus: 1.9 },
        { tier: 2, quality: 'normal', bonus: 2 },
        { tier: 3, quality: 'normal', bonus: 2.5 },
        { tier: 1, quality: 'legendary', bonus: 2.5 },
        { tier: 2, quality: 'uncommon', bonus: 2.6 },
        { tier: 3, quality: 'uncommon', bonus: 3.2 },
        { tier: 2, quality: 'rare', bonus: 3.2 },
        { tier: 2, quality: 'epic', bonus: 3.8 },
        { tier: 3, quality: 'rare', bonus: 4 },
        { tier: 3, quality: 'epic', bonus: 4.7 },
        { tier: 2, quality: 'legendary', bonus: 5 },
        { tier: 3, quality: 'legendary', bonus: 6.2 },
    ],
    "Efficiency": [
        { tier: 1, quality: 'normal', bonus: -30 },
        { tier: 1, quality: 'uncommon', bonus: -39 },
        { tier: 2, quality: 'normal', bonus: -40 },
        { tier: 1, quality: 'rare', bonus: -48 },
        { tier: 3, quality: 'normal', bonus: -50 },
        { tier: 2, quality: 'uncommon', bonus: -52 },
        { tier: 1, quality: 'epic', bonus: -57 },
        { tier: 2, quality: 'rare', bonus: -64 },
        { tier: 3, quality: 'uncommon', bonus: -65 },
        { tier: 1, quality: 'legendary', bonus: -75 },
        { tier: 2, quality: 'epic', bonus: -76 },
        { tier: 3, quality: 'rare', bonus: -80 },
        { tier: 3, quality: 'epic', bonus: -95 },
        { tier: 2, quality: 'legendary', bonus: -100 },
        { tier: 3, quality: 'legendary', bonus: -125 },
    ]
};

function generateModuleTable() {
    const tbody = document.getElementById('moduleTableBody');
    tbody.innerHTML = '';

    for(let index=0; index<moduleData.Productivity.length; index++) {
        const row = document.createElement('tr');
        for(let moduleType of [ "Productivity", "Speed", "Quality", "Efficiency" ]) {
            const module = moduleData[moduleType][index];
            const baseName = moduleType + "_module";

            const cell = document.createElement('td');
            // Determine CSS class based on tier
            const cellClass = module.tier === 1 ? '' : `tier-${module.tier}`;
        
            const moduleCell = document.createElement('div');
            moduleCell.className = `module-cell ${cellClass}`;
            
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            
            const imageContainer = document.createElement('div');
            imageContainer.className = 'entity-image-container';
            
            const img = document.createElement('img');
            const tierSuffix = module.tier > 1 ? `_${module.tier}` : '';
            img.src = `https://wiki.factorio.com/images/thumb/${baseName}${tierSuffix}.png/32px-${baseName}${tierSuffix}.png`;
            img.alt = `${module.quality} ${moduleType} module${module.tier > 1 ? ` ${module.tier}` : ''}`;
            img.className = 'entity-image';
            img.onerror = "this.style.display='none'";
            
            imageContainer.appendChild(img);
            
            // Add quality overlay if not normal
            if (module.quality.toLowerCase() !== 'normal') {
                const qualityOverlay = document.createElement('div');
                qualityOverlay.className = 'quality-overlay';
                const qualityImg = document.createElement('img');
                qualityImg.src = `https://wiki.factorio.com/images/Quality_${module.quality.toLowerCase()}.png`;
                qualityImg.alt = module.quality.toLowerCase();
                qualityImg.onerror = "this.style.display='none'";
                qualityOverlay.appendChild(qualityImg);
                imageContainer.appendChild(qualityOverlay);
            }
            
            const tooltipText = document.createElement('span');
            tooltipText.className = 'tooltiptext';
            tooltipText.textContent = `${module.quality} ${moduleType} module${module.tier > 1 ? ` ${module.tier}` : ''}`;
            
            tooltip.appendChild(imageContainer);
            tooltip.appendChild(tooltipText);
            
            const bonus = document.createElement('div');
            bonus.className = 'module-bonus';
            bonus.textContent = `${module.bonus > 0 ? '+' : ''}${module.bonus}%`;
            
            moduleCell.appendChild(tooltip);
            moduleCell.appendChild(bonus);
            cell.appendChild(moduleCell);
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
    }
}
