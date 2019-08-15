"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = importHandler;
exports.getInputFileExtension = getInputFileExtension;
exports.getOutputFileExtension = getOutputFileExtension;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _core = require("@dbml/core");

var _utils = require("./utils");

var _logger = _interopRequireDefault(require("../helpers/logger"));

var _errors = require("../errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird.default.promisifyAll(_fs.default);

function getInputFileExtension(format) {
  switch (format) {
    case 'mysql':
    case 'postgres':
      return '.sql';

    case 'json':
      return '.json';

    default:
      throw new Error(`The ${format} format is not supported`);
  }
}

function getOutputFileExtension() {
  return '.dbml';
}

async function generateDBMLFile(inputPath, outputPath, format) {
  const fileContent = await _fs.default.readFileAsync(inputPath, 'utf-8');
  let dbml = '';

  try {
    dbml = _core.importer.import(fileContent, format);
  } catch (err) {
    throw new _errors.SyntaxError(_path.default.basename(inputPath), err);
  }

  await _fs.default.writeFileAsync(outputPath, dbml);
}

async function importHandler(pathspec, cmd) {
  try {
    const inputPath = _path.default.resolve(process.cwd(), pathspec);

    const outputPath = _path.default.resolve(process.cwd(), cmd.output);

    const format = (0, _utils.validate)(cmd.opts());
    const inputFileExtension = getInputFileExtension(format);
    const outputFileExtension = getOutputFileExtension();
    const filePathList = await (0, _utils.generateFilePathList)(inputPath, outputPath, inputFileExtension, outputFileExtension);
    await (0, _utils.createGenerateTaskList)(filePathList, format, generateDBMLFile);
  } catch (err) {
    _logger.default.error(err);
  }
}