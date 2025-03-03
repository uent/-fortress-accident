// Mock for Phaser
class EventEmitter {
  constructor() {
    this.callbacks = {};
  }
  
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
    return this;
  }
  
  emit(event, ...args) {
    const callbacks = this.callbacks[event] || [];
    callbacks.forEach(callback => callback(...args));
    return this;
  }

  once(event, callback) {
    const onceCallback = (...args) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    return this.on(event, onceCallback);
  }

  off(event, callback) {
    if (!this.callbacks[event]) return this;
    this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    return this;
  }
}

class GameObject extends EventEmitter {
  constructor(scene, x, y) {
    super();
    this.scene = scene;
    this.x = x || 0;
    this.y = y || 0;
    this.visible = true;
    this.alpha = 1;
    this.scale = 1;
    this.originX = 0.5;
    this.originY = 0.5;
    this.width = 16;
    this.height = 16;
    this.active = true;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setVisible(visible) {
    this.visible = visible;
    return this;
  }

  setAlpha(alpha) {
    this.alpha = alpha;
    return this;
  }
  
  setScale(scale) {
    this.scale = scale;
    return this;
  }
  
  setOrigin(x, y) {
    this.originX = x;
    this.originY = y !== undefined ? y : x;
    return this;
  }
  
  setInteractive() {
    this.interactive = true;
    return this;
  }
  
  destroy() {
    this.active = false;
  }
}

class Rectangle extends GameObject {
  constructor(scene, x, y, width, height, fillColor, fillAlpha) {
    super(scene, x, y);
    this.width = width;
    this.height = height;
    this.fillColor = fillColor;
    this.fillAlpha = fillAlpha;
  }
  
  setScrollFactor() {
    return this;
  }
  
  setFillStyle(color) {
    this.fillColor = color;
    return this;
  }
}

class Text extends GameObject {
  constructor(scene, x, y, text, style) {
    super(scene, x, y);
    this.text = text;
    this.style = style;
  }
  
  setText(text) {
    this.text = text;
    return this;
  }
  
  setScrollFactor() {
    return this;
  }
}

class Circle extends GameObject {
  constructor(scene, x, y, radius, fillColor, fillAlpha) {
    super(scene, x, y);
    this.radius = radius;
    this.fillColor = fillColor;
    this.fillAlpha = fillAlpha;
  }
  
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
}

class Sprite extends GameObject {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y);
    this.texture = texture;
    this.frame = frame;
    this.anims = {
      play: jest.fn().mockReturnThis(),
      stop: jest.fn().mockReturnThis(),
      isPlaying: jest.fn().mockReturnValue(false)
    };
  }
  
  setCollideWorldBounds() {
    return this;
  }
  
  setVelocity(x, y) {
    this.body.velocity.x = x;
    this.body.velocity.y = y;
    return this;
  }
}

class Physics {
  static Arcade = {
    Sprite: class extends Sprite {
      constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        this.body = {
          velocity: { x: 0, y: 0 },
          setSize: jest.fn(),
          setOffset: jest.fn()
        };
      }
    }
  };
}

class Math {
  static Vector2 = class {
    constructor(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    }
    
    normalize() {
      const length = Math.sqrt(this.x * this.x + this.y * this.y);
      if (length > 0) {
        this.x /= length;
        this.y /= length;
      }
      return this;
    }
  };
  
  static Distance = {
    Between: (x1, y1, x2, y2) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    }
  };
  
  static Between(min, max) {
    // Just return a fixed value for testing
    return min;
  }
}

class Scene extends EventEmitter {
  constructor() {
    super();
    this.children = {
      add: jest.fn().mockReturnValue(this)
    };
    this.add = {
      existing: jest.fn(),
      sprite: jest.fn().mockReturnValue(new Sprite(this, 0, 0)),
      text: jest.fn().mockImplementation((x, y, text, style) => new Text(this, x, y, text, style)),
      circle: jest.fn().mockImplementation((x, y, r, c, a) => new Circle(this, x, y, r, c, a)),
      rectangle: jest.fn().mockImplementation((x, y, w, h, c, a) => new Rectangle(this, x, y, w, h, c, a))
    };
    this.physics = {
      add: {
        existing: jest.fn()
      }
    };
    this.time = {
      addEvent: jest.fn().mockReturnValue({
        delay: 1000,
        callback: () => {},
        callbackScope: null,
        loop: false,
        destroy: jest.fn()
      }),
      delayedCall: jest.fn()
    };
    this.sound = {
      play: jest.fn()
    };
    this.tweens = {
      add: jest.fn().mockReturnValue({
        onComplete: jest.fn().mockReturnThis()
      })
    };
    this.cameras = {
      main: {
        width: 800,
        height: 600
      }
    };
    this.sys = {
      updateList: {
        add: jest.fn()
      }
    };
    this.input = {
      on: jest.fn(),
      off: jest.fn()
    };
    this.gameData = {
      resources: {
        food: 0,
        wood: 0,
        stone: 0,
        metal: 0
      },
      day: 1,
      population: 0
    };
    
    // Common game objects
    this.resources = [];
    this.buildings = [];
    this.colonists = [];
  }
  
  update() {}
}

class Game {
  constructor(config) {
    this.config = config;
    this.scene = {
      add: jest.fn(),
      start: jest.fn()
    };
  }
}

// Export Phaser mock
const Phaser = {
  Game,
  Scene,
  Physics,
  Math,
  GameObjects: {
    Sprite,
    Container: class extends GameObject {},
    Rectangle,
    Text,
    Circle,
    Graphics: class extends GameObject {
      clear() { return this; }
      fillStyle() { return this; }
      fillRect() { return this; }
      lineStyle() { return this; }
      strokeRect() { return this; }
    }
  }
};

export default Phaser;