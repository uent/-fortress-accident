import Resource from '../../src/objects/Resource';
import Phaser from 'phaser';

describe('Resource', () => {
  let mockScene;
  
  beforeEach(() => {
    // Setup a mock scene
    mockScene = new Phaser.Scene();
    mockScene.resources = [];
  });

  describe('constructor', () => {
    it('should create a resource with the correct properties', () => {
      const resource = new Resource(mockScene, 100, 200, 'wood', 50);
      
      expect(resource.x).toBe(100);
      expect(resource.y).toBe(200);
      expect(resource.type).toBe('wood');
      expect(resource.amount).toBe(50);
      expect(resource.maxAmount).toBe(50);
      expect(resource.depleted).toBe(false);
    });
    
    it('should create visual indicators', () => {
      const resource = new Resource(mockScene, 100, 200, 'wood', 50);
      
      expect(mockScene.add.rectangle).toHaveBeenCalledTimes(2);
      expect(resource.barBackground).toBeDefined();
      expect(resource.barForeground).toBeDefined();
    });
  });
  
  describe('updateAmountIndicator', () => {
    it('should update the foreground bar width based on remaining amount', () => {
      const resource = new Resource(mockScene, 100, 200, 'stone', 50);
      resource.amount = 25; // 50% remaining
      
      resource.updateAmountIndicator();
      
      expect(resource.barForeground.width).toBe(15); // 50% of 30
    });
    
    it('should handle zero remaining amount', () => {
      const resource = new Resource(mockScene, 100, 200, 'stone', 50);
      resource.amount = 0;
      
      resource.updateAmountIndicator();
      
      expect(resource.barForeground.width).toBe(0);
    });
  });
  
  describe('harvest', () => {
    it('should reduce resource amount and update indicator', () => {
      const resource = new Resource(mockScene, 100, 200, 'food', 50);
      const initialAmount = resource.amount;
      const harvestedAmount = 10;
      
      // Spy on updateAmountIndicator
      const updateSpy = jest.spyOn(resource, 'updateAmountIndicator');
      
      const result = resource.harvest(harvestedAmount);
      
      expect(result).toBe(harvestedAmount);
      expect(resource.amount).toBe(initialAmount - harvestedAmount);
      expect(updateSpy).toHaveBeenCalled();
    });
    
    it('should mark resource as depleted when amount reaches zero', () => {
      mockScene.resources.push({});  // Add a dummy resource to test removal
      
      const resource = new Resource(mockScene, 100, 200, 'food', 10);
      mockScene.resources.push(resource);
      
      resource.harvest(10); // Fully deplete
      
      expect(resource.amount).toBe(0);
      expect(resource.depleted).toBe(true);
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });
  
  describe('destroy', () => {
    it('should clean up visual elements', () => {
      const resource = new Resource(mockScene, 100, 200, 'food', 50);
      
      // Spy on the background and foreground destroy methods
      const bgDestroySpy = jest.spyOn(resource.barBackground, 'destroy');
      const fgDestroySpy = jest.spyOn(resource.barForeground, 'destroy');
      
      resource.destroy();
      
      expect(bgDestroySpy).toHaveBeenCalled();
      expect(fgDestroySpy).toHaveBeenCalled();
    });
  });
});