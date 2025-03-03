import Phaser from 'phaser';

export default class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.gameData = scene.gameData;
        this.resourceTexts = {};
        this.selectionInfoTexts = [];
        this.buildButtons = [];
    }
    
    createUI() {
        // Create UI panel
        this.createResourcePanel();
        this.createSelectionPanel();
        this.createBuildPanel();
        
        // Update resource display
        this.updateResourceDisplay();
    }
    
    createResourcePanel() {
        const width = this.scene.cameras.main.width;
        
        // Create background panel
        this.resourcePanel = this.scene.add.rectangle(
            width / 2, 
            20, 
            width * 0.8, 
            40, 
            0x333333, 
            0.8
        ).setScrollFactor(0);
        
        // Create resource text displays
        const resources = ['food', 'wood', 'stone', 'metal'];
        const resourceIcons = ['🍖', '🌲', '🪨', '⚙️'];
        const resourceColors = [0x00ff00, 0xa52a2a, 0xaaaaaa, 0xc0c0c0];
        
        // Position variables
        const startX = width * 0.2;
        const spacing = width * 0.2;
        
        // Create resource texts
        for (let i = 0; i < resources.length; i++) {
            const resource = resources[i];
            const x = startX + i * spacing;
            
            // Resource icon
            this.scene.add.text(
                x - 40,
                20,
                resourceIcons[i],
                {
                    fontSize: '20px'
                }
            ).setOrigin(0.5, 0.5).setScrollFactor(0);
            
            // Resource count
            this.resourceTexts[resource] = this.scene.add.text(
                x,
                20,
                '0',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: `#${resourceColors[i].toString(16).padStart(6, '0')}`
                }
            ).setOrigin(0, 0.5).setScrollFactor(0);
        }
        
        // Add day counter
        this.scene.add.text(
            width * 0.9,
            20,
            'Day:',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff'
            }
        ).setOrigin(1, 0.5).setScrollFactor(0);
        
        this.dayText = this.scene.add.text(
            width * 0.95,
            20,
            this.gameData.day.toString(),
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff'
            }
        ).setOrigin(0, 0.5).setScrollFactor(0);
    }
    
    createSelectionPanel() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create background panel
        this.selectionPanel = this.scene.add.rectangle(
            width - 150, 
            height / 2, 
            300, 
            height * 0.6, 
            0x333333, 
            0.8
        ).setScrollFactor(0);
        
        // Add selection title
        this.selectionTitle = this.scene.add.text(
            width - 150,
            height * 0.25,
            'Nothing Selected',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5).setScrollFactor(0);
        
        // Add empty space for selection info
        // This will be populated when something is selected
    }
    
    createBuildPanel() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create background panel
        this.buildPanel = this.scene.add.rectangle(
            150, 
            height / 2, 
            300, 
            height * 0.6, 
            0x333333, 
            0.8
        ).setScrollFactor(0);
        
        // Add build title
        this.scene.add.text(
            150,
            height * 0.25,
            'Build',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5).setScrollFactor(0);
        
        // Add building buttons
        const buildings = [
            { type: 'house', name: 'House', key: 'H' },
            { type: 'farm', name: 'Farm', key: 'F' },
            { type: 'workshop', name: 'Workshop', key: 'W' },
            { type: 'storage', name: 'Storage', key: 'S' }
        ];
        
        // Position variables
        const startY = height * 0.35;
        const spacing = 60;
        
        // Create building buttons
        for (let i = 0; i < buildings.length; i++) {
            const building = buildings[i];
            const y = startY + i * spacing;
            
            // Button background
            const button = this.scene.add.rectangle(
                150,
                y,
                250,
                50,
                0x666666
            ).setScrollFactor(0).setInteractive();
            
            // Building name
            const nameText = this.scene.add.text(
                70,
                y,
                building.name,
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ffffff'
                }
            ).setOrigin(0, 0.5).setScrollFactor(0);
            
            // Key hint
            const keyText = this.scene.add.text(
                230,
                y,
                `[${building.key}]`,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#aaaaaa'
                }
            ).setOrigin(0.5, 0.5).setScrollFactor(0);
            
            // Add hover effects
            button.on('pointerover', () => {
                button.setFillStyle(0x888888);
            });
            
            button.on('pointerout', () => {
                button.setFillStyle(0x666666);
            });
            
            // Add click handler
            button.on('pointerdown', () => {
                this.scene.sound.play('click-sound');
                this.scene.toggleBuildingMode(building.type);
            });
            
            this.buildButtons.push({ button, nameText, keyText, type: building.type });
        }
    }
    
    updateResourceDisplay() {
        // Update resource counts
        for (const resource in this.resourceTexts) {
            this.resourceTexts[resource].setText(
                Math.floor(this.gameData.resources[resource]).toString()
            );
        }
        
        // Update day counter
        this.dayText.setText(this.gameData.day.toString());
    }
    
    updateSelectionInfo(selectedEntity) {
        // Clear previous selection info
        for (const text of this.selectionInfoTexts) {
            text.destroy();
        }
        this.selectionInfoTexts = [];
        
        if (!selectedEntity) {
            this.selectionTitle.setText('Nothing Selected');
            return;
        }
        
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const startY = height * 0.35;
        const lineHeight = 25;
        
        // Update title based on selection type
        if (selectedEntity instanceof this.scene.colonistClass) {
            this.selectionTitle.setText('Colonist');
            
            // Add colonist stats
            const stats = [
                { name: 'Health', value: selectedEntity.health },
                { name: 'Hunger', value: selectedEntity.hunger },
                { name: 'Energy', value: selectedEntity.energy },
                { name: 'Happiness', value: selectedEntity.happiness }
            ];
            
            for (let i = 0; i < stats.length; i++) {
                const stat = stats[i];
                const y = startY + i * lineHeight;
                
                // Stat name
                const nameText = this.scene.add.text(
                    width - 250,
                    y,
                    stat.name + ':',
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#ffffff'
                    }
                ).setOrigin(0, 0.5).setScrollFactor(0);
                
                // Stat value
                const valueText = this.scene.add.text(
                    width - 50,
                    y,
                    stat.value.toString(),
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#ffffff'
                    }
                ).setOrigin(1, 0.5).setScrollFactor(0);
                
                this.selectionInfoTexts.push(nameText, valueText);
            }
            
            // Add current state
            const stateText = this.scene.add.text(
                width - 150,
                startY + 4 * lineHeight,
                `State: ${selectedEntity.state}`,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffff00'
                }
            ).setOrigin(0.5, 0.5).setScrollFactor(0);
            
            this.selectionInfoTexts.push(stateText);
            
        } else if (selectedEntity instanceof this.scene.buildingClass) {
            this.selectionTitle.setText(`${selectedEntity.type.charAt(0).toUpperCase() + selectedEntity.type.slice(1)} (Lvl ${selectedEntity.level})`);
            
            // Add building stats
            const stats = [
                { name: 'Health', value: selectedEntity.health }
            ];
            
            for (let i = 0; i < stats.length; i++) {
                const stat = stats[i];
                const y = startY + i * lineHeight;
                
                // Stat name
                const nameText = this.scene.add.text(
                    width - 250,
                    y,
                    stat.name + ':',
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#ffffff'
                    }
                ).setOrigin(0, 0.5).setScrollFactor(0);
                
                // Stat value
                const valueText = this.scene.add.text(
                    width - 50,
                    y,
                    stat.value.toString(),
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#ffffff'
                    }
                ).setOrigin(1, 0.5).setScrollFactor(0);
                
                this.selectionInfoTexts.push(nameText, valueText);
            }
            
            // Add production info
            const productionY = startY + 2 * lineHeight;
            const productionTitle = this.scene.add.text(
                width - 150,
                productionY,
                'Production:',
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffff00'
                }
            ).setOrigin(0.5, 0.5).setScrollFactor(0);
            
            this.selectionInfoTexts.push(productionTitle);
            
            let i = 0;
            for (const resource in selectedEntity.production) {
                const value = selectedEntity.production[resource];
                const y = productionY + (i + 1) * lineHeight;
                
                // Resource name
                const nameText = this.scene.add.text(
                    width - 250,
                    y,
                    resource + ':',
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#ffffff'
                    }
                ).setOrigin(0, 0.5).setScrollFactor(0);
                
                // Resource value
                const valueText = this.scene.add.text(
                    width - 50,
                    y,
                    value.toString(),
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#ffffff'
                    }
                ).setOrigin(1, 0.5).setScrollFactor(0);
                
                this.selectionInfoTexts.push(nameText, valueText);
                i++;
            }
            
            // Add upgrade button
            if (selectedEntity.level < 3) {
                const upgradeButton = this.scene.add.rectangle(
                    width - 150,
                    height * 0.7,
                    200,
                    40,
                    0x006600
                ).setScrollFactor(0).setInteractive();
                
                const upgradeText = this.scene.add.text(
                    width - 150,
                    height * 0.7,
                    'Upgrade',
                    {
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                ).setOrigin(0.5, 0.5).setScrollFactor(0);
                
                // Add hover effects
                upgradeButton.on('pointerover', () => {
                    upgradeButton.setFillStyle(0x008800);
                });
                
                upgradeButton.on('pointerout', () => {
                    upgradeButton.setFillStyle(0x006600);
                });
                
                // Add click handler
                upgradeButton.on('pointerdown', () => {
                    this.scene.sound.play('click-sound');
                    selectedEntity.upgrade();
                    this.updateSelectionInfo(selectedEntity);
                });
                
                this.selectionInfoTexts.push(upgradeButton, upgradeText);
            }
            
            // Add repair button if health is less than 100
            if (selectedEntity.health < 100) {
                const repairButton = this.scene.add.rectangle(
                    width - 150,
                    height * 0.76,
                    200,
                    40,
                    0x660000
                ).setScrollFactor(0).setInteractive();
                
                const repairText = this.scene.add.text(
                    width - 150,
                    height * 0.76,
                    'Repair',
                    {
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                ).setOrigin(0.5, 0.5).setScrollFactor(0);
                
                // Add hover effects
                repairButton.on('pointerover', () => {
                    repairButton.setFillStyle(0x880000);
                });
                
                repairButton.on('pointerout', () => {
                    repairButton.setFillStyle(0x660000);
                });
                
                // Add click handler
                repairButton.on('pointerdown', () => {
                    this.scene.sound.play('click-sound');
                    selectedEntity.repair();
                    this.updateSelectionInfo(selectedEntity);
                });
                
                this.selectionInfoTexts.push(repairButton, repairText);
            }
        }
    }
}