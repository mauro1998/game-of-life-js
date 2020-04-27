window.GameControls = (() => {
  class Controls {
    constructor() {
      this._controls = document.querySelector(".controls");
      this.actions = {
        PLAY: "PLAY",
        PAUSE: "PAUSE",
        STOP: "STOP",
        UNDO: "UNDO",
        REDO: "REDO",
        SPEED_UP: "SPEED_UP",
        SPEED_DOWN: "SPEED_DOWN",
        SAVE: "SAVE",
      };
    }

    get height() {
      return this._controls.clientHeight;
    }

    _$(id) {
      return document.getElementById(id);
    }

    setDrawingMode(on) {
      const span = this._$("drawing-mode");
      span.textContent = on ? "ON" : "OFF";
      span.className = on ? "mode-on" : "mode-off";
    }

    setSpeed(factor) {
      const span = this._$("speed");
      span.textContent = factor + "x";
    }

    _getElement(id) {
      switch (id) {
        case this.actions.PLAY:
          return this._$(this.actions.PLAY);
        case this.actions.PAUSE:
          return this._$(this.actions.PAUSE);
        case this.actions.STOP:
          return this._$(this.actions.STOP);
        case this.actions.UNDO:
          return this._$(this.actions.UNDO);
        case this.actions.REDO:
          return this._$(this.actions.REDO);
        case this.actions.SPEED_UP:
          return this._$(this.actions.SPEED_UP);
        case this.actions.SPEED_DOWN:
          return this._$(this.actions.SPEED_DOWN);
        case this.actions.SAVE:
          return this._$(this.actions.SAVE);
        default:
          return null;
      }
    }

    on(event, callback) {
      const btn = this._getElement(event);
      if (btn) btn.addEventListener("click", (e) => {
        e.stopPropagation();
        callback();
      });
    }

    _setDisabledState(action, disabled) {
      const btn = this._getElement(action);

      if (btn) {
        if (disabled) {
          btn.setAttribute("disabled", "disabled");
        } else {
          btn.removeAttribute("disabled");
        }
      }
    }

    enable(action) {
      this._setDisabledState(action, false);
    }

    disable(action) {
      this._setDisabledState(action, true);
    }
  }

  return Controls;
})();
