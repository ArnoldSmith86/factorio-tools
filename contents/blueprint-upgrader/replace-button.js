
class ReplaceButton {
    constructor(area, from, to, rowElement, dataType = 'entity') {
        this.area = area;
        this.from = from;
        this.to = to;
        this.rowElement = rowElement;
        this.dataType = dataType;
        this.isActive = false;
        this.buttonElement = null;
    }
    
    render(target) {
        this.buttonElement = document.createElement('button');
        this.buttonElement.className = 'replace-button';
        this.buttonElement.style.cssText = 'font-size: 12px; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px; margin: 2px;';
        
        // Parse target name to extract quality and base name
        const targetParts = this.to.split(' ');
        let targetQuality = 'normal';
        let targetBaseName = this.to;
        
        if (targetParts.length > 1 && ['uncommon', 'rare', 'epic', 'legendary'].includes(targetParts[0])) {
            targetQuality = targetParts[0];
            targetBaseName = targetParts.slice(1).join(' ');
        }
        
        const iconId = itemNameToIconId(targetBaseName);
        const dataImage = targetQuality === 'normal' ? `${iconId}:32` : `${targetQuality}:${iconId}:32`;
        this.buttonElement.innerHTML = `
            <div style="position: relative; width: 32px; height: 32px;">
                <span data-image="${dataImage}" style="display: block; width: 32px; height: 32px;"></span>
            </div>
        `;
        this.buttonElement.addEventListener('click', () => {
            this.toggleActive();
        });
        
        target.appendChild(this.buttonElement);
    }
    
    toggleActive() {
        // Deactivate all other buttons in the same row
        if (this.rowElement) {
            const allButtons = this.rowElement.querySelectorAll('.replace-button');
            allButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.backgroundColor = '';
            });
        }
        
        // Toggle this button's active state
        this.isActive = !this.isActive;
        if (this.buttonElement) {
            if (this.isActive) {
                this.buttonElement.classList.add('active');
                this.buttonElement.style.backgroundColor = 'orange';
            } else {
                this.buttonElement.classList.remove('active');
                this.buttonElement.style.backgroundColor = '';
            }
        }
    }
    
    getReplacement() {
        return this.isActive ? { from: this.from, to: this.to, type: this.dataType } : null;
    }
}
