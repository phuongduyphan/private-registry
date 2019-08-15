"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cli;

var _commander = _interopRequireDefault(require("commander"));

var _import = _interopRequireDefault(require("./import"));

var _export = _interopRequireDefault(require("./export"));

var _visualize = _interopRequireDefault(require("./visualize"));

var _package = _interopRequireDefault(require("../../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cli(args) {
  _commander.default.version(_package.default.version);

  _commander.default.command('import <pathspec>').option('--mysql').option('--postgres').option('--json').option('--schemarb').option('-o, --output <pathspec>', 'Generated file location', './').action(_import.default);

  _commander.default.command('export <pathspec>').option('--mysql').option('--postgres').option('--json').option('-o, --output <pathspec>', 'Exported file location', './').action(_export.default);

  _commander.default.command('visualize <pathspec> [otherPathspec...]').action(_visualize.default);

  _commander.default.on('command:*', () => {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', _commander.default.args.join(' '));
    process.exit(1);
  });

  _commander.default.parse(args);
}