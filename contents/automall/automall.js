function getRequiredInputsFromTodo(todo) {
    const producedSoFar = new Set();
    const requiredInputs = new Set();

    for (const entry of todo) {
        const recipe = AUTOMALL_RECIPES[entry.name];
        if (Array.isArray(recipe)) {
            for (const ingredient of recipe) {
                if (!producedSoFar.has(ingredient)) {
                    requiredInputs.add(ingredient);
                }
            }
        }
        if (entry.name) {
            producedSoFar.add(entry.name);
        }
    }

    return Array.from(requiredInputs).sort((a, b) => {
        const ia = automallSignalOrder.indexOf(a);
        const ib = automallSignalOrder.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
    });
}

function generateAutomallBlueprint(todoList, smeltOptions, requestedAmounts) {
    if (!Array.isArray(todoList)) {
        throw new Error('todo list must be an array');
    }

    const result = JSON.parse(JSON.stringify(AUTOMALL_BASE_BLUEPRINT));

    const filters = [];
    const conditions = [];
    const itemValues = {};
    let neededChecks = {};
    let nextVirtualSignal = 1;

    function ensureFilter(name, virtualSignal) {
        if (itemValues[name] !== undefined) {
            return;
        }

        itemValues[name] = Object.keys(itemValues).length * 2 + 1;
        const signal = {
            index: 1 + (itemValues[name] - 1) / 2,
            name,
            quality: "normal",
            comparator: "=",
            count: itemValues[name]
        };
        if (virtualSignal) {
            signal.type = "virtual";
        }
        filters.push(signal);
        return signal;
    }

    function startCondition(name, count) {
        return {
            first_signal: { name },
            constant: count,
            first_signal_networks: {
                red: false,
                green: true
            }
        };
    }

    function stopCondition(name, count) {
        return {
            first_signal: { name },
            constant: count,
            first_signal_networks: {
                red: false,
                green: true
            }
        };
    }

    function enableCondition(name, offset) {
        return {
            first_signal: {
                type: "virtual",
                name: "signal-each"
            },
            constant: itemValues[name] + (offset || 0),
            comparator: "=",
            first_signal_networks: {
                red: true,
                green: false
            },
            compare_type: "and"
        };
    }

    function checkCondition(name) {
        const signal = { name };
        if (name.startsWith("signal-")) {
            signal.type = "virtual";
        }
        return {
            first_signal: signal,
            constant: itemValues[name] + (signal.type === "virtual" ? 1 : 0),
            comparator: "=",
            first_signal_networks: {
                red: true,
                green: false
            },
            compare_type: "and"
        };
    }

    function checkCountCondition(name, count) {
        const signal = { name };
        if (name.startsWith("signal-")) {
            signal.type = "virtual";
        }
        return {
            first_signal: signal,
            constant: count,
            comparator: ">=",
            first_signal_networks: {
                red: false,
                green: true
            },
            compare_type: "and"
        };
    }

    for (const t of todoList) {
        ensureFilter(t.name);
        if (neededChecks[t.name] !== undefined) {
            const virtualName = `signal-${nextVirtualSignal}`;
            ensureFilter(virtualName, true);
            conditions.push({
                first_signal: {
                    type: "virtual",
                    name: "signal-each"
                },
                constant: itemValues[virtualName],
                comparator: ">=",
                first_signal_networks: {
                    red: true,
                    green: false
                }
            });
            conditions.push({
                first_signal: {
                    type: "virtual",
                    name: "signal-each"
                },
                constant: itemValues[virtualName] + 1,
                comparator: "<=",
                first_signal_networks: {
                    red: true,
                    green: false
                },
                compare_type: "and"
            });
            for (const [name, count] of Object.entries(neededChecks)) {
                conditions.push(checkCountCondition(name, count));
            }
            neededChecks = { [virtualName]: itemValues[virtualName] };
            nextVirtualSignal++;
        }
        conditions.push(stopCondition(t.name, t.stop_count), enableCondition(t.name, 1));
        for (const name in neededChecks) {
            if (
                automallSignalOrder.indexOf(name) > automallSignalOrder.indexOf(t.name) ||
                automallSignalOrder.indexOf(name) === -1
            ) {
                conditions.push(checkCondition(name));
            }
        }
        conditions.push(startCondition(t.name, t.start_count), enableCondition(t.name));
        for (const name in neededChecks) {
            if (
                automallSignalOrder.indexOf(name) > automallSignalOrder.indexOf(t.name) ||
                automallSignalOrder.indexOf(name) === -1
            ) {
                conditions.push(checkCondition(name));
            }
        }
        neededChecks[t.name] = t.start_count;
    }

    if (typeof getSmelterConditions === 'function' && smeltOptions && Object.keys(smeltOptions).some((k) => smeltOptions[k] && smeltOptions[k].smelt)) {
        const { conditions: smeltConds, filters: smeltFilters } = getSmelterConditions(smeltOptions, filters.length + 1);
        if (smeltFilters.length) {
            conditions.push(...smeltConds);
            filters.push(...smeltFilters);
            addSmelterToBlueprint(result, result.blueprint.entities[1].position);
        }
    }

    result.blueprint.entities[5].control_behavior.decider_conditions.conditions = conditions;
    result.blueprint.entities[6].control_behavior.sections.sections[0].filters = filters;

    const descLines = todoList.map(t => `[item=${t.name}] ${t.start_count} - ${t.stop_count}`);
    let desc = descLines.join("\n");
    if (desc.length > 500) {
        const ellipsisLen = n =>
            ("\n[ ... " + n + " more " + (n === 1 ? "entry" : "entries") + " ... ]\n").length;
        const maxContent = 500 - ellipsisLen(99);
        let startIdx = 0;
        let startLen = 0;
        while (startIdx < descLines.length) {
            const add = (startIdx ? 1 : 0) + descLines[startIdx].length;
            if (startLen + add > maxContent / 2) break;
            startLen += add;
            startIdx++;
        }
        let endIdx = descLines.length;
        let endLen = 0;
        while (endIdx > startIdx) {
            const add = (endLen ? 1 : 0) + descLines[endIdx - 1].length;
            if (startLen + endLen + add + ellipsisLen(endIdx - startIdx) > 500) break;
            endLen += add;
            endIdx--;
        }
        const omitted = endIdx - startIdx;
        const ellipsis =
            "\n[ ... " +
            omitted +
            " more " +
            (omitted === 1 ? "entry" : "entries") +
            " ... ]\n";
        desc =
            descLines.slice(0, startIdx).join("\n") +
            ellipsis +
            descLines.slice(endIdx).join("\n");
    }
    result.blueprint.entities[5].player_description = desc;

    const requiredInputs = getRequiredInputsFromTodo(todoList);
    const bufferChest = result.blueprint.entities[1];
    const requestPairs = buildBufferRequestList(requiredInputs, smeltOptions || {}, requestedAmounts || {});
    bufferChest.request_filters.sections[0].filters = requestPairs.map(({ name, count }, i) => ({
        index: i + 1,
        name,
        quality: "normal",
        comparator: "=",
        count: Math.max(1, count)
    }));

    return result;
}

