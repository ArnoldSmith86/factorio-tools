document.addEventListener('DOMContentLoaded', () => {
    const tabLinks = Array.from(document.querySelectorAll('.tab-link'));
    const panels = Array.from(document.querySelectorAll('.tab-panel'));

    if (!tabLinks.length || !panels.length) return;

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.getAttribute('data-tab');
            if (!target) return;

            tabLinks.forEach(l => l.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            link.classList.add('active');
            const panel = panels.find(p => p.getAttribute('data-tab') === target);
            if (panel) panel.classList.add('active');
        });
    });
});

