class HistoryManager extends EventTarget {
  constructor() {
    super();

    this.undoStack = [];
    this.redoStack = [];
  }

  add(entry) {
    const lastEntry = this.undoStack.at(-1);
    if (entry.stacking && lastEntry?.stacking && lastEntry.constructor == entry.constructor) {
      this._emitUpdateEvent();
      return lastEntry.onStack(entry);
    } else if (entry.perform()) {
      this.undoStack.push(entry);
      this.redoStack = [];

      this._emitUpdateEvent();

      return true;
    }

    return false;
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  undo() {
    if (!this.canUndo()) {
      return false;
    }

    const entry = this.undoStack.pop();
    entry.revert();
    this.redoStack.push(entry);

    this._emitUpdateEvent();

    return true;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  redo() {
    if (!this.canRedo()) {
      return false;
    }

    const entry = this.redoStack.pop();
    entry.perform();
    this.undoStack.push(entry);

    this._emitUpdateEvent();

    return true;
  }

  wipe() {
    this.undoStack = [];
    this.redoStack = [];

    this._emitUpdateEvent();
  }

  load(undoStack, redoStack) {
    this.undoStack = undoStack;
    this.redoStack = redoStack;

    this._emitUpdateEvent();
  }

  _emitUpdateEvent() {
    this.dispatchEvent(new CustomEvent("update"));
  }
}

export { HistoryManager };
