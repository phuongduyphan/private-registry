"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _winston = require("winston");

var _chalk = _interopRequireDefault(require("chalk"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  combine,
  timestamp,
  printf
} = _winston.format;
const consoleFormat = printf(info => {
  const {
    level,
    message
  } = info;
  return `  ${_chalk.default.bgRed.bold(level.toUpperCase())}: ${message}\n
  A complete log can be found in:
     ${_path.default.resolve(process.cwd(), 'dbml-error.log')}`;
});
const fileFormat = printf(info => {
  const {
    timestamp,
    stack,
    rootError
  } = info;
  return `${timestamp} ${stack}\n${rootError ? `\n${rootError}\n` : ''}`;
});
const consoleLogger = (0, _winston.createLogger)({
  format: combine(consoleFormat),
  transports: [new _winston.transports.Console({
    level: 'error'
  })]
});
const fileLogger = (0, _winston.createLogger)({
  format: combine(timestamp(), fileFormat),
  transports: [new _winston.transports.File({
    filename: 'dbml-error.log',
    level: 'error'
  })]
});
const logger = {
  debug(msg) {
    consoleLogger.debug(msg);
  },

  info(msg) {
    consoleLogger.info(msg);
  },

  warn(msg) {
    consoleLogger.warn(msg);
  },

  error(msg) {
    consoleLogger.error(msg);
    fileLogger.error(msg);
  },

  log(level, msg) {
    const lvl = exports[level];
    lvl(msg);
  }

};
var _default = logger;
exports.default = _default;