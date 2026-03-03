class PlatformImageTool {
    constructor() {
        this.fileInput = document.getElementById('platformImageInput');
        this.scaleInput = document.getElementById('platformScaleInput');
        this.thresholdInput = document.getElementById('platformThresholdInput');
        this.previewCanvas = document.getElementById('platformPreviewCanvas');
        this.previewCtx = this.previewCanvas.getContext('2d');
        this.generateBtn = document.getElementById('platformGenerateBtn');
        this.outputTextarea = document.getElementById('platformBlueprintOutput');
        this.statusEl = document.getElementById('platformStatus');
        this.copyBtn = document.getElementById('platformCopyBtn');

        this.currentImageSize = null;

        this.bindEvents();
    }

    bindEvents() {
        if (this.fileInput) {
            this.fileInput.addEventListener('change', () => this.loadImage());
        }
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generateBlueprint());
        }
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => this.copyBlueprint());
        }
    }

    setStatus(message, type = 'info') {
        if (!this.statusEl) return;
        const className = type === 'error' ? 'error' : type === 'success' ? 'success' : 'status';
        this.statusEl.innerHTML = `<div class="${className}">${message}</div>`;
    }

    loadImage() {
        const file = this.fileInput && this.fileInput.files ? this.fileInput.files[0] : null;
        if (!file) {
            this.setStatus('Please choose an image file.', 'error');
            return;
        }

        if (!file.type.startsWith('image/')) {
            this.setStatus('Selected file is not an image.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const maxSize = 256;
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                const width = Math.max(1, Math.round(img.width * scale));
                const height = Math.max(1, Math.round(img.height * scale));

                this.previewCanvas.width = width;
                this.previewCanvas.height = height;
                this.previewCtx.clearRect(0, 0, width, height);
                this.previewCtx.drawImage(img, 0, 0, width, height);

                this.currentImageSize = { width, height };
                this.setStatus(`Loaded image at ${width}×${height} for processing.`, 'success');
            };
            img.onerror = () => {
                this.setStatus('Failed to load image.', 'error');
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            this.setStatus('Failed to read image file.', 'error');
        };
        reader.readAsDataURL(file);
    }

    generateBlueprint() {
        if (!this.currentImageSize) {
            this.setStatus('Please load an image first.', 'error');
            return;
        }

        const scaleValue = parseFloat(this.scaleInput.value || '0');
        if (!Number.isFinite(scaleValue) || scaleValue <= 0) {
            this.setStatus('Scale must be a positive number.', 'error');
            return;
        }

        const thresholdValue = parseFloat(this.thresholdInput.value || '0.5');
        const clampedThreshold = Math.min(1, Math.max(0, thresholdValue));

        const { width, height } = this.currentImageSize;
        const imageData = this.previewCtx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const tilesMap = new Map();
        const cx = (width - 1) / 2;
        const cy = (height - 1) / 2;
        const threshold = clampedThreshold * 255;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3];

                if (a === 0) {
                    continue;
                }

                const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                if (luminance >= threshold) {
                    const posX = (x - cx) * scaleValue;
                    const posY = (cy - y) * scaleValue;

                    const tileX = Math.round(posX);
                    const tileY = Math.round(posY);
                    const key = `${tileX},${tileY}`;
                    tilesMap.set(key, {
                        name: 'space-platform-foundation',
                        position: { x: tileX, y: tileY }
                    });
                }
            }
        }

        const tiles = Array.from(tilesMap.values());

        if (tiles.length === 0) {
            this.setStatus('No light pixels found at this threshold. Try lowering the threshold.', 'error');
            this.outputTextarea.value = '';
            return;
        }

        const blueprintData = {
            blueprint: {
                item: 'blueprint',
                label: 'Platform from image',
                tiles,
                icons: [
                    {
                        signal: {
                            type: 'item',
                            name: 'space-platform-foundation'
                        },
                        index: 1
                    }
                ]
            }
        };

        try {
            const blueprintString = encodeBlueprintData(blueprintData);
            this.outputTextarea.value = blueprintString;
            this.setStatus(`Generated blueprint with ${tiles.length} space-platform foundations.`, 'success');
        } catch (e) {
            console.error('Encoding error:', e);
            this.setStatus('Failed to encode blueprint data.', 'error');
        }
    }

    copyBlueprint() {
        const value = this.outputTextarea.value.trim();
        if (!value) {
            this.setStatus('Nothing to copy. Generate a blueprint first.', 'error');
            return;
        }

        navigator.clipboard.writeText(value)
            .then(() => {
                this.setStatus('Blueprint copied to clipboard.', 'success');
            })
            .catch(() => {
                this.setStatus('Failed to copy to clipboard.', 'error');
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('platformImageTool')) {
        window.platformImageTool = new PlatformImageTool();
    }
});

