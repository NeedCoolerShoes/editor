class PersistenceManager {
  constructor(key) {
    this.key = key;
    this._data = this._loadData();
  }

  set(key, value) {
    this._data[key] = value;
    this.sync();
  }

  get(key, defaultValue = {}) {
    const data = this._data[key];
    if (this.has(key)) {
      return data;
    } else {
      return defaultValue;
    }
  }

  has(key) {
    return Object.keys(this._data).includes(key);
  }

  sync() {
    localStorage.setItem(this.key, this.serialize());
  }

  serialize() {
    return JSON.stringify(this._data);
  }

  reset() {
    this._data = {};
    localStorage.removeItem(this.key);
  }

  _loadData() {
    const data = localStorage.getItem(this.key);
    if (data) {
      return JSON.parse(data);
    } else {
      return {};
    }
  }
}

export default PersistenceManager;