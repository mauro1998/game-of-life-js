"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

window.GameControls = function () {
  var Controls = /*#__PURE__*/function () {
    function Controls() {
      _classCallCheck(this, Controls);

      this._controls = document.querySelector(".controls");
      this.actions = {
        PLAY: "PLAY",
        PAUSE: "PAUSE",
        STOP: "STOP",
        UNDO: "UNDO",
        REDO: "REDO",
        SPEED_UP: "SPEED_UP",
        SPEED_DOWN: "SPEED_DOWN",
        SAVE: "SAVE"
      };
    }

    _createClass(Controls, [{
      key: "_$",
      value: function _$(id) {
        return document.getElementById(id);
      }
    }, {
      key: "setDrawingMode",
      value: function setDrawingMode(on) {
        var span = this._$("drawing-mode");

        span.textContent = on ? "ON" : "OFF";
        span.className = on ? "mode-on" : "mode-off";
      }
    }, {
      key: "setSpeed",
      value: function setSpeed(factor) {
        var span = this._$("speed");

        span.textContent = factor + "x";
      }
    }, {
      key: "_getElement",
      value: function _getElement(id) {
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
    }, {
      key: "on",
      value: function on(event, callback) {
        var btn = this._getElement(event);

        if (btn) btn.addEventListener("click", function (e) {
          e.stopPropagation();
          callback();
        });
      }
    }, {
      key: "_setDisabledState",
      value: function _setDisabledState(action, disabled) {
        var btn = this._getElement(action);

        if (btn) {
          if (disabled) {
            btn.setAttribute("disabled", "disabled");
          } else {
            btn.removeAttribute("disabled");
          }
        }
      }
    }, {
      key: "enable",
      value: function enable(action) {
        this._setDisabledState(action, false);
      }
    }, {
      key: "disable",
      value: function disable(action) {
        this._setDisabledState(action, true);
      }
    }, {
      key: "height",
      get: function get() {
        return this._controls.clientHeight;
      }
    }]);

    return Controls;
  }();

  return Controls;
}();