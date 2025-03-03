import Phaser from 'phaser';
import Colonist from '../objects/Colonist';
import Building from '../objects/Building';
import Resource from '../objects/Resource';
import UIManager from '../utils/UIManager';

// Make classes available to the UI manager
Phaser.Game.prototype.colonistClass = Colonist;
Phaser.Game.prototype.buildingClass = Building;
Phaser.Game.prototype.resourceClass = Resource;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.map = null;
        this.colonists = [];
        this.buildings = [];
        this.resources = [];
        this.selectedEntity = null;
        this.uiManager = null;
        this.gameData = {
            resources: {
                food: 100,
                wood: 100,
                stone: 50,
                metal: 25
            },
            day: 1,
            population: 0
        };
    }

    create() {
        // Create the game world
        this.createWorld();
        
        // Create UI elements
        this.uiManager = new UIManager(this);
        this.uiManager.createUI();
        
        // Create initial resources
        this.createInitialResources();
        
        // Add initial colonists
        this.addColonists(5);
        
        // Set up camera controls
        this.setupCameraControls();
        
        // Set up input handlers
        this.setupInputHandlers();
        
        // Start game loop
        this.startGameLoop();
    }

    createWorld() {
        // Create a tilemap for the game world
        const mapWidth = 50;
        const mapHeight = 50;
        const tileSize = 32;
        
        // Create a simple grid of tiles
        const tileData = [];
        for (let y = 0; y < mapHeight; y++) {
            const row = [];
            for (let x = 0; x < mapWidth; x++) {
                // Simple terrain generation (0 = grass, 1 = dirt, 2 = water)
                let tile = 0; // Default to grass
                
                // Add some random terrain features
                const rand = Math.random();
                if (rand < 0.1) {
                    tile = 1; // Dirt
                } else if (rand < 0.15) {
                    tile = 2; // Water
                }
                
                row.push(tile);
            }
            tileData.push(row);
        }
        
        // Draw the tiles
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const tileType = tileData[y][x];
                const tileX = x * tileSize;
                const tileY = y * tileSize;
                
                // Add the appropriate sprite based on tile type
                const tile = this.add.sprite(tileX, tileY, 'terrain', tileType);
                tile.setOrigin(0, 0);
            }
        }
        
        // Set world bounds
        this.physics.world.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);
    }

    createInitialResources() {
        // Add some resource nodes to the map
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(100, 1500);
            const y = Phaser.Math.Between(100, 1500);
            const type = Phaser.Math.RND.pick(['wood', 'stone', 'metal', 'food']);
            const amount = Phaser.Math.Between(50, 200);
            
            const resource = new Resource(this, x, y, type, amount);
            this.resources.push(resource);
        }
    }

    addColonists(count) {
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(400, 600);
            const y = Phaser.Math.Between(300, 400);
            const colonist = new Colonist(this, x, y);
            this.colonists.push(colonist);
            this.gameData.population++;
        }
    }

    setupCameraControls() {
        // Setup camera
        this.cameras.main.setBounds(0, 0, 1600, 1600);
        this.cameras.main.setZoom(1);

        // Camera control variables
        this.cameraSpeed = 10;
        this.cameraZoomSpeed = 0.1;
        this.cursors = this.input.keyboard.createCursorKeys();

        // Drag to move camera
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
                this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
            }
        });

        // Zoom with mouse wheel
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            const newZoom = this.cameras.main.zoom - (deltaY * 0.001);
            this.cameras.main.setZoom(Phaser.Math.Clamp(newZoom, 0.5, 2));
        });
    }

    setupInputHandlers() {
        // Click to select entities
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                // Right-click to command selected units
                if (this.selectedEntity && this.selectedEntity.moveToPosition) {
                    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                    this.selectedEntity.moveToPosition(worldPoint.x, worldPoint.y);
                }
            } else {
                // Left-click to select units or buildings
                this.selectEntityAtPosition(pointer.worldX, pointer.worldY);
            }
        });

        // Building placement mode
        this.buildingMode = false;
        this.currentBuildingType = null;
        this.buildingPreview = null;

        // Key B to toggle building mode
        this.input.keyboard.on('keydown-B', () => {
            this.toggleBuildingMode('house');
        });

        // Key H to build house
        this.input.keyboard.on('keydown-H', () => {
            this.toggleBuildingMode('house');
        });

        // Key F to build farm
        this.input.keyboard.on('keydown-F', () => {
            this.toggleBuildingMode('farm');
        });

        // Key W to build wood workshop
        this.input.keyboard.on('keydown-W', () => {
            this.toggleBuildingMode('workshop');
        });
    }

    toggleBuildingMode(buildingType) {
        // Toggle building placement mode
        this.buildingMode = !this.buildingMode;

        if (this.buildingMode) {
            this.currentBuildingType = buildingType;
            // Create a preview sprite
            this.buildingPreview = this.add.sprite(0, 0, 'buildings', this.getBuildingFrame(buildingType));
            this.buildingPreview.setAlpha(0.7);
        } else {
            // Clear building mode
            this.currentBuildingType = null;
            if (this.buildingPreview) {
                this.buildingPreview.destroy();
                this.buildingPreview = null;
            }
        }
    }

    getBuildingFrame(type) {
        switch (type) {
            case 'house': return 0;
            case 'farm': return 1;
            case 'workshop': return 2;
            case 'storage': return 3;
            default: return 0;
        }
    }

    selectEntityAtPosition(x, y) {
        // Clear current selection
        if (this.selectedEntity) {
            this.selectedEntity.deselect();
        }

        // Check for colonists
        let found = false;
        for (const colonist of this.colonists) {
            if (Phaser.Math.Distance.Between(x, y, colonist.x, colonist.y) < 20) {
                this.selectedEntity = colonist;
                colonist.select();
                found = true;
                break;
            }
        }

        // If no colonist found, check for buildings
        if (!found) {
            for (const building of this.buildings) {
                if (Phaser.Math.Distance.Between(x, y, building.x, building.y) < 40) {
                    this.selectedEntity = building;
                    building.select();
                    found = true;
                    break;
                }
            }
        }

        // If nothing found, clear selection
        if (!found) {
            this.selectedEntity = null;
        }

        // Update UI for the selected entity
        this.uiManager.updateSelectionInfo(this.selectedEntity);
    }

    startGameLoop() {
        // Start day/night cycle timer
        this.time.addEvent({
            delay: 60000, // 1 minute per day
            callback: this.advanceDay,
            callbackScope: this,
            loop: true
        });
    }

    advanceDay() {
        // Increment day counter
        this.gameData.day++;
        
        // Update resources (consumption, production)
        this.updateResources();
        
        // Update colonist needs
        this.updateColonists();
        
        // Update UI
        this.uiManager.updateResourceDisplay();
    }

    updateResources() {
        // Calculate resource production from buildings
        let foodProduction = 0;
        let woodProduction = 0;
        let stoneProduction = 0;
        let metalProduction = 0;

        for (const building of this.buildings) {
            if (building.type === 'farm') {
                foodProduction += 10;
            } else if (building.type === 'workshop') {
                woodProduction += 5;
                stoneProduction += 2;
                metalProduction += 1;
            }
        }

        // Calculate resource consumption
        const foodConsumption = this.gameData.population * 2;

        // Update resource amounts
        this.gameData.resources.food += foodProduction - foodConsumption;
        this.gameData.resources.wood += woodProduction;
        this.gameData.resources.stone += stoneProduction;
        this.gameData.resources.metal += metalProduction;

        // Handle starvation if food is negative
        if (this.gameData.resources.food < 0) {
            this.handleStarvation();
            this.gameData.resources.food = 0;
        }
    }

    updateColonists() {
        for (const colonist of this.colonists) {
            colonist.updateNeeds();
        }
    }

    handleStarvation() {
        // Remove a colonist if there's not enough food
        if (this.colonists.length > 0 && Math.random() < 0.3) {
            const index = Math.floor(Math.random() * this.colonists.length);
            this.colonists[index].destroy();
            this.colonists.splice(index, 1);
            this.gameData.population--;
        }
    }

    update() {
        // Camera movement with keyboard
        if (this.cursors.left.isDown) {
            this.cameras.main.scrollX -= this.cameraSpeed;
        } else if (this.cursors.right.isDown) {
            this.cameras.main.scrollX += this.cameraSpeed;
        }

        if (this.cursors.up.isDown) {
            this.cameras.main.scrollY -= this.cameraSpeed;
        } else if (this.cursors.down.isDown) {
            this.cameras.main.scrollY += this.cameraSpeed;
        }

        // Update building preview position
        if (this.buildingMode && this.buildingPreview) {
            const worldPoint = this.cameras.main.getWorldPoint(this.input.x, this.input.y);
            this.buildingPreview.x = Math.floor(worldPoint.x / 32) * 32 + 16;
            this.buildingPreview.y = Math.floor(worldPoint.y / 32) * 32 + 16;

            // Place building on click
            if (this.input.activePointer.isDown && !this.input.activePointer.rightButtonDown()) {
                this.placeBuilding(this.buildingPreview.x, this.buildingPreview.y);
            }
        }

        // Update all game entities
        for (const colonist of this.colonists) {
            colonist.update();
        }
    }

    placeBuilding(x, y) {
        // Check if we have enough resources
        const costs = {
            house: { wood: 20, stone: 10, metal: 0 },
            farm: { wood: 15, stone: 5, metal: 0 },
            workshop: { wood: 30, stone: 15, metal: 5 },
            storage: { wood: 25, stone: 20, metal: 10 }
        };

        const cost = costs[this.currentBuildingType];
        
        // Check if we can afford it
        if (this.gameData.resources.wood >= cost.wood && 
            this.gameData.resources.stone >= cost.stone && 
            this.gameData.resources.metal >= cost.metal) {
            
            // Deduct resources
            this.gameData.resources.wood -= cost.wood;
            this.gameData.resources.stone -= cost.stone;
            this.gameData.resources.metal -= cost.metal;
            
            // Create the building
            const building = new Building(this, x, y, this.currentBuildingType);
            this.buildings.push(building);
            
            // Play build sound
            this.sound.play('build-sound');
            
            // Update UI
            this.uiManager.updateResourceDisplay();
            
            // Exit building mode
            this.toggleBuildingMode(null);
        } else {
            console.log('Not enough resources to build this building');
        }
    }
}