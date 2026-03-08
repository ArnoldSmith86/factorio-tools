(function () {
    // Order: belt, underground, fast belt, fast underground, ...
    const BELT_ORDER = [
        { id: 'transport-belt', span: null },
        { id: 'underground-belt', span: 6 },
        { id: 'fast-transport-belt', span: null },
        { id: 'fast-underground-belt', span: 8 },
        { id: 'express-transport-belt', span: null },
        { id: 'express-underground-belt', span: 10 },
        { id: 'turbo-transport-belt', span: null },
        { id: 'turbo-underground-belt', span: 12 },
    ];

    const BASE_ITEMS = ['iron-plate', 'tungsten-ore'];
    const RESOURCE_IDS = BASE_ITEMS.concat('lubricant');
    const ASSEMBLER_RESOURCE_IDS = ['iron-plate', 'lubricant'];

    function getRecipe(id) {
        if (typeof data === 'undefined' || !data.recipes) return null;
        return Object.values(data.recipes).find(
            (r) => r && r.id === id && !r.id.includes('recycling')
        );
    }

    function hasAssembler(rec) {
        return rec.producers && rec.producers.some((p) => p.startsWith('assembling-machine'));
    }

    function hasFoundry(rec) {
        return rec.producers && rec.producers.indexOf('foundry') !== -1;
    }

    function getRecursiveCost(item, productivity = 1, targets = ['iron-plate', 'tungsten-ore', 'lubricant']) {
        const rec =  item === 'iron-gear-wheel' ? {in: {'molten-iron': 10}, out: {'iron-gear-wheel': 1}} : getRecipe(item);
        const steps = [];
        const targetCounts = {};
        const outCount = rec.out[item];
        const prodDisplay = productivity === 1 ? '' : `/${productivity}`;
        const outCountDisplay = outCount === 1 ? '' : `/${outCount}`;
        const step = `<span data-image="${item}:20"></span> = ${Object.entries(rec.in).map(([inItem, inCount]) => `${inCount}${outCountDisplay}${prodDisplay} <span data-image="${inItem}:20"></span>`).join(' + ')} = ${Object.entries(rec.in).map(([inItem, inCount]) => `${Math.round(inCount / outCount / productivity * 10) / 10} <span data-image="${inItem}:20"></span>`).join(' + ')}`;
        for (let [inItem, inCount] of Object.entries(rec.in)) {
            if(inItem == 'molten-iron') {
                inItem = 'iron-plate';
                inCount = inCount / 10;
            }
            if (targets.includes(inItem)) {
                targetCounts[inItem] = (targetCounts[inItem] || 0) + inCount / outCount / productivity;
            } else {
                const { targetCounts: subTargetCounts, steps: subSteps } = getRecursiveCost(inItem, productivity, targets);
                for (const [target, count] of Object.entries(subTargetCounts)) {
                    targetCounts[target] = (targetCounts[target] || 0) + count * inCount / outCount / productivity;
                }
                for (const step of subSteps) {
                    steps.push(step);
                }
            }
        }
        steps.push(step);
        return { steps, targetCounts };
    }

    function formatAmount(n) {
        if (n === 0) return '0';
        const r = Math.round(n * 1000) / 1000;
        return String(r);
    }

    function tooltipIcon(parent, itemId, size) {
        const span = document.createElement('span');
        span.className = 'entity-image belt-cost-tt-icon';
        span.setAttribute('data-image', itemId + ':' + (size || 18));
        parent.appendChild(span);
        return span;
    }

    function tooltipLine(parent, text) {
        const line = document.createElement('div');
        line.className = 'belt-cost-tt-line';
        line.textContent = text;
        parent.appendChild(line);
        return line;
    }

    function tooltipLineWithIcons(parent, parts) {
        const line = document.createElement('div');
        line.className = 'belt-cost-tt-line belt-cost-tt-line-icons';
        for (const p of parts) {
            if (p.icon) {
                tooltipIcon(line, p.icon, p.size || 18);
                if (p.text != null) {
                    const t = document.createElement('span');
                    t.textContent = p.text;
                    line.appendChild(t);
                }
            } else {
                line.appendChild(document.createTextNode(p.text || ''));
            }
        }
        parent.appendChild(line);
        return line;
    }

    function buildFormulaTooltipDOM(row, costAssembler, costFoundry, tilesPerResult, perTileAssembler, perTileFoundry) {
        const rec = getRecipe(row.id);
        const root = document.createElement('div');
        root.className = 'belt-cost-formula-tooltip';

        const recipeLine = document.createElement('div');
        recipeLine.className = 'belt-cost-tt-line';
        recipeLine.appendChild(document.createTextNode('Recipe: '));
        tooltipIcon(recipeLine, row.id, 20);
        root.appendChild(recipeLine);

        tooltipLine(root, 'Assembler (one per line):');
        const stepsAssembler = document.createElement('div');
        stepsAssembler.className = 'belt-cost-tt-steps';
        stepsAssembler.innerHTML = costAssembler.steps.join('<br>');
        root.appendChild(stepsAssembler);
        tooltipLine(root, 'Total (assembler):');
        tooltipLineWithIcons(root, [
            { icon: 'iron-plate', text: ' ' + formatAmount(costAssembler.targetCounts['iron-plate'] || 0) + '  ' },
            { icon: 'tungsten-ore', text: ' ' + formatAmount(costAssembler.targetCounts['tungsten-ore'] || 0) + '  ' },
            { icon: 'lubricant', text: ' ' + formatAmount(costAssembler.targetCounts.lubricant || 0) },
        ]);

        tooltipLine(root, 'Foundry (50% prod), one per line:');
        const stepsFoundry = document.createElement('div');
        stepsFoundry.className = 'belt-cost-tt-steps';
        stepsFoundry.innerHTML = costFoundry.steps.join('<br>');
        root.appendChild(stepsFoundry);
        tooltipLine(root, 'Total (foundry):');
        tooltipLineWithIcons(root, [
            { icon: 'iron-plate', text: ' ' + formatAmount(costFoundry.targetCounts['iron-plate'] || 0) + '  ' },
            { icon: 'tungsten-ore', text: ' ' + formatAmount(costFoundry.targetCounts['tungsten-ore'] || 0) + '  ' },
            { icon: 'lubricant', text: ' ' + formatAmount(costFoundry.targetCounts.lubricant || 0) },
        ]);

        if (row.span != null) {
            tooltipLine(root, '1 section = 2 belts (entry + exit), so cost × 2. 1 section = ' + row.span + ' tiles. Per tile = 2× total ÷ ' + tilesPerResult);
        } else {
            tooltipLine(root, '1 result = 1 tile. Per tile = total (as above).');
        }

        tooltipLine(root, '');
        tooltipLine(root, 'Assembler per tile:');
        tooltipLineWithIcons(root, [
            { icon: 'iron-plate', text: ' ' + (hasAssembler(rec) ? formatAmount(perTileAssembler['iron-plate']) : '—') + '  ' },
            { icon: 'lubricant', text: ' ' + (hasAssembler(rec) ? formatAmount(perTileAssembler.lubricant) : '—') },
        ]);
        tooltipLine(root, 'Foundry per tile:');
        tooltipLineWithIcons(root, [
            { icon: 'iron-plate', text: ' ' + formatAmount(perTileFoundry['iron-plate']) + '  ' },
            { icon: 'tungsten-ore', text: ' ' + formatAmount(perTileFoundry['tungsten-ore']) + '  ' },
            { icon: 'lubricant', text: ' ' + formatAmount(perTileFoundry.lubricant) },
        ]);

        return root;
    }

    function renderCell(value, itemId, isAssembler, hasA) {
        const wrap = document.createElement('div');
        wrap.className = 'belt-cost-cell-resource' + (value === 0 && itemId !== 'lubricant' ? ' empty' : '');
        const icon = document.createElement('span');
        icon.className = 'entity-image';
        icon.setAttribute('data-image', (itemId === 'lubricant' ? 'lubricant' : itemId) + ':20');
        wrap.appendChild(icon);
        const span = document.createElement('span');
        span.textContent = value == null || (isAssembler && !hasA) ? '—' : formatAmount(value);
        wrap.appendChild(span);
        return wrap;
    }

    function buildTable() {
        const tbody = document.getElementById('beltCostBody');
        if (!tbody || typeof data === 'undefined') return;

        tbody.innerHTML = '';

        let tooltipEl = document.getElementById('beltCostTooltip');
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'beltCostTooltip';
            tooltipEl.className = 'belt-cost-formula-tooltip-popup';
            document.body.appendChild(tooltipEl);
        }

        for (const row of BELT_ORDER) {
            const rec = getRecipe(row.id);
            if (!rec) continue;

            const costAssembler = getRecursiveCost(row.id, 1);
            const costFoundry = getRecursiveCost(row.id, 1.5);
            const total = costAssembler.targetCounts;
            const totalFoundry = costFoundry.targetCounts;
            const undergroundMult = row.span != null ? 2 : 1;
            const tilesPerResult = row.span != null ? row.span : 1;
            const perTileAssembler = {
                'iron-plate': (total['iron-plate'] || 0) * undergroundMult / tilesPerResult,
                'tungsten-ore': (total['tungsten-ore'] || 0) * undergroundMult / tilesPerResult,
                lubricant: (total.lubricant || 0) * undergroundMult / tilesPerResult,
            };
            const perTileFoundry = {
                'iron-plate': (totalFoundry['iron-plate'] || 0) * undergroundMult / tilesPerResult,
                'tungsten-ore': (totalFoundry['tungsten-ore'] || 0) * undergroundMult / tilesPerResult,
                lubricant: (totalFoundry.lubricant || 0) * undergroundMult / tilesPerResult,
            };
            const hasA = hasAssembler(rec);

            const tr = document.createElement('tr');
            tr.className = 'belt-cost-row';

            const nameCell = document.createElement('td');
            const nameWrap = document.createElement('div');
            nameWrap.className = 'belt-cost-cell-belt';
            const icon = document.createElement('span');
            icon.className = 'entity-image';
            icon.setAttribute('data-image', row.id + ':24');
            nameWrap.appendChild(icon);
            nameCell.appendChild(nameWrap);
            tr.appendChild(nameCell);

            ASSEMBLER_RESOURCE_IDS.forEach((itemId) => {
                const tdA = document.createElement('td');
                tdA.appendChild(renderCell(hasA ? perTileAssembler[itemId] : null, itemId, true, hasA));
                tr.appendChild(tdA);
            });
            RESOURCE_IDS.forEach((itemId) => {
                const tdF = document.createElement('td');
                tdF.appendChild(renderCell(perTileFoundry[itemId], itemId, false, true));
                tr.appendChild(tdF);
            });

            const tooltipContent = buildFormulaTooltipDOM(row, costAssembler, costFoundry, tilesPerResult, perTileAssembler, perTileFoundry);
            if (typeof applyDataImageIn === 'function') applyDataImageIn(tooltipContent);

            tr.addEventListener('mouseenter', function () {
                tooltipEl.innerHTML = '';
                tooltipEl.appendChild(tooltipContent.cloneNode(true));
                if (typeof applyDataImageIn === 'function') applyDataImageIn(tooltipEl);
                tooltipEl.style.display = 'block';
                const rect = tr.getBoundingClientRect();
                tooltipEl.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 320)) + 'px';
                tooltipEl.style.top = (rect.bottom + 4) + 'px';
            });
            tr.addEventListener('mouseleave', function () {
                tooltipEl.style.display = 'none';
            });

            tbody.appendChild(tr);
        }

        if (typeof applyDataImageIn === 'function') applyDataImageIn(tbody);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildTable);
    } else {
        buildTable();
    }
})();
