"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyntaxError = exports.DomainError = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DomainError extends Error {
  constructor(message, rootError = {}) {
    super(message);
    this.name = this.constructor.name;
    this.rootError = rootError;
    Error.captureStackTrace(this, this.constructor);
  }

}

exports.DomainError = DomainError;

class SyntaxError extends DomainError {
  constructor(fileName, rootError = {}) {
    let message = `You have a syntax error at ${fileName}.`;

    if (!_lodash.default.isEmpty(rootError)) {
      message += ` ${rootError.message}`;
    }

    super(message, rootError);
  }

}

exports.SyntaxError = SyntaxError;