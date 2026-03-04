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

function generateAutomallBlueprint(todoList) {
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
    bufferChest.request_filters.sections[0].filters = requiredInputs.map((name, i) => {
        const stack = AUTOMALL_STACK_SIZES[name] || 50;
        const count = Math.max(1, stack - 3);
        return {
            index: i + 1,
            name,
            quality: "normal",
            comparator: "=",
            count
        };
    });

    return result;
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

    function renderRequiredInputs() {
        if (!inputsEl) return;
        const currentTodo = buildTodoFromTable();
        const inputs = getRequiredInputsFromTodo(currentTodo);

        if (!inputs.length) {
            inputsEl.textContent = 'No external inputs required for this todo list.';
            return;
        }

        const wrapper = document.createElement('div');
        const label = document.createElement('div');
        label.textContent = 'Required base inputs (not crafted earlier in this list):';
        const list = document.createElement('div');
        list.className = 'automall-input-list';

        inputs.forEach(name => {
            const chip = document.createElement('div');
            chip.className = 'automall-input-chip';

            const img = document.createElement('img');
            img.src = toImageUrl(name);
            img.alt = name;
            img.onerror = function () {
                this.style.display = 'none';
            };

            const span = document.createElement('span');
            span.textContent = name;

            chip.appendChild(img);
            chip.appendChild(span);
            list.appendChild(chip);
        });

        wrapper.appendChild(label);
        wrapper.appendChild(list);

        inputsEl.innerHTML = '';
        inputsEl.appendChild(wrapper);
    }

    function appendRow(item) {
        const row = document.createElement('tr');
        row.classList.add('automall-row');
        row.draggable = true;
        row.dataset.itemName = item.name;

        const itemCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = toImageUrl(item.name);
        img.alt = item.name;
        img.className = 'entity-image';
        img.onerror = function () {
            this.style.display = 'none';
        };
        const label = document.createElement('span');
        label.textContent = ` ${item.name}`;
        itemCell.appendChild(img);
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

            const img = document.createElement('img');
            img.src = toImageUrl(name);
            img.alt = name;
            img.onerror = function () {
                this.style.display = 'none';
            };

            const label = document.createElement('span');
            label.textContent = name;

            option.appendChild(img);
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
                const blueprintData = generateAutomallBlueprint(currentTodo);
                const blueprintString = encodeBlueprintData(blueprintData);
                await navigator.clipboard.writeText(blueprintString);
                statusEl.innerHTML = '<div class="success">Blueprint encoded and copied to clipboard.</div>';
            } catch (e) {
                statusEl.innerHTML = `<div class="error">Failed to encode blueprint: ${e.message}</div>`;
            }
        });
    }
});

