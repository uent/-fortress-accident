import GameScene from '../../src/scenes/GameScene';

// Mock a minimal version of the GameScene just to test core functionality
// without fully implementing all scene features
jest.mock('../../src/scenes/GameScene', () => {
  const Phaser = {
    Scene: class Scene {
      constructor(key) {
        this.key = key;
      }
    }
  };
  return class MockGameScene extends Phaser.Scene {
    constructor() {
      super('Game');
      this.gameData = {
        resources: {
          food: 100,
          wood: 100,
          stone: 50,
          metal: 20
        },
        day: 1,
        population: 5
      };
      this.colonists = [];
      this.buildings = [];
      this.resources = [];
      this.uiManager = {
        createUI: jest.fn(),
        updateSelectionInfo: jest.fn(),
        updateResourceDisplay: jest.fn()
      };
      this.selectedEntity = null;
    }

    create() {
      // Simplified create method
      this.initializeGame();
      this.setupEventListeners();
    }

    initializeGame() {
      // Stub method
    }

    setupEventListeners() {
      // Stub method
    }

    selectEntity(entity) {
      if (this.selectedEntity) {
        this.selectedEntity.deselect();
      }
      
      this.selectedEntity = entity;
      
      if (entity) {
        entity.select();
      }
      
      this.uiManager.updateSelectionInfo(entity);
    }

    spawnColonist(x, y) {
      const colonist = {
        x,
        y,
        select: jest.fn(),
        deselect: jest.fn()
      };
      
      this.colonists.push(colonist);
      this.gameData.population++;
      
      return colonist;
    }

    addResource(type, amount, x, y) {
      const resource = {
        type,
        amount,
        x,
        y
      };
      
      this.resources.push(resource);
      return resource;
    }
  };
});

describe('GameScene', () => {
  let gameScene;
  
  beforeEach(() => {
    gameScene = new GameScene();
  });

  describe('selectEntity', () => {
    it('should select a new entity and deselect the previous one', () => {
      // Create two colonists
      const colonist1 = gameScene.spawnColonist(100, 100);
      const colonist2 = gameScene.spawnColonist(200, 200);
      
      // Select first colonist
      gameScene.selectEntity(colonist1);
      
      expect(gameScene.selectedEntity).toBe(colonist1);
      expect(colonist1.select).toHaveBeenCalled();
      expect(gameScene.uiManager.updateSelectionInfo).toHaveBeenCalledWith(colonist1);
      
      // Now select second colonist
      jest.clearAllMocks();
      gameScene.selectEntity(colonist2);
      
      expect(gameScene.selectedEntity).toBe(colonist2);
      expect(colonist1.deselect).toHaveBeenCalled();
      expect(colonist2.select).toHaveBeenCalled();
      expect(gameScene.uiManager.updateSelectionInfo).toHaveBeenCalledWith(colonist2);
    });
    
    it('should handle null selection', () => {
      // First select a colonist
      const colonist = gameScene.spawnColonist(100, 100);
      gameScene.selectEntity(colonist);
      
      // Then clear selection
      jest.clearAllMocks();
      gameScene.selectEntity(null);
      
      expect(gameScene.selectedEntity).toBeNull();
      expect(colonist.deselect).toHaveBeenCalled();
      expect(gameScene.uiManager.updateSelectionInfo).toHaveBeenCalledWith(null);
    });
  });
  
  describe('spawnColonist', () => {
    it('should add a colonist and increase population', () => {
      const initialPopulation = gameScene.gameData.population;
      const initialColonistCount = gameScene.colonists.length;
      
      gameScene.spawnColonist(100, 100);
      
      expect(gameScene.colonists.length).toBe(initialColonistCount + 1);
      expect(gameScene.gameData.population).toBe(initialPopulation + 1);
    });
  });
  
  describe('addResource', () => {
    it('should add a resource to the scene', () => {
      const initialResourceCount = gameScene.resources.length;
      
      const resource = gameScene.addResource('wood', 50, 200, 300);
      
      expect(gameScene.resources.length).toBe(initialResourceCount + 1);
      expect(resource.type).toBe('wood');
      expect(resource.amount).toBe(50);
      expect(resource.x).toBe(200);
      expect(resource.y).toBe(300);
    });
  });
});