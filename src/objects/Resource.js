import Phaser from 'phaser';

export default class Resource extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type, amount) {
        // Get appropriate frame for resource type
        const frame = getResourceFrame(type);
        super(scene, x, y, 'resources', frame);
        
        // Add to scene
        scene.add.existing(this);
        
        // Configure sprite
        this.setOrigin(0.5, 0.5);
        
        // Initialize resource properties
        this.type = type;
        this.amount = amount;
        this.maxAmount = amount;
        this.depleted = false;
        
        // Create visual indicator for resource amount
        this.createAmountIndicator();
    }
    
    createAmountIndicator() {
        // Background bar
        this.barBackground = this.scene.add.rectangle(
            this.x,
            this.y + 25,
            30,
            5,
            0x000000
        );
        
        // Foreground bar
        this.barForeground = this.scene.add.rectangle(
            this.x,
            this.y + 25,
            30,
            5,
            getResourceColor(this.type)
        );
        
        // Update bar display
        this.updateAmountIndicator();
    }
    
    updateAmountIndicator() {
        // Calculate width based on amount left
        const width = Math.max(0, 30 * (this.amount / this.maxAmount));
        
        // Update foreground bar width
        this.barForeground.width = width;
        
        // Center the bar
        this.barForeground.x = this.x - (30 - width) / 2;
    }
    
    harvest(amount) {
        // Reduce resource amount
        this.amount -= amount;
        
        // Update visual indicator
        this.updateAmountIndicator();
        
        // Check if resource is depleted
        if (this.amount <= 0) {
            this.amount = 0;
            this.depleted = true;
            
            // Add depletion animation
            const resource = this;
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                duration: 1000,
                onComplete: function() {
                    resource.destroy();
                }
            });
            
            // Remove from resources array
            const index = this.scene.resources.indexOf(this);
            if (index > -1) {
                this.scene.resources.splice(index, 1);
            }
        }
        
        return amount;
    }
    
    destroy() {
        // Clean up
        if (this.barBackground) {
            this.barBackground.destroy();
        }
        
        if (this.barForeground) {
            this.barForeground.destroy();
        }
        
        super.destroy();
    }
}

// Helper functions
function getResourceFrame(type) {
    switch (type) {
        case 'food': return 0;
        case 'wood': return 1;
        case 'stone': return 2;
        case 'metal': return 3;
        default: return 0;
    }
}

function getResourceColor(type) {
    switch (type) {
        case 'food': return 0x00ff00; // Green
        case 'wood': return 0xa52a2a; // Brown
        case 'stone': return 0x808080; // Gray
        case 'metal': return 0xc0c0c0; // Silver
        default: return 0xffffff; // White
    }
}