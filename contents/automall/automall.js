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

    return result;
}

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('automallTodoBody');
    if (!tbody || !Array.isArray(AUTOMALL_TODO)) {
        return;
    }

    const addBtn = document.getElementById('automallAddBtn');
    const encodeBtn = document.getElementById('automallEncodeBtn');
    const statusEl = document.getElementById('automallStatus');
    const picker = document.getElementById('automallItemPicker');
    const pickerClose = document.getElementById('automallItemPickerClose');
    const pickerSearch = document.getElementById('automallItemSearch');
    const pickerList = document.getElementById('automallItemList');

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
            }
        });

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'automall-row-btn';
        removeBtn.innerHTML = '<span class="material-icons">delete</span>';
        removeBtn.addEventListener('click', () => {
            tbody.removeChild(row);
        });

        actionsWrapper.appendChild(removeBtn);
        actionsCell.appendChild(actionsWrapper);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    }

    function renderInitialTable() {
        tbody.innerHTML = '';
        AUTOMALL_TODO.forEach(item => {
            appendRow(item);
        });
    }

    function buildTodoFromTable() {
        const rows = Array.from(tbody.querySelectorAll('tr'));
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
                appendRow({
                    name,
                    start_count: 0,
                    stop_count: 0
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

