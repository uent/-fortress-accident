import UIManager from '../../src/utils/UIManager';
import Colonist from '../../src/objects/Colonist';
import Phaser from 'phaser';

describe('UIManager', () => {
  let mockScene;
  let uiManager;
  
  beforeEach(() => {
    // Setup a mock scene
    mockScene = new Phaser.Scene();
    mockScene.gameData = {
      resources: {
        food: 0,
        wood: 0,
        stone: 0,
        metal: 0
      },
      day: 1,
      population: 0
    };
    mockScene.colonistClass = Colonist;
    
    // Create UI Manager
    uiManager = new UIManager(mockScene);
  });

  describe('constructor', () => {
    it('should initialize with the correct properties', () => {
      expect(uiManager.scene).toBe(mockScene);
      expect(uiManager.gameData).toBe(mockScene.gameData);
      expect(uiManager.resourceTexts).toEqual({});
      expect(uiManager.selectionInfoTexts).toEqual([]);
      expect(uiManager.buildButtons).toEqual([]);
    });
  });
  
  describe('createUI', () => {
    it('should create all UI panels', () => {
      // Spy on panel creation methods
      const resourcePanelSpy = jest.spyOn(uiManager, 'createResourcePanel');
      const selectionPanelSpy = jest.spyOn(uiManager, 'createSelectionPanel');
      const buildPanelSpy = jest.spyOn(uiManager, 'createBuildPanel');
      const updateResourceSpy = jest.spyOn(uiManager, 'updateResourceDisplay');
      
      uiManager.createUI();
      
      expect(resourcePanelSpy).toHaveBeenCalled();
      expect(selectionPanelSpy).toHaveBeenCalled();
      expect(buildPanelSpy).toHaveBeenCalled();
      expect(updateResourceSpy).toHaveBeenCalled();
    });
  });
  
  describe('createResourcePanel', () => {
    it('should create resource panel with correct elements', () => {
      uiManager.createResourcePanel();
      
      // Check background panel
      expect(mockScene.add.rectangle).toHaveBeenCalled();
      expect(uiManager.resourcePanel).toBeDefined();
      
      // Check resource texts
      expect(mockScene.add.text).toHaveBeenCalled();
      expect(uiManager.resourceTexts.food).toBeDefined();
      expect(uiManager.resourceTexts.wood).toBeDefined();
      expect(uiManager.resourceTexts.stone).toBeDefined();
      expect(uiManager.resourceTexts.metal).toBeDefined();
      expect(uiManager.dayText).toBeDefined();
    });
  });
  
  describe('createSelectionPanel', () => {
    it('should create selection panel with title', () => {
      uiManager.createSelectionPanel();
      
      expect(mockScene.add.rectangle).toHaveBeenCalled();
      expect(uiManager.selectionPanel).toBeDefined();
      expect(uiManager.selectionTitle).toBeDefined();
      expect(uiManager.selectionTitle.text).toBe('Nothing Selected');
    });
  });
  
  describe('createBuildPanel', () => {
    it('should create build panel with building buttons', () => {
      uiManager.createBuildPanel();
      
      expect(mockScene.add.rectangle).toHaveBeenCalled();
      expect(uiManager.buildPanel).toBeDefined();
      
      // Check if building buttons were created
      expect(uiManager.buildButtons.length).toBe(4);
      expect(uiManager.buildButtons[0].type).toBe('house');
      expect(uiManager.buildButtons[1].type).toBe('farm');
      expect(uiManager.buildButtons[2].type).toBe('workshop');
      expect(uiManager.buildButtons[3].type).toBe('storage');
    });
    
    it('should setup click handlers for building buttons', () => {
      // Mock the scene's toggleBuildingMode method
      mockScene.toggleBuildingMode = jest.fn();
      mockScene.sound.play = jest.fn();
      
      uiManager.createBuildPanel();
      
      // Simulate clicking the first button
      const button = uiManager.buildButtons[0].button;
      button.emit('pointerdown');
      
      expect(mockScene.sound.play).toHaveBeenCalledWith('click-sound');
      expect(mockScene.toggleBuildingMode).toHaveBeenCalledWith('house');
    });
  });
  
  describe('updateResourceDisplay', () => {
    it('should update resource text content', () => {
      // Create resource panel to initialize resourceTexts
      uiManager.createResourcePanel();
      
      // Set some resource values
      mockScene.gameData.resources.food = 10;
      mockScene.gameData.resources.wood = 20;
      mockScene.gameData.day = 5;
      
      // Spy on setText methods
      const foodTextSpy = jest.spyOn(uiManager.resourceTexts.food, 'setText');
      const woodTextSpy = jest.spyOn(uiManager.resourceTexts.wood, 'setText');
      const dayTextSpy = jest.spyOn(uiManager.dayText, 'setText');
      
      uiManager.updateResourceDisplay();
      
      expect(foodTextSpy).toHaveBeenCalledWith('10');
      expect(woodTextSpy).toHaveBeenCalledWith('20');
      expect(dayTextSpy).toHaveBeenCalledWith('5');
    });
    
    it('should handle fractional values by flooring them', () => {
      uiManager.createResourcePanel();
      mockScene.gameData.resources.stone = 15.7;
      
      const stoneTextSpy = jest.spyOn(uiManager.resourceTexts.stone, 'setText');
      
      uiManager.updateResourceDisplay();
      
      expect(stoneTextSpy).toHaveBeenCalledWith('15');
    });
  });
  
  describe('updateSelectionInfo', () => {
    it('should clear previous selection info', () => {
      // Add some mock text elements to selectionInfoTexts
      const mockText1 = { destroy: jest.fn() };
      const mockText2 = { destroy: jest.fn() };
      uiManager.selectionInfoTexts = [mockText1, mockText2];
      uiManager.createSelectionPanel();
      
      uiManager.updateSelectionInfo(null);
      
      expect(mockText1.destroy).toHaveBeenCalled();
      expect(mockText2.destroy).toHaveBeenCalled();
      expect(uiManager.selectionInfoTexts.length).toBe(0);
      expect(uiManager.selectionTitle.text).toBe('Nothing Selected');
    });
    
    it('should update UI for colonist selection', () => {
      uiManager.createSelectionPanel();
      const colonist = new Colonist(mockScene, 100, 200);
      colonist.health = 90;
      colonist.hunger = 30;
      colonist.energy = 70;
      colonist.happiness = 85;
      colonist.state = 'moving';
      
      // Clear mocks to count new calls
      jest.clearAllMocks();
      
      uiManager.updateSelectionInfo(colonist);
      
      // Check if title is updated
      expect(uiManager.selectionTitle.text).toBe('Colonist');
      
      // Check if stats are displayed
      expect(mockScene.add.text).toHaveBeenCalled();
      expect(uiManager.selectionInfoTexts.length).toBeGreaterThan(0);
    });
    
    it('should update UI for building selection with upgrade button', () => {
      uiManager.createSelectionPanel();
      mockScene.buildingClass = function() {};
      const building = {
        type: 'house',
        level: 1,
        health: 100,
        production: {
          food: 0,
          wood: 0
        },
        upgrade: jest.fn(),
        repair: jest.fn(),
        // Mock the instanceof check
        __proto__: mockScene.buildingClass.prototype
      };
      
      // Clear mocks to count new calls
      jest.clearAllMocks();
      
      uiManager.updateSelectionInfo(building);
      
      // Check if title is updated
      expect(uiManager.selectionTitle.text).toBe('House (Lvl 1)');
      
      // Verify upgrade button exists
      const upgradeButtons = uiManager.selectionInfoTexts.filter(
        item => item.text === 'Upgrade'
      );
      expect(upgradeButtons.length).toBeGreaterThan(0);
      
      // No repair button should be shown (health is 100)
      const repairButtons = uiManager.selectionInfoTexts.filter(
        item => item.text === 'Repair'
      );
      expect(repairButtons.length).toBe(0);
    });
    
    it('should show repair button for damaged buildings', () => {
      uiManager.createSelectionPanel();
      mockScene.buildingClass = function() {};
      const building = {
        type: 'house',
        level: 1,
        health: 50,
        production: {
          food: 0,
          wood: 0
        },
        upgrade: jest.fn(),
        repair: jest.fn(),
        // Mock the instanceof check
        __proto__: mockScene.buildingClass.prototype
      };
      
      // Clear mocks to count new calls
      jest.clearAllMocks();
      
      uiManager.updateSelectionInfo(building);
      
      // Verify repair button exists
      const repairButtonExists = uiManager.selectionInfoTexts.some(item => 
        item.text && item.text === 'Repair'
      );
      expect(repairButtonExists).toBe(true);
    });
  });
});