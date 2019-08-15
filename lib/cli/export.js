"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exportHandler;
exports.getInputFileExtension = getInputFileExtension;
exports.getOutputFileExtension = getOutputFileExtension;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _core = require("@dbml/core");

var _logger = _interopRequireDefault(require("../helpers/logger"));

var _utils = require("./utils");

var _errors = require("../errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird.default.promisifyAll(_fs.default);

function getInputFileExtension() {
  return '.dbml';
}

function getOutputFileExtension(format) {
  switch (format) {
    case 'mysql':
    case 'postgres':
      return '.sql';

    case 'json':
      return '.json';

    default:
      _logger.default.error(`The ${format} format is not supported`);

      throw new Error(`The ${format} format is not supported`);
  }
}

async function generateExportFile(inputPath, outputPath, format) {
  const fileContent = await _fs.default.readFileAsync(inputPath, 'utf-8');
  let outputStr = '';

  try {
    outputStr = _core.exporter.export(fileContent, format);
  } catch (err) {
    throw new _errors.SyntaxError(_path.default.basename(inputPath), err);
  }

  await _fs.default.writeFileAsync(outputPath, outputStr);
}

async function exportHandler(pathspec, cmd) {
  try {
    const inputPath = _path.default.resolve(process.cwd(), pathspec);

    const outputPath = _path.default.resolve(process.cwd(), cmd.output);

    const format = (0, _utils.validate)(cmd.opts());
    const inputFileExtension = getInputFileExtension();
    const outputFileExtension = getOutputFileExtension(format);
    const filePathList = await (0, _utils.generateFilePathList)(inputPath, outputPath, inputFileExtension, outputFileExtension);
    await (0, _utils.createGenerateTaskList)(filePathList, format, generateExportFile);
  } catch (error) {
    _logger.default.error(error);
  }
}