(function () {
    const TIERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'U'];
    const TIERS_SAVED = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
    const VANILLA_IDS = [
        'nauvis', 'vulcanus', 'gleba', 'fulgora', 'aquilo',
        'solar-system-edge', 'shattered-planet'
    ];
    const MOD_IDS = [
        'arig', 'calidus-senestella-gate-senestella', 'castra', 'cerys', 'corrundum',
        'cubium', 'frozeta', 'hyarion', 'igrys', 'lemures', 'lignumis', 'luxaqua',
        'maraxsis', 'maraxsis-trench', 'mirandus-a', 'moshine', 'muluna', 'nix',
        'omnia', 'ostendus', 'paracelsin', 'planet-dea-dia', 'prosephina', 'redstar',
        'ringworld', 'rubia', 'secretas', 'secretas__secretas_1.0.33', 'shchierbin',
        'shipyard', 'slp-solar-system-sun', 'slp-solar-system-sun2', 'star-dea-dia',
        'tenebris', 'terrapalus', 'vesta', 'vesta__skewer_planet_vesta_2.0.34', 'volantus'
    ];
    const ALL_IDS = VANILLA_IDS.concat(MOD_IDS);
    const HASH_PREFIX = 'tier=';

    const rowsEl = document.getElementById('planetTierRows');
    if (!rowsEl) return;

    let state = {};
    TIERS.forEach(function (t) { state[t] = []; });
    for (var i = 0; i < ALL_IDS.length; i++) state.U.push(i);

    function idToLabel(id) {
        return id.replace(/-/g, ' ').replace(/__[^_]+$/, '');
    }

    function makeChip(idx) {
        var id = ALL_IDS[idx];
        var chip = document.createElement('span');
        chip.className = 'planet-tier-chip';
        chip.draggable = true;
        chip.dataset.idx = String(idx);
        chip.title = idToLabel(id);
        var icon = document.createElement('span');
        icon.className = 'planet-tier-icon';
        if (VANILLA_IDS.indexOf(id) !== -1) {
            icon.classList.add('image');
            icon.setAttribute('data-image', id + ':64');
        } else {
            icon.classList.add('img');
            icon.style.backgroundImage = "url('planets/" + id + ".png')";
        }
        chip.appendChild(icon);
        return chip;
    }

    function stateToIndexForm() {
        var o = {};
        TIERS_SAVED.forEach(function (t) { o[t] = state[t].slice(); });
        return o;
    }

    function indexFormToState(o) {
        var seen = {};
        var next = {};
        TIERS.forEach(function (t) { next[t] = []; });
        TIERS_SAVED.forEach(function (t) {
            if (!Array.isArray(o[t])) return;
            o[t].forEach(function (idx) {
                if (idx >= 0 && idx < ALL_IDS.length && !seen[idx]) {
                    seen[idx] = true;
                    next[t].push(idx);
                }
            });
        });
        for (var i = 0; i < ALL_IDS.length; i++) {
            if (!seen[i]) next.U.push(i);
        }
        state = next;
    }

    function base64urlEncode(b64) {
        return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function base64urlDecode(str) {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        var n = str.length % 4;
        if (n) str += '===='.slice(0, 4 - n);
        return atob(str);
    }

    function saveToUrl() {
        try {
            var json = JSON.stringify(stateToIndexForm());
            var compressed = typeof pako !== 'undefined' && pako.gzip
                ? pako.gzip(new TextEncoder().encode(json), { level: 9 })
                : new Uint8Array(0);
            var arr = new Uint8Array(compressed);
            var b64 = btoa(String.fromCharCode.apply(null, arr));
            var encoded = HASH_PREFIX + base64urlEncode(b64);
            if (location.hash.slice(1) !== encoded) {
                history.replaceState(null, '', '#' + encoded);
            }
        } catch (e) {}
    }

    function loadFromUrl() {
        var raw = location.hash.slice(1);
        if (raw.indexOf(HASH_PREFIX) !== 0) return false;
        raw = raw.slice(HASH_PREFIX.length);
        if (!raw) return false;
        try {
            var binStr = base64urlDecode(raw);
            var bin = new Uint8Array(binStr.length);
            for (var i = 0; i < binStr.length; i++) bin[i] = binStr.charCodeAt(i);
            var json = typeof pako !== 'undefined' && pako.ungzip
                ? pako.ungzip(bin, { to: 'string' }) : '';
            var o = json ? JSON.parse(json) : null;
            if (o && typeof o === 'object') {
                indexFormToState(o);
                return true;
            }
        } catch (e) {}
        return false;
    }

    function openPlanetTierTab() {
        var link = document.querySelector('.tab-link[data-tab="planet-tier"]');
        var panel = document.querySelector('.tab-panel[data-tab="planet-tier"]');
        if (!link || !panel) return;
        document.querySelectorAll('.tab-link').forEach(function (l) { l.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
        link.classList.add('active');
        panel.classList.add('active');
    }

    function render() {
        rowsEl.innerHTML = '';
        TIERS.forEach(function (tier) {
            var row = document.createElement('div');
            row.className = 'planet-tier-row';
            row.dataset.tier = tier;
            var label = document.createElement('div');
            label.className = 'planet-tier-label';
            label.textContent = tier === 'U' ? '–' : tier;
            var slot = document.createElement('div');
            slot.className = 'planet-tier-slot';
            state[tier].forEach(function (idx) {
                slot.appendChild(makeChip(idx));
            });
            row.appendChild(label);
            row.appendChild(slot);
            rowsEl.appendChild(row);
        });
        if (typeof applyDataImageIn === 'function') applyDataImageIn(rowsEl);
        saveToUrl();
    }

    var dragged = null;
    var dragTier = null;

    rowsEl.addEventListener('dragstart', function (e) {
        var chip = e.target.closest('.planet-tier-chip');
        if (!chip) return;
        dragged = chip;
        dragTier = chip.closest('.planet-tier-row').dataset.tier;
        chip.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', chip.dataset.idx);
    });

    rowsEl.addEventListener('dragend', function (e) {
        if (dragged) dragged.classList.remove('dragging');
        dragged = null;
        dragTier = null;
        rowsEl.querySelectorAll('.planet-tier-row.drag-over').forEach(function (r) { r.classList.remove('drag-over'); });
    });

    rowsEl.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        var row = e.target.closest('.planet-tier-row');
        if (row) {
            rowsEl.querySelectorAll('.planet-tier-row.drag-over').forEach(function (r) {
                if (r !== row) r.classList.remove('drag-over');
            });
            row.classList.add('drag-over');
        }
    });

    rowsEl.addEventListener('dragleave', function (e) {
        if (!e.target.closest('.planet-tier-row')) return;
        var row = e.target.closest('.planet-tier-row');
        var rel = e.relatedTarget;
        if (!rel || !row.contains(rel)) row.classList.remove('drag-over');
    });

    rowsEl.addEventListener('drop', function (e) {
        e.preventDefault();
        rowsEl.querySelectorAll('.planet-tier-row.drag-over').forEach(function (r) { r.classList.remove('drag-over'); });
        var row = e.target.closest('.planet-tier-row');
        if (!row || !dragged) return;
        var toTier = row.dataset.tier;
        var idx = parseInt(dragged.dataset.idx, 10);
        if (dragTier) {
            var arr = state[dragTier];
            var i = arr.indexOf(idx);
            if (i !== -1) arr.splice(i, 1);
        }
        if (state[toTier].indexOf(idx) === -1) state[toTier].push(idx);
        render();
    });

    document.addEventListener('DOMContentLoaded', function () {
        var fromHash = loadFromUrl();
        render();
        if (fromHash) openPlanetTierTab();
    });
})();
