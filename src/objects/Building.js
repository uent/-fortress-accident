import Phaser from 'phaser';

export default class Building extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type) {
        const frame = getBuildingFrame(type);
        super(scene, x, y, 'buildings', frame);
        
        // Add to scene
        scene.add.existing(this);
        
        // Configure sprite
        this.setOrigin(0.5, 0.5);
        
        // Initialize building properties
        this.type = type;
        this.health = 100;
        this.level = 1;
        this.occupants = [];
        this.production = getProductionValues(type, this.level);
        this.storage = getStorageValues(type, this.level);
        
        // Create selection indicator
        this.selectionCircle = scene.add.circle(x, y, 40, 0x00ff00, 0.3);
        this.selectionCircle.setVisible(false);
        
        // Building construction animation
        this.alpha = 0.5;
        scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                this.isConstructed = true;
            }
        });
    }
    
    select() {
        this.selectionCircle.setVisible(true);
    }
    
    deselect() {
        this.selectionCircle.setVisible(false);
    }
    
    update() {
        // Update selection circle position
        this.selectionCircle.setPosition(this.x, this.y);
    }
    
    upgrade() {
        if (this.level < 3) {
            // Define upgrade costs
            const upgradeCosts = {
                house: { wood: 20 * this.level, stone: 10 * this.level, metal: 5 * this.level },
                farm: { wood: 15 * this.level, stone: 5 * this.level, metal: 2 * this.level },
                workshop: { wood: 30 * this.level, stone: 15 * this.level, metal: 10 * this.level },
                storage: { wood: 25 * this.level, stone: 20 * this.level, metal: 10 * this.level }
            };
            
            const cost = upgradeCosts[this.type];
            const gameData = this.scene.gameData;
            
            // Check if we can afford it
            if (gameData.resources.wood >= cost.wood && 
                gameData.resources.stone >= cost.stone && 
                gameData.resources.metal >= cost.metal) {
                
                // Deduct resources
                gameData.resources.wood -= cost.wood;
                gameData.resources.stone -= cost.stone;
                gameData.resources.metal -= cost.metal;
                
                // Increase level
                this.level++;
                
                // Update production and storage values
                this.production = getProductionValues(this.type, this.level);
                this.storage = getStorageValues(this.type, this.level);
                
                // Update frame to show upgraded building
                const frame = getBuildingFrame(this.type) + (this.level - 1) * 4;
                this.setFrame(frame);
                
                // Upgrade animation
                this.scene.tweens.add({
                    targets: this,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 300,
                    yoyo: true,
                    ease: 'Quad.easeOut'
                });
                
                // Play upgrade sound
                this.scene.sound.play('build-sound');
                
                // Update UI
                this.scene.uiManager.updateResourceDisplay();
                
                return true;
            } else {
                console.log('Not enough resources to upgrade this building');
                return false;
            }
        } else {
            console.log('Building is already at maximum level');
            return false;
        }
    }
    
    repair() {
        if (this.health < 100) {
            // Define repair costs
            const repairCost = {
                wood: Math.ceil((100 - this.health) / 4),
                stone: Math.ceil((100 - this.health) / 8)
            };
            
            const gameData = this.scene.gameData;
            
            // Check if we can afford it
            if (gameData.resources.wood >= repairCost.wood && 
                gameData.resources.stone >= repairCost.stone) {
                
                // Deduct resources
                gameData.resources.wood -= repairCost.wood;
                gameData.resources.stone -= repairCost.stone;
                
                // Repair building
                this.health = 100;
                
                // Repair animation
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0.7,
                    duration: 200,
                    yoyo: true,
                    repeat: 2,
                    ease: 'Linear'
                });
                
                // Play repair sound
                this.scene.sound.play('build-sound');
                
                // Update UI
                this.scene.uiManager.updateResourceDisplay();
                
                return true;
            } else {
                console.log('Not enough resources to repair this building');
                return false;
            }
        } else {
            console.log('Building does not need repairs');
            return false;
        }
    }
    
    destroy() {
        // Clean up
        if (this.selectionCircle) {
            this.selectionCircle.destroy();
        }
        
        // Remove from building list
        const index = this.scene.buildings.indexOf(this);
        if (index > -1) {
            this.scene.buildings.splice(index, 1);
        }
        
        super.destroy();
    }
}

// Helper functions
function getBuildingFrame(type) {
    switch (type) {
        case 'house': return 0;
        case 'farm': return 1;
        case 'workshop': return 2;
        case 'storage': return 3;
        default: return 0;
    }
}

function getProductionValues(type, level) {
    const baseProduction = {
        house: { population: 3 },
        farm: { food: 10 },
        workshop: { wood: 5, stone: 2, metal: 1 },
        storage: {}
    };
    
    const production = { ...baseProduction[type] };
    
    // Scale production with level
    for (const resource in production) {
        production[resource] = Math.floor(production[resource] * (1 + (level - 1) * 0.5));
    }
    
    return production;
}

function getStorageValues(type, level) {
    const baseStorage = {
        house: { food: 20, wood: 10, stone: 5, metal: 2 },
        farm: { food: 50 },
        workshop: { wood: 30, stone: 20, metal: 10 },
        storage: { food: 100, wood: 100, stone: 100, metal: 100 }
    };
    
    const storage = { ...baseStorage[type] };
    
    // Scale storage with level
    for (const resource in storage) {
        storage[resource] = Math.floor(storage[resource] * (1 + (level - 1) * 0.5));
    }
    
    return storage;
}