function resolveRequestName(name, smeltOptions) {
    let requestName = name;
    if (typeof isSmeltableBaseIngredient === 'function' && typeof getSmeltIngredient === 'function') {
        while (isSmeltableBaseIngredient(requestName) && smeltOptions[requestName] && smeltOptions[requestName].smelt) {
            const ing = getSmeltIngredient(requestName);
            if (!ing) break;
            requestName = ing;
        }
    }
    return requestName;
}

function buildBufferRequestList(requiredInputs, smeltOptions, requestedAmounts) {
    const byName = {};
    const stackCount = (name) => Math.max(1, (AUTOMALL_STACK_SIZES[name] || 50) - 3);
    const getCount = (name) => (requestedAmounts[name] != null ? Number(requestedAmounts[name]) : stackCount(name));
    for (const name of requiredInputs) {
        const smelt = typeof isSmeltableBaseIngredient === 'function' && isSmeltableBaseIngredient(name) && smeltOptions[name] && smeltOptions[name].smelt;
        const requestName = smelt && typeof getSmeltIngredient === 'function' ? resolveRequestName(name, smeltOptions) : name;
        if (!requestName) continue;
        const count = getCount(requestName);
        byName[requestName] = Math.max(byName[requestName] ?? 0, count);
    }
    const names = Object.keys(byName).sort((a, b) => {
        const ia = automallSignalOrder.indexOf(a);
        const ib = automallSignalOrder.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
    });
    return names.map((name) => ({ name, count: byName[name] }));
}

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('automallTodoBody');
    if (!tbody || !Array.isArray(AUTOMALL_TODO)) {
        return;
    }

    const addBtn = document.getElementById('automallAddBtn');
    const clearBtn = document.getElementById('automallClearBtn');
    const encodeBtn = document.getElementById('automallEncodeBtn');
    const statusEl = document.getElementById('automallStatus');
    const inputsEl = document.getElementById('automallInputs');
    const picker = document.getElementById('automallItemPicker');
    const pickerClose = document.getElementById('automallItemPickerClose');
    const pickerSearch = document.getElementById('automallItemSearch');
    const pickerList = document.getElementById('automallItemList');

    function addEmptyStateRow() {
        if (tbody.querySelector('.automall-empty-row')) return;
        const tr = document.createElement('tr');
        tr.className = 'automall-empty-row';
        tr.innerHTML = '<td colspan="4"><span class="automall-empty-message"><span class="material-icons">inbox</span>No items yet. Click Add item to build your list.</span></td>';
        tbody.appendChild(tr);
    }

    function removeEmptyStateRow() {
        tbody.querySelector('.automall-empty-row')?.remove();
    }

    let smeltState = {};
    let requestedAmounts = {};

    function getDefaultRequestCount(name) {
        return Math.max(1, (AUTOMALL_STACK_SIZES[name] || 50) - 3);
    }

    function getInputTableRows(inputs) {
        const seen = new Set(inputs);
        const rows = inputs.slice();
        if (typeof getSmeltIngredient === 'function') {
            inputs.forEach((name) => {
                if (typeof isSmeltableBaseIngredient === 'function' && isSmeltableBaseIngredient(name) && smeltState[name]) {
                    const ing = getSmeltIngredient(name);
                    if (ing && !seen.has(ing)) {
                        seen.add(ing);
                        rows.push(ing);
                    }
                }
            });
        }
        return rows.sort((a, b) => {
            const ia = automallSignalOrder.indexOf(a);
            const ib = automallSignalOrder.indexOf(b);
            if (ia === -1 && ib === -1) return a.localeCompare(b);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        });
    }

    function renderRequiredInputs() {
        if (!inputsEl) return;
        const currentTodo = buildTodoFromTable();
        const inputs = getRequiredInputsFromTodo(currentTodo);

        if (!inputs.length) {
            inputsEl.textContent = 'No external inputs required for this todo list.';
            return;
        }

        const rows = getInputTableRows(inputs);
        const wrapper = document.createElement('div');
        const label = document.createElement('div');
        label.className = 'automall-inputs-label';
        label.textContent = 'Required base inputs (not crafted earlier in this list):';
        wrapper.appendChild(label);

        const table = document.createElement('table');
        table.className = 'automall-table automall-inputs-table';
        table.innerHTML = '<thead><tr><th>Item</th><th>Requested</th><th>Smelt</th></tr></thead>';
        const tbody = document.createElement('tbody');

        rows.forEach((name) => {
            const tr = document.createElement('tr');
            tr.dataset.inputName = name;
            const isIngredient = inputs.indexOf(name) === -1;
            const smeltedBy = isIngredient && typeof getSmeltIngredient === 'function'
                ? SMELTABLE_BASE_ITEMS.find((s) => getSmeltIngredient(s) === name)
                : null;
            const isSmeltedItem = typeof isSmeltableBaseIngredient === 'function' && isSmeltableBaseIngredient(name) && smeltState[name];
            const countDisabled = isSmeltedItem;

            const itemCell = document.createElement('td');
            const iconSpan = document.createElement('span');
            iconSpan.className = 'entity-image';
            iconSpan.setAttribute('data-image', `${itemNameToIconId(name)}:32`);
            const span = document.createElement('span');
            span.textContent = name + (smeltedBy ? ` \u2192 ${smeltedBy}` : '');
            itemCell.appendChild(iconSpan);
            itemCell.appendChild(span);
            tr.appendChild(itemCell);

            const requestedCell = document.createElement('td');
            const countInput = document.createElement('input');
            countInput.type = 'number';
            countInput.min = '1';
            countInput.value = String(requestedAmounts[name] != null ? requestedAmounts[name] : getDefaultRequestCount(name));
            countInput.className = 'automall-input automall-requested';
            countInput.disabled = countDisabled;
            if (countDisabled) countInput.title = 'Disabled when smelting; request the ingredient instead.';
            countInput.addEventListener('change', () => {
                const v = parseInt(countInput.value, 10);
                if (!Number.isNaN(v)) requestedAmounts[name] = v;
            });
            requestedCell.appendChild(countInput);
            tr.appendChild(requestedCell);

            const smeltCell = document.createElement('td');
            if (typeof isSmeltableBaseIngredient === 'function' && isSmeltableBaseIngredient(name) && !isIngredient) {
                const toggle = document.createElement('div');
                toggle.className = 'automall-smelt-toggle';
                toggle.dataset.smeltItem = name;
                const setSmelt = (smelt) => {
                    smeltState[name] = smelt;
                    if (smelt && getSmeltIngredient(name)) {
                        const ing = getSmeltIngredient(name);
                        if (requestedAmounts[ing] == null) requestedAmounts[ing] = getDefaultRequestCount(ing);
                    }
                    toggle.querySelector('.automall-smelt-btn-buffer').classList.toggle('active', !smelt);
                    toggle.querySelector('.automall-smelt-btn-furnace').classList.toggle('active', !!smelt);
                    renderRequiredInputs();
                };
                const bufBtn = document.createElement('button');
                bufBtn.type = 'button';
                bufBtn.className = 'automall-smelt-btn automall-smelt-btn-buffer' + (smeltState[name] ? '' : ' active');
                bufBtn.title = 'Request from buffer (don\'t smelt on site)';
                const bufIcon = document.createElement('span');
                bufIcon.setAttribute('data-image', 'buffer-chest:32');
                bufBtn.appendChild(bufIcon);
                bufBtn.addEventListener('click', () => setSmelt(false));
                const furnBtn = document.createElement('button');
                furnBtn.type = 'button';
                furnBtn.className = 'automall-smelt-btn automall-smelt-btn-furnace' + (smeltState[name] ? ' active' : '');
                furnBtn.title = 'Smelt on site';
                const furnIcon = document.createElement('span');
                furnIcon.setAttribute('data-image', 'electric-furnace:32');
                furnBtn.appendChild(furnIcon);
                furnBtn.addEventListener('click', () => setSmelt(true));
                toggle.appendChild(bufBtn);
                toggle.appendChild(furnBtn);
                smeltCell.appendChild(toggle);
            }
            tr.appendChild(smeltCell);
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        wrapper.appendChild(table);
        inputsEl.innerHTML = '';
        inputsEl.appendChild(wrapper);
    }

    function buildSmeltOptions(requiredInputs) {
        const opts = {};
        if (typeof isSmeltableBaseIngredient !== 'function') return opts;
        requiredInputs.filter(isSmeltableBaseIngredient).forEach((name) => {
            opts[name] = { smelt: !!smeltState[name], start_count: 200 };
        });
        return opts;
    }

    function buildRequestedAmountsFromTable() {
        const currentTodo = buildTodoFromTable();
        const inputs = getRequiredInputsFromTodo(currentTodo);
        const rows = getInputTableRows(inputs);
        const out = {};
        rows.forEach((name) => {
            const inputEl = inputsEl.querySelector(`tr[data-input-name="${name}"] .automall-requested`);
            if (inputEl) {
                const v = parseInt(inputEl.value, 10);
                out[name] = !Number.isNaN(v) ? v : getDefaultRequestCount(name);
            } else {
                out[name] = requestedAmounts[name] != null ? requestedAmounts[name] : getDefaultRequestCount(name);
            }
        });
        return out;
    }

    function appendRow(item) {
        const row = document.createElement('tr');
        row.classList.add('automall-row');
        row.draggable = true;
        row.dataset.itemName = item.name;

        const itemCell = document.createElement('td');
        const iconSpan = document.createElement('span');
        iconSpan.className = 'entity-image';
        iconSpan.setAttribute('data-image', `${itemNameToIconId(item.name)}:32`);
        const label = document.createElement('span');
        label.textContent = ` ${item.name}`;
        itemCell.appendChild(iconSpan);
        itemCell.appendChild(label);
        row.appendChild(itemCell);

        const startCell = document.createElement('td');
        const startInput = document.createElement('input');
        startInput.type = 'number';
        startInput.min = '0';
        startInput.value = String(item.start_count);
        startInput.className = 'automall-input automall-start';
        startCell.appendChild(startInput);
        row.appendChild(startCell);

        const stopCell = document.createElement('td');
        const stopInput = document.createElement('input');
        stopInput.type = 'number';
        stopInput.min = '0';
        stopInput.value = String(item.stop_count);
        stopInput.className = 'automall-input automall-stop';
        stopCell.appendChild(stopInput);
        row.appendChild(stopCell);

        const actionsCell = document.createElement('td');
        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'automall-row-actions';

        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.textContent = '↑';
        upBtn.className = 'automall-row-btn';
        upBtn.addEventListener('click', () => {
            const prev = row.previousElementSibling;
            if (prev) {
                tbody.insertBefore(row, prev);
                renderRequiredInputs();
            }
        });

        const downBtn = document.createElement('button');
        downBtn.type = 'button';
        downBtn.textContent = '↓';
        downBtn.className = 'automall-row-btn';
        downBtn.addEventListener('click', () => {
            const next = row.nextElementSibling;
            if (next) {
                tbody.insertBefore(next, row);
                renderRequiredInputs();
            }
        });

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'automall-row-btn';
        removeBtn.innerHTML = '<span class="material-icons">delete</span>';
        removeBtn.addEventListener('click', () => {
            tbody.removeChild(row);
            if (tbody.querySelectorAll('.automall-row').length === 0) {
                addEmptyStateRow();
            }
            renderRequiredInputs();
        });

        actionsWrapper.appendChild(removeBtn);
        actionsCell.appendChild(actionsWrapper);
        row.appendChild(actionsCell);

        removeEmptyStateRow();
        tbody.appendChild(row);

        renderRequiredInputs();
    }

    function renderInitialTable() {
        tbody.innerHTML = '';
        if (AUTOMALL_TODO.length === 0) {
            addEmptyStateRow();
        } else {
            AUTOMALL_TODO.forEach(item => {
                appendRow(item);
            });
        }
        renderRequiredInputs();
    }

    function clearTable() {
        tbody.innerHTML = '';
        addEmptyStateRow();
        renderRequiredInputs();
    }

    function buildTodoFromTable() {
        const rows = Array.from(tbody.querySelectorAll('tr.automall-row'));
        return rows.map(row => {
            const name = row.dataset.itemName || '';
            const startInput = row.querySelector('.automall-start');
            const stopInput = row.querySelector('.automall-stop');
            const start = startInput ? parseInt(startInput.value, 10) || 0 : 0;
            const stop = stopInput ? parseInt(stopInput.value, 10) || 0 : 0;
            return {
                name,
                start_count: start,
                stop_count: stop
            };
        });
    }

    function openPicker() {
        if (!picker || !pickerList) return;
        picker.classList.remove('hidden');
        pickerSearch.value = '';
        renderPickerList('');
        requestAnimationFrame(() => {
            pickerSearch?.focus();
        });
    }

    function closePicker() {
        if (!picker) return;
        picker.classList.add('hidden');
    }

    function renderPickerList(filter) {
        if (!pickerList) return;
        pickerList.innerHTML = '';
        const q = (filter || '').trim().toLowerCase();
        automallSignalOrder.forEach(name => {
            if (q && !name.toLowerCase().includes(q)) {
                return;
            }
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'automall-item-option';

            const iconSpan = document.createElement('span');
            iconSpan.className = 'entity-image';
            iconSpan.setAttribute('data-image', `${itemNameToIconId(name)}:24`);

            const label = document.createElement('span');
            label.textContent = name;

            option.appendChild(iconSpan);
            option.appendChild(label);

            option.addEventListener('click', () => {
                const stack = AUTOMALL_STACK_SIZES[name] || 50;
                const stop_count = stack;
                const start_count = Math.max(1, Math.floor(stack * 0.1));
                appendRow({
                    name,
                    start_count,
                    stop_count
                });
                closePicker();
            });

            pickerList.appendChild(option);
        });
    }

    renderInitialTable();

    let draggedRow = null;

    tbody.addEventListener('dragstart', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLTableRowElement)) return;
        draggedRow = target;
        target.classList.add('dragging');
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    tbody.addEventListener('dragend', (e) => {
        const target = e.target;
        if (target instanceof HTMLTableRowElement) {
            target.classList.remove('dragging');
        }
        draggedRow = null;
        renderRequiredInputs();
    });

    tbody.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!draggedRow) return;
        const afterElement = getDragAfterElement(tbody, e.clientY);
        if (afterElement == null) {
            tbody.appendChild(draggedRow);
        } else if (afterElement !== draggedRow) {
            tbody.insertBefore(draggedRow, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const rows = [...container.querySelectorAll('.automall-row:not(.dragging)')];
        let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
        for (const row of rows) {
            const box = row.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                closest = { offset, element: row };
            }
        }
        return closest.element;
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            openPicker();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearTable();
        });
    }

    if (pickerClose) {
        pickerClose.addEventListener('click', () => {
            closePicker();
        });
    }

    if (picker && picker.firstElementChild) {
        const backdrop = picker.querySelector('.automall-item-picker-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                closePicker();
            });
        }
    }

    if (pickerSearch) {
        pickerSearch.addEventListener('input', () => {
            renderPickerList(pickerSearch.value);
        });
        pickerSearch.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const first = pickerList?.querySelector('.automall-item-option');
            if (first) first.click();
        });
    }

    if (encodeBtn && statusEl) {
        encodeBtn.addEventListener('click', async () => {
            try {
                const currentTodo = buildTodoFromTable();
                const requiredInputs = getRequiredInputsFromTodo(currentTodo);
                const smeltOptions = buildSmeltOptions(requiredInputs);
                const requestedAmountsMap = buildRequestedAmountsFromTable();
                const blueprintData = generateAutomallBlueprint(currentTodo, smeltOptions, requestedAmountsMap);
                const blueprintString = encodeBlueprintData(blueprintData);
                await navigator.clipboard.writeText(blueprintString);
                statusEl.innerHTML = '<div class="success">Blueprint encoded and copied to clipboard.</div>';
            } catch (e) {
                statusEl.innerHTML = `<div class="error">Failed to encode blueprint: ${e.message}</div>`;
            }
        });
    }
});

