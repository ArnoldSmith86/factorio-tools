function itemNameToIconId(name) {
    return String(name).replace(/\s+/g, '-').toLowerCase();
}

const QUALITY_INDEX = { normal: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };

function applyDataImage(el) {
    const spec = el.getAttribute('data-image');
    if (!spec || typeof data === 'undefined' || !data.icons) return;
    const parts = spec.split(':');
    let quality;
    let name;
    let sizePart;
    if (parts.length >= 3) {
        quality = parts[0].toLowerCase();
        name = parts[1];
        sizePart = parts[2];
    } else {
        name = parts[0];
        sizePart = parts[1];
    }
    const size = sizePart ? parseInt(sizePart, 10) : 32;
    const icon = data.icons.find((i) => i.id === name);
    if (!icon) return;
    const [xPx, yPx] = icon.position.split(/\s+/).map((s) => Math.abs(parseInt(s, 10)));
    const x = xPx / 66;
    const y = yPx / 66;
    el.classList.add('image');
    el.style.setProperty('--size', String(size));
    el.style.setProperty('--x', String(x));
    el.style.setProperty('--y', String(y));
    if (quality != null && QUALITY_INDEX[quality] !== undefined) {
        el.dataset.quality = quality;
        el.style.setProperty('--quality-index', String(QUALITY_INDEX[quality]));
    }
    el.removeAttribute('data-image');
}

function applyDataImageIn(root) {
    if (root.nodeType === 1 && root.hasAttribute('data-image')) applyDataImage(root);
    if (root.querySelectorAll) root.querySelectorAll('[data-image]').forEach(applyDataImage);
}

addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-image]').forEach(applyDataImage);
    const obs = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType === 1) applyDataImageIn(node);
            }
        }
    });
    obs.observe(document.body, { childList: true, subtree: true });
});
