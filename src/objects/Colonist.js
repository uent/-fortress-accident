import Phaser from 'phaser';

export default class Colonist extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'colonist', 0);
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configure sprite
        this.setCollideWorldBounds(true);
        this.setOrigin(0.5, 0.5);
        this.setScale(1);
        
        // Initialize colonist properties
        this.health = 100;
        this.hunger = 0;
        this.energy = 100;
        this.happiness = 100;
        this.speed = 100;
        this.idleTime = 0;
        this.job = null;
        this.targetResource = null;
        this.targetBuilding = null;
        this.resourceCarrying = null;
        this.resourceAmount = 0;
        
        // Setup state machine
        this.state = 'idle';
        this.targetPosition = null;
        
        // Create selection indicator
        this.selectionCircle = scene.add.circle(x, y, 20, 0xffff00, 0.3);
        this.selectionCircle.setVisible(false);
        
        // Random movement timer
        this.moveTimer = scene.time.addEvent({
            delay: Phaser.Math.Between(2000, 5000),
            callback: this.setRandomTarget,
            callbackScope: this,
            loop: true
        });
        
        // Play idle animation
        this.anims.play('colonist-walk-down');
        this.anims.stop();
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
        
        // State machine
        switch (this.state) {
            case 'idle':
                this.idleTime += 1;
                // Maybe find something to do
                if (this.idleTime > 100) {
                    this.findTask();
                }
                break;
                
            case 'moving':
                this.moveToTarget();
                break;
                
            case 'gathering':
                this.gatherResource();
                break;
                
            case 'returning':
                this.returnResource();
                break;
        }
    }
    
    setRandomTarget() {
        if (this.state === 'idle') {
            const x = Phaser.Math.Between(100, 1500);
            const y = Phaser.Math.Between(100, 1500);
            this.moveToPosition(x, y);
        }
    }
    
    moveToPosition(x, y) {
        this.targetPosition = new Phaser.Math.Vector2(x, y);
        this.state = 'moving';
        
        // Determine direction for animation
        const dx = this.targetPosition.x - this.x;
        const dy = this.targetPosition.y - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // Moving more horizontally
            if (dx > 0) {
                this.anims.play('colonist-walk-right', true);
            } else {
                this.anims.play('colonist-walk-left', true);
            }
        } else {
            // Moving more vertically
            if (dy > 0) {
                this.anims.play('colonist-walk-down', true);
            } else {
                this.anims.play('colonist-walk-up', true);
            }
        }
    }
    
    moveToTarget() {
        if (!this.targetPosition) {
            this.state = 'idle';
            this.anims.stop();
            return;
        }
        
        // Calculate distance to target
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y, 
            this.targetPosition.x, this.targetPosition.y
        );
        
        if (distance < 5) {
            // Reached destination
            this.setVelocity(0, 0);
            this.anims.stop();
            
            // Update state based on what we were doing
            if (this.targetResource && this.state === 'moving') {
                this.state = 'gathering';
                this.gatherTimer = this.scene.time.addEvent({
                    delay: 2000,
                    callback: this.collectResource,
                    callbackScope: this,
                    loop: false
                });
            } else if (this.targetBuilding && this.state === 'returning') {
                // Deposit resources
                this.depositResource();
            } else {
                this.state = 'idle';
                this.idleTime = 0;
            }
            
            return;
        }
        
        // Move towards target
        const direction = new Phaser.Math.Vector2(
            this.targetPosition.x - this.x,
            this.targetPosition.y - this.y
        ).normalize();
        
        this.setVelocity(
            direction.x * this.speed,
            direction.y * this.speed
        );
    }
    
    findTask() {
        // Look for resources to gather
        const resources = this.scene.resources;
        
        if (resources.length > 0) {
            // Find closest resource
            let closestResource = null;
            let closestDistance = Infinity;
            
            for (const resource of resources) {
                const distance = Phaser.Math.Distance.Between(
                    this.x, this.y, resource.x, resource.y
                );
                
                if (distance < closestDistance) {
                    closestResource = resource;
                    closestDistance = distance;
                }
            }
            
            if (closestResource) {
                this.targetResource = closestResource;
                this.moveToPosition(closestResource.x, closestResource.y);
            }
        }
    }
    
    gatherResource() {
        // Wait for gathering animation to complete
        // Handled by gatherTimer
    }
    
    collectResource() {
        if (this.targetResource && this.targetResource.scene) {
            try {
                this.resourceCarrying = this.targetResource.type;
                this.resourceAmount = Math.min(10, this.targetResource.amount);
                
                // Reduce resource amount - check if the harvest method exists
                if (typeof this.targetResource.harvest === 'function') {
                    this.targetResource.harvest(this.resourceAmount);
                } else {
                    console.warn('Resource harvest method is not available');
                    // Manually update the resource amount as fallback
                    this.targetResource.amount -= this.resourceAmount;
                    if (this.targetResource.amount <= 0) {
                        this.targetResource.amount = 0;
                        this.targetResource.depleted = true;
                    }
                }
                
                // Find storage building to return to
                const buildings = this.scene.buildings || [];
                let storageBuilding = null;
                let closestDistance = Infinity;
                
                for (const building of buildings) {
                    if (building && (building.type === 'storage' || building.type === 'house')) {
                        const distance = Phaser.Math.Distance.Between(
                            this.x, this.y, building.x, building.y
                        );
                        
                        if (distance < closestDistance) {
                            storageBuilding = building;
                            closestDistance = distance;
                        }
                    }
                }
                
                if (storageBuilding) {
                    this.targetBuilding = storageBuilding;
                    this.state = 'returning';
                    this.moveToPosition(storageBuilding.x, storageBuilding.y);
                } else {
                    // No storage buildings, just drop the resource
                    this.resourceCarrying = null;
                    this.resourceAmount = 0;
                    this.targetResource = null;
                    this.state = 'idle';
                }
            } catch (error) {
                console.error('Error in collectResource:', error);
                // Reset to safe state
                this.resourceCarrying = null;
                this.resourceAmount = 0;
                this.targetResource = null;
                this.state = 'idle';
            }
        } else {
            // Target resource is invalid
            this.resourceCarrying = null;
            this.resourceAmount = 0;
            this.targetResource = null;
            this.state = 'idle';
        }
    }
    
    returnResource() {
        // Movement is handled by moveToTarget
    }
    
    depositResource() {
        // Add resources to the game data
        if (this.resourceCarrying && this.resourceAmount > 0) {
            const gameData = this.scene.gameData;
            
            switch (this.resourceCarrying) {
                case 'food':
                    gameData.resources.food += this.resourceAmount;
                    break;
                case 'wood':
                    gameData.resources.wood += this.resourceAmount;
                    break;
                case 'stone':
                    gameData.resources.stone += this.resourceAmount;
                    break;
                case 'metal':
                    gameData.resources.metal += this.resourceAmount;
                    break;
            }
            
            // Update UI
            this.scene.uiManager.updateResourceDisplay();
        }
        
        // Reset carrying state
        this.resourceCarrying = null;
        this.resourceAmount = 0;
        this.targetResource = null;
        this.targetBuilding = null;
        this.state = 'idle';
    }
    
    updateNeeds() {
        // Increase hunger
        this.hunger += 5;
        if (this.hunger > 100) {
            this.hunger = 100;
            // Take damage if starving
            this.health -= 5;
        }
        
        // Decrease energy
        this.energy -= 2;
        if (this.energy < 0) {
            this.energy = 0;
            // Colonist needs rest
            this.happiness -= 5;
        }
        
        // Check health
        if (this.health <= 0) {
            // Colonist dies
            this.destroy();
            const index = this.scene.colonists.indexOf(this);
            if (index > -1) {
                this.scene.colonists.splice(index, 1);
                this.scene.gameData.population--;
            }
        }
    }
    
    destroy() {
        // Clean up
        if (this.selectionCircle) {
            this.selectionCircle.destroy();
        }
        
        if (this.moveTimer) {
            this.moveTimer.destroy();
        }
        
        if (this.gatherTimer) {
            this.gatherTimer.destroy();
        }
        
        super.destroy();
    }
}