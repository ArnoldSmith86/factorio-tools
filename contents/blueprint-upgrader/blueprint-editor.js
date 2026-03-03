class BlueprintEditor {
    constructor() {
        this.blueprintData = null;
        this.jsonString = '';
        this.searchResults = [];
        this.currentSearchIndex = 0;
        this.replaceButtons = [];
        this.activeFilters = new Set(['entities']); // Start with entities selected
        
        this.initializeElements();
        this.bindEvents();
        this.setupGlobalPaste();
        this.loadFromStorage();
        this.updateSectionVisibility();
        generateModuleTable();
    }
    
    initializeElements() {
        this.blueprintInput = document.getElementById('blueprintInput');
        this.jsonDisplay = document.getElementById('jsonDisplay');
        this.jsonStatus = document.getElementById('jsonStatus');
        this.searchInput = document.getElementById('searchInput');
        this.replaceInput = document.getElementById('replaceInput');
        this.searchResults = document.getElementById('searchResults');
        this.entityAnalysis = document.getElementById('entityAnalysis');
        this.exportStatus = document.getElementById('exportStatus');
        
        this.decodeBtn = document.getElementById('decodeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.searchBtn = document.getElementById('searchBtn');
        this.replaceBtn = document.getElementById('replaceBtn');
        this.replaceAllBtn = document.getElementById('replaceAllBtn');
        this.encodeBtn = document.getElementById('encodeBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.saveJsonBtn = document.getElementById('saveJsonBtn');
    }
    
    bindEvents() {
        this.decodeBtn.addEventListener('click', () => this.decodeBlueprint());
        this.saveJsonBtn.addEventListener('click', () => this.saveJson());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.searchBtn.addEventListener('click', () => this.search());
        this.replaceBtn.addEventListener('click', () => this.replace());
        this.replaceAllBtn.addEventListener('click', () => this.replaceAll());
        this.encodeBtn.addEventListener('click', () => this.encodeAndCopy());
        this.downloadBtn.addEventListener('click', () => this.downloadBlueprint());
        
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });
        
        // Auto-decode on input
        this.blueprintInput.addEventListener('input', () => {
            this.saveToStorage();
            if (this.blueprintInput.value.trim()) {
                this.decodeBlueprint();
            }
        });
        
        // Add filter button event listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.toggleFilter(e.target.dataset.filter);
                this.saveToStorage();
            }
        });
    }
    
    setupGlobalPaste() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'v' && document.activeElement === document.body) {
                e.preventDefault();
                navigator.clipboard.readText().then(text => {
                    this.blueprintInput.value = text;
                    this.blueprintInput.focus();
                    this.saveToStorage();
                    if (text.trim()) {
                        this.decodeBlueprint();
                    }
                }).catch(err => {
                    console.log('Could not read clipboard:', err);
                });
            }
        });
    }
    
    async decodeBlueprint() {
        const input = this.blueprintInput.value.trim();
        if (!input) {
            this.showError('Please enter a blueprint string');
            return;
        }
        
        try {
            this.blueprintData = decodeBlueprintString(input);
            this.jsonString = JSON.stringify(this.blueprintData, null, 2);
            
            this.displayJson();
            this.analyzeEntities();
            this.updateSectionVisibility();
            this.showSuccess('Blueprint decoded successfully!');
            
        } catch (error) {
            this.showError('Failed to decode blueprint: ' + error.message);
            console.error('Decode error:', error);
        }
    }
    
    displayJson() {
        this.jsonDisplay.value = this.jsonString;
        this.jsonStatus.textContent = `JSON size: ${this.jsonString.length} characters`;
    }
    
    saveJson() {
        const raw = this.jsonDisplay.value.trim();
        if (!raw) {
            this.showError('No JSON to save');
            return;
        }
        try {
            this.blueprintData = JSON.parse(raw);
            this.jsonString = JSON.stringify(this.blueprintData, null, 2);
            this.displayJson();
            this.analyzeEntities();
            this.showSuccess('JSON saved');
        } catch (e) {
            this.showError('Invalid JSON: ' + e.message);
        }
    }
    
    search() {
        const searchTerm = this.searchInput.value.trim();
        if (!searchTerm) {
            this.showError('Please enter a search term');
            return;
        }
        
        if (!this.jsonString) {
            this.showError('No JSON to search in. Please decode a blueprint first.');
            return;
        }
        
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = [...this.jsonString.matchAll(regex)];
        
        if (matches.length === 0) {
            this.searchResults.innerHTML = '<div class="error">No matches found</div>';
            return;
        }
        
        this.searchResults.innerHTML = `
            <div class="success">Found ${matches.length} match${matches.length === 1 ? '' : 'es'}</div>
            <div class="status">Click "Replace" to replace the first match, or "Replace All" to replace all matches</div>
        `;
        
        // Highlight first match
        this.highlightMatch(matches[0]);
    }
    
    highlightMatch(match) {
        this.jsonDisplay.setSelectionRange(match.index, match.index + match[0].length);
        this.jsonDisplay.focus();
    }
    
    replace() {
        const searchTerm = this.searchInput.value.trim();
        const replaceTerm = this.replaceInput.value;
        
        if (!searchTerm) {
            this.showError('Please enter a search term');
            return;
        }
        
        if (!this.jsonString) {
            this.showError('No JSON to search in. Please decode a blueprint first.');
            return;
        }
        
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const match = this.jsonString.match(regex);
        
        if (!match) {
            this.showError('No match found to replace');
            return;
        }
        
        this.jsonString = this.jsonString.replace(regex, replaceTerm);
        this.blueprintData = JSON.parse(this.jsonString);
        this.displayJson();
        this.showSuccess('Replacement completed');
    }
    
    replaceAll() {
        const searchTerm = this.searchInput.value.trim();
        const replaceTerm = this.replaceInput.value;
        
        if (!searchTerm) {
            this.showError('Please enter a search term');
            return;
        }
        
        if (!this.jsonString) {
            this.showError('No JSON to search in. Please decode a blueprint first.');
            return;
        }
        
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = [...this.jsonString.matchAll(regex)];
        
        if (matches.length === 0) {
            this.showError('No matches found to replace');
            return;
        }
        
        this.jsonString = this.jsonString.replace(regex, replaceTerm);
        this.blueprintData = JSON.parse(this.jsonString);
        this.displayJson();
        this.analyzeEntities();
        this.showSuccess(`Replaced ${matches.length} match${matches.length === 1 ? '' : 'es'}`);
    }
    
    async encodeAndCopy() {
        if (!this.blueprintData) {
            this.showError('No blueprint data to encode. Please decode a blueprint first.');
            return;
        }
        
        try {
            // Apply any active replacements
            const hadReplacements = this.applyReplacements();
            
            const blueprintString = encodeBlueprintData(this.blueprintData);
            
            // Copy to clipboard
            await navigator.clipboard.writeText(blueprintString);
            
            const message = hadReplacements ? 
                'Blueprint with replacements applied and copied to clipboard!' : 
                'Blueprint encoded and copied to clipboard!';
            this.showSuccess(message);
            
        } catch (error) {
            this.showError('Failed to encode blueprint: ' + error.message);
            console.error('Encode error:', error);
        }
    }
    
    downloadBlueprint() {
        if (!this.blueprintData) {
            this.showError('No blueprint data to download. Please decode a blueprint first.');
            return;
        }
        
        try {
            // Apply any active replacements
            const hadReplacements = this.applyReplacements();
            
            const blueprintString = encodeBlueprintData(this.blueprintData);
            
            // Create download
            const blob = new Blob([blueprintString], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'blueprint.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            const message = hadReplacements ? 
                'Blueprint with replacements applied and downloaded!' : 
                'Blueprint downloaded!';
            this.showSuccess(message);
            
        } catch (error) {
            this.showError('Failed to download blueprint: ' + error.message);
            console.error('Download error:', error);
        }
    }
    
    toggleFilter(filterType) {
        if (filterType === 'all') {
            // Toggle all filters
            const allFilters = ['entities', 'modules', 'recipes', 'conditions', 'requests'];
            const allActive = allFilters.every(filter => this.activeFilters.has(filter));
            
            if (allActive) {
                // If all are active, deactivate all
                this.activeFilters.clear();
            } else {
                // If not all are active, activate all
                allFilters.forEach(filter => this.activeFilters.add(filter));
            }
        } else {
            // Toggle individual filter
            if (this.activeFilters.has(filterType)) {
                this.activeFilters.delete(filterType);
            } else {
                this.activeFilters.add(filterType);
            }
        }
        
        // Update button states
        this.updateFilterButtons();
        this.analyzeEntities();
    }
    
    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const filterType = btn.dataset.filter;
            if (filterType === 'all') {
                const allFilters = ['entities', 'modules', 'recipes', 'conditions', 'requests'];
                const allActive = allFilters.every(filter => this.activeFilters.has(filter));
                btn.classList.toggle('active', allActive);
            } else {
                btn.classList.toggle('active', this.activeFilters.has(filterType));
            }
        });
    }
    
    analyzeEntities() {
        if (!this.blueprintData || !this.blueprintData.blueprint || !this.blueprintData.blueprint.entities) {
            this.entityAnalysis.innerHTML = '<div class="error">No entities found in blueprint</div>';
            return;
        }
        
        const entities = this.blueprintData.blueprint.entities;
        let dataToAnalyze = [];
        
        // Collect data from all active filters
        if (this.activeFilters.has('entities')) {
            dataToAnalyze = dataToAnalyze.concat(this.getEntityData(entities));
        }
        if (this.activeFilters.has('modules')) {
            dataToAnalyze = dataToAnalyze.concat(this.getModuleData(entities));
        }
        if (this.activeFilters.has('recipes')) {
            dataToAnalyze = dataToAnalyze.concat(this.getRecipeData(entities));
        }
        if (this.activeFilters.has('conditions')) {
            dataToAnalyze = dataToAnalyze.concat(this.getConditionData(entities));
        }
        if (this.activeFilters.has('requests')) {
            dataToAnalyze = dataToAnalyze.concat(this.getRequestData(entities));
        }
        
        if (dataToAnalyze.length === 0) {
            const activeFilterNames = Array.from(this.activeFilters).join(', ');
            this.entityAnalysis.innerHTML = `<div class="error">No data found for selected filters: ${activeFilterNames}</div>`;
            return;
        }
        
        // Count items by type, name, and quality
        const itemCounts = {};
        dataToAnalyze.forEach(item => {
            const key = `${item.type}_${item.name}_${item.quality}`;
            
            if (itemCounts[key]) {
                itemCounts[key].count++;
            } else {
                itemCounts[key] = {
                    name: item.name,
                    quality: item.quality,
                    count: 1,
                    type: item.type
                };
            }
        });
        
        // Sort items by count (descending)
        const sortedItems = Object.values(itemCounts)
            .sort((a, b) => b.count - a.count);
        
        // Clear existing replace buttons
        this.replaceButtons = [];
        
        // Generate table HTML
        let tableHTML = '<table class="entity-table">';
        tableHTML += '<thead><tr><th>Downgrade</th><th>Item</th><th>Upgrade</th><th>Count</th></tr></thead>';
        tableHTML += '<tbody>';
        
        sortedItems.forEach(item => {
            const imageUrl = toImageUrl(item.name);
            const qualityText = item.quality.charAt(0).toUpperCase() + item.quality.slice(1);
            const qualityImageUrl = qualityText === 'Normal' ? '' : qualityToImage(item.quality);
            const displayName = item.quality === 'normal' ? item.name : `${qualityText} ${item.name}`;
            
            tableHTML += `
                <tr>
                    <td class="downgrade-column" style="text-align: right;"></td>
                    <td>
                        <div class="tooltip">
                            <div class="entity-image-container">
                                <img src="${imageUrl}" alt="${item.name}" class="entity-image" onerror="this.style.display='none'">
                                <div class="quality-overlay">
                                    <img src="${qualityImageUrl}" alt="${qualityText}" onerror="this.style.display='none'">
                                </div>
                            </div>
                            <span class="tooltiptext">${displayName}</span>
                        </div>
                    </td>
                    <td class="upgrade-column"></td>
                    <td class="entity-count">${item.count}</td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table>';
        
        const totalItems = dataToAnalyze.length;
        const uniqueItemTypes = sortedItems.length;
        
        const activeFilterNames = Array.from(this.activeFilters).join(', ');
        this.entityAnalysis.innerHTML = `
            <div class="success">Found ${totalItems} items of ${uniqueItemTypes} different types (including quality variants) from: ${activeFilterNames}</div>
            ${tableHTML}
        `;
        
        // Create ReplaceButton instances for each row
        const tableRows = this.entityAnalysis.querySelectorAll('tbody tr');
        sortedItems.forEach((item, index) => {
            const row = tableRows[index];
            const fullEntityName = item.quality === 'normal' ? item.name : `${item.quality} ${item.name}`;
            
            let upgradePath, downgradeTargets, upgradeTargets;
            
            if (item.type === 'entity' || item.type === 'module') {
                // Use full upgrade paths for entities and modules
                upgradePath = this.findUpgradePath(fullEntityName);
                downgradeTargets = upgradePath ? this.getAllDowngradeTargets(fullEntityName, upgradePath) : [];
                upgradeTargets = upgradePath ? this.getAllUpgradeTargets(fullEntityName, upgradePath) : [];
            } else {
                // Use quality-only paths for recipes, conditions, and requests
                upgradePath = this.getQualityUpgradePath(item.name);
                downgradeTargets = this.getAllDowngradeTargets(fullEntityName, upgradePath);
                upgradeTargets = this.getAllUpgradeTargets(fullEntityName, upgradePath);
            }
            
            const currentEntityName = item.quality === 'normal' ? item.name : `${item.quality} ${item.name}`;
            
            // Create downgrade buttons
            const downgradeColumn = row.querySelector('.downgrade-column');
            downgradeTargets.forEach(target => {
                const replaceButton = new ReplaceButton(this, currentEntityName, target, row, item.type);
                replaceButton.render(downgradeColumn);
                this.replaceButtons.push(replaceButton);
            });
            
            // Create upgrade buttons
            const upgradeColumn = row.querySelector('.upgrade-column');
            upgradeTargets.forEach(target => {
                const replaceButton = new ReplaceButton(this, currentEntityName, target, row, item.type);
                replaceButton.render(upgradeColumn);
                this.replaceButtons.push(replaceButton);
            });
        });
    }
    
    
    getEntityData(entities) {
        return entities.map(entity => ({
            name: entity.name,
            quality: entity.quality || 'normal',
            type: 'entity'
        }));
    }
    
    getModuleData(entities) {
        const moduleData = [];
        entities.forEach(entity => {
            if (Array.isArray(entity.items)) {
                entity.items.forEach(item => {
                    if (item.id && item.id.name) {
                        moduleData.push({
                            name: item.id.name,
                            quality: item.id.quality || 'normal',
                            type: 'module'
                        });
                    }
                });
            }
        });
        return moduleData;
    }
    
    getRecipeData(entities) {
        const recipeData = [];
        entities.forEach(entity => {
            if (entity.recipe) {
                recipeData.push({
                    name: entity.recipe,
                    quality: entity.recipe_quality || 'normal',
                    type: 'recipe'
                });
            }
        });
        return recipeData;
    }
    
    getConditionData(entities) {
        const conditionData = [];
        entities.forEach(entity => {
            if (entity.control_behavior && entity.control_behavior.circuit_condition) {
                const condition = entity.control_behavior.circuit_condition;
                if (condition.first_signal && condition.first_signal.name) {
                    conditionData.push({
                        name: condition.first_signal.name,
                        quality: condition.first_signal.quality || 'normal',
                        type: 'condition'
                    });
                }
            }
        });
        return conditionData;
    }
    
    getRequestData(entities) {
        const requestData = [];
        entities.forEach(entity => {
            if (entity.request_filters && entity.request_filters.sections) {
                entity.request_filters.sections.forEach(section => {
                    if (section.filters) {
                        section.filters.forEach(filter => {
                            if (filter.name) {
                                requestData.push({
                                    name: filter.name,
                                    quality: filter.quality || 'normal',
                                    type: 'request'
                                });
                            }
                        });
                    }
                });
            }
        });
        return requestData;
    }
    
    findUpgradePath(entityName) {
        // Only look for exact match (including quality) for entities and modules
        return upgrade_paths.find(path => path.includes(entityName));
    }
    
    getQualityUpgradePath(itemName) {
        // For recipes, conditions, and requests, only provide quality variants
        const qualities = ['normal', 'uncommon', 'rare', 'epic', 'legendary'];
        return qualities.map(quality => quality === 'normal' ? itemName : `${quality} ${itemName}`);
    }
    
    getBaseEntityName(entityName) {
        // Remove quality prefix if present
        const parts = entityName.split(' ');
        if (parts.length > 1 && ['uncommon', 'rare', 'epic', 'legendary'].includes(parts[0])) {
            return parts.slice(1).join(' ');
        }
        return entityName;
    }
    
    getAllDowngradeTargets(entityName, upgradePath) {
        const currentIndex = upgradePath.indexOf(entityName);
        
        // Only proceed if exact match is found
        if (currentIndex === -1) {
            return [];
        }
        
        return currentIndex > 0 ? upgradePath.slice(0, currentIndex) : [];
    }
    
    getAllUpgradeTargets(entityName, upgradePath) {
        const currentIndex = upgradePath.indexOf(entityName);
        
        // Only proceed if exact match is found
        if (currentIndex === -1) {
            return [];
        }
        
        return currentIndex < upgradePath.length - 1 ? upgradePath.slice(currentIndex + 1) : [];
    }
    
    
    applyReplacements() {
        const replacements = this.replaceButtons
            .map(button => button.getReplacement())
            .filter(replacement => replacement !== null);
        
        if (replacements.length === 0) {
            return false; // No replacements to apply
        }
        
        if (!this.blueprintData || !this.blueprintData.blueprint || !this.blueprintData.blueprint.entities) {
            return false;
        }
        
        let modified = false;
        const entities = this.blueprintData.blueprint.entities;
        
        // Track specific changes to avoid double-processing
        const changeTracker = new Set();
        
        // Process each replacement
        replacements.forEach(replacement => {
            const { from, to, type } = replacement;
            
            // Parse the target item to extract quality and base name
            const targetParts = to.split(' ');
            let targetQuality = 'normal';
            let targetBaseName = to;
            
            if (targetParts.length > 1 && ['uncommon', 'rare', 'epic', 'legendary'].includes(targetParts[0])) {
                targetQuality = targetParts[0];
                targetBaseName = targetParts.slice(1).join(' ');
            }
            
            // Parse the source item
            const sourceParts = from.split(' ');
            let sourceQuality = 'normal';
            let sourceBaseName = from;
            
            if (sourceParts.length > 1 && ['uncommon', 'rare', 'epic', 'legendary'].includes(sourceParts[0])) {
                sourceQuality = sourceParts[0];
                sourceBaseName = sourceParts.slice(1).join(' ');
            }
            
            // Apply replacements based on data type
            entities.forEach((entity, entityIndex) => {
                switch (type) {
                    case 'entity':
                        if (this.replaceEntityData(entity, sourceBaseName, sourceQuality, targetBaseName, targetQuality, changeTracker, entityIndex)) {
                            modified = true;
                        }
                        break;
                    case 'module':
                        if (this.replaceModuleData(entity, sourceBaseName, sourceQuality, targetBaseName, targetQuality, changeTracker, entityIndex)) {
                            modified = true;
                        }
                        break;
                    case 'recipe':
                        if (this.replaceRecipeData(entity, sourceBaseName, sourceQuality, targetBaseName, targetQuality, changeTracker, entityIndex)) {
                            modified = true;
                        }
                        break;
                    case 'condition':
                        if (this.replaceConditionData(entity, sourceBaseName, sourceQuality, targetBaseName, targetQuality, changeTracker, entityIndex)) {
                            modified = true;
                        }
                        break;
                    case 'request':
                        if (this.replaceRequestData(entity, sourceBaseName, sourceQuality, targetBaseName, targetQuality, changeTracker, entityIndex)) {
                            modified = true;
                        }
                        break;
                }
            });
        });
        
        if (modified) {
            // Update the JSON string and refresh display
            this.jsonString = JSON.stringify(this.blueprintData, null, 2);
            this.displayJson();
            this.analyzeEntities();
        }
        
        return modified;
    }
    
    replaceEntityData(entity, sourceBaseName, sourceQuality, targetBaseName, targetQuality, changeTracker, entityIndex) {
        const entityQuality = entity.quality || 'normal';
        if (entity.name === sourceBaseName && entityQuality === sourceQuality) {
            const changeKey = `entity_${entityIndex}_name`;
            if (!changeTracker.has(changeKey)) {
                entity.name = targetBaseName;
                entity.quality = targetQuality;
                changeTracker.add(changeKey);
                return true;
            }
        }
        return false;
    }
    
    replaceModuleData(entity, sourceBaseName, sourceQuality, targetBaseName, targetQuality, changeTracker, entityIndex) {
        if (entity.items) {
            return entity.items.some((item, itemIndex) => {
                if (item.id && item.id.name === sourceBaseName && (item.id.quality || 'normal') === sourceQuality) {
                    const changeKey = `entity_${entityIndex}_item_${itemIndex}_name`;
                    if (!changeTracker.has(changeKey)) {
                        item.id.name = targetBaseName;
                        item.id.quality = targetQuality;
                        changeTracker.add(changeKey);
                        return true;
                    }
                }
                return false;
            });
        }
        return false;
    }
    
    replaceRecipeData(entity, sourceBaseName, sourceQuality, targetBaseName, targetQuality, changeTracker, entityIndex) {
        const recipeQuality = entity.recipe_quality || 'normal';
        if (entity.recipe === sourceBaseName && recipeQuality === sourceQuality) {
            const changeKey = `entity_${entityIndex}_recipe`;
            if (!changeTracker.has(changeKey)) {
                entity.recipe = targetBaseName;
                entity.recipe_quality = targetQuality;
                changeTracker.add(changeKey);
                return true;
            }
        }
        return false;
    }
    
    replaceConditionData(entity, sourceBaseName, sourceQuality, targetBaseName, targetQuality, changeTracker, entityIndex) {
        if (entity.control_behavior && entity.control_behavior.circuit_condition) {
            const condition = entity.control_behavior.circuit_condition;
            if (condition.first_signal && condition.first_signal.name === sourceBaseName && 
                (condition.first_signal.quality || 'normal') === sourceQuality) {
                const changeKey = `entity_${entityIndex}_condition_signal`;
                if (!changeTracker.has(changeKey)) {
                    condition.first_signal.name = targetBaseName;
                    condition.first_signal.quality = targetQuality;
                    changeTracker.add(changeKey);
                    return true;
                }
            }
        }
        return false;
    }
    
    replaceRequestData(entity, sourceBaseName, sourceQuality, targetBaseName, targetQuality, changeTracker, entityIndex) {
        if (entity.request_filters && entity.request_filters.sections) {
            return entity.request_filters.sections.some((section, sectionIndex) => {
                if (section.filters) {
                    return section.filters.some((filter, filterIndex) => {
                        if (filter.name === sourceBaseName && (filter.quality || 'normal') === sourceQuality) {
                            const changeKey = `entity_${entityIndex}_section_${sectionIndex}_filter_${filterIndex}`;
                            if (!changeTracker.has(changeKey)) {
                                filter.name = targetBaseName;
                                filter.quality = targetQuality;
                                changeTracker.add(changeKey);
                                return true;
                            }
                        }
                        return false;
                    });
                }
                return false;
            });
        }
        return false;
    }
    
    replaceEntity(from, to) {
        if (!this.jsonString) {
            this.showError('No blueprint data available');
            return;
        }
        
        // Replace all instances of the entity
        const regex = new RegExp(`"name":\\s*"${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
        const matches = [...this.jsonString.matchAll(regex)];
        
        if (matches.length === 0) {
            this.showError(`No instances of "${from}" found to replace`);
            return;
        }
        
        this.jsonString = this.jsonString.replace(regex, `"name": "${to}"`);
        this.blueprintData = JSON.parse(this.jsonString);
        this.displayJson();
        this.analyzeEntities();
        this.showSuccess(`Replaced ${matches.length} instance${matches.length === 1 ? '' : 's'} of "${from}" with "${to}"`);
    }
    
    clearAll() {
        this.blueprintInput.value = '';
        this.jsonDisplay.value = '';
        this.jsonStatus.textContent = '';
        this.searchInput.value = '';
        this.replaceInput.value = '';
        this.searchResults.innerHTML = '';
        this.entityAnalysis.innerHTML = '';
        this.exportStatus.innerHTML = '';
        this.blueprintData = null;
        this.jsonString = '';
        this.activeFilters = new Set(['entities']); // Reset to default
        
        // Reset filter buttons
        this.updateFilterButtons();
        this.updateSectionVisibility();
        this.saveToStorage();
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('factorio-blueprint-editor-blueprint', this.blueprintInput.value);
            localStorage.setItem('factorio-blueprint-editor-filters', JSON.stringify(Array.from(this.activeFilters)));
        } catch (e) {
            console.log('Could not save to localStorage:', e);
        }
    }
    
    loadFromStorage() {
        try {
            // First restore the filters
            const savedFilters = localStorage.getItem('factorio-blueprint-editor-filters');
            if (savedFilters) {
                this.activeFilters = new Set(JSON.parse(savedFilters));
                this.updateFilterButtons();
            }
            
            // Then restore and decode the blueprint
            const savedBlueprint = localStorage.getItem('factorio-blueprint-editor-blueprint');
            if (savedBlueprint) {
                this.blueprintInput.value = savedBlueprint;
                // Immediately decode the restored blueprint with the correct filters
                if (savedBlueprint.trim()) {
                    this.decodeBlueprint();
                }
            }
        } catch (e) {
            console.log('Could not load from localStorage:', e);
        }
    }
    
    updateSectionVisibility() {
        const hasBlueprint = this.blueprintData !== null;
        const sections = ['entitiesSection', 'searchSection', 'exportSection', 'jsonSection'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                if (hasBlueprint) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            }
        });
    }
    
    showError(message) {
        this.exportStatus.innerHTML = `<div class="error">${message}</div>`;
    }
    
    showSuccess(message) {
        this.exportStatus.innerHTML = `<div class="success">${message}</div>`;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the editor when the page loads
let blueprintEditor;
document.addEventListener('DOMContentLoaded', () => {
    blueprintEditor = new BlueprintEditor();
});
