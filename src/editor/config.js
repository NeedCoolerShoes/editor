import PersistenceManager from "../persistence.js";

class Config extends EventTarget {
  constructor(namespace, valueMap = {}) {
    super();

    this.persistence = new PersistenceManager(namespace);

    if (typeof valueMap === "object") {
      this.#valueMap = valueMap;
      this._loadValues(this.#valueMap);
    }
  }
  #config = {};
  #valueMap = {};

  _config() {
    return this.#config;
  }
  
  persistence;

  has(key) {
    return this.#config[key] !== undefined;
  }

  get(key, fallback = undefined) {
    if (this.has(key)) {
      return this.#config[key];
    }
    
    return fallback;
  }

  set(key, value, force = false) {
    if (this.#config[key] === value && !force) {
      return value;
    }
    this.#config[key] = value;
    this.dispatchEvent(new CustomEvent(`${key}-change`, { detail: value }));
    this._savePersistent(key, value, this.#valueMap[key]?.persistence);

    return value;
  }

  reset() {
    this._loadValues(this.#valueMap, false);
  }

  serialize() {
    const output = {};

    Object.keys(this.#config).forEach(key => {
      output[key] = this.serializeValue(key);
    });

    return output;
  }

  deserialize(values) {
    Object.entries(values).forEach(([key, value]) => {
      this.set(key, this.deserializeValue(key, value), true);
    });
  }

  serializeValue(key) {
    const config = this.#valueMap[key];

    if (typeof config === "object") {
      const persistence = config.persistence;

      if (typeof persistence !== "object") {
        return this.get(key);
      }

      if (typeof persistence.save === "function") {
        return persistence.save(this.get(key));
      }
    }

    return this.get(key);
  }

  deserializeValue(key, value) {
    const config = this.#valueMap[key];

    if (typeof config === "object") {
      const persistence = config.persistence || {};

      if (typeof persistence !== "object") {
        return value;
      }

      if (typeof persistence.load === "function") {
        return persistence.load(value);
      }
    }

    return value;
  }

  _loadValues(valueMap, loadPersistent = true) {
    Object.entries(valueMap).map(([key, config]) => {
      if (loadPersistent && this._loadPersistent(key, config)) {
        return;
      }

      if (config.default) {
        this.set(key, config.default);
      }
    });
  }

  _loadPersistent(key, config) {
    let persistenceConfig = config.persistence;
    if (!this.persistence.has(key)) { return false; }

    if (persistenceConfig === true) { persistenceConfig = {}; }
    if (typeof persistenceConfig !== "object") { return false; }

    const value = this.persistence.get(key);
    
    let loadedValue;
    if (typeof persistenceConfig.load === "function") {
      loadedValue = persistenceConfig.load(value);
    } else {
      loadedValue = value;
    }

    this.set(key, loadedValue);
    return true;
  }

  _savePersistent(key, value, persistenceConfig) {
    if (persistenceConfig === true) { persistenceConfig = {}; }
    if (typeof persistenceConfig !== "object") { return false; }

    let loadedValue;
    if (typeof persistenceConfig.save === "function") {
      loadedValue = persistenceConfig.save(value);
    } else {
      loadedValue = value;
    }

    this.persistence.set(key, loadedValue);
    return true;
  }
}

export default Config;
