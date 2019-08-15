"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateFilePathList = generateFilePathList;
exports.createGenerateTaskList = createGenerateTaskList;
exports.validate = validate;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _listr = _interopRequireDefault(require("listr"));

var _figures = _interopRequireDefault(require("figures"));

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird.default.promisifyAll(_fs.default);

function validate(flags) {
  const keys = Object.keys(flags).filter(key => key !== 'output');
  let counter = 0;
  let format = 'json';

  for (let i = 0; i < keys.length; i += 1) {
    if (flags[keys[i]]) {
      counter += 1;
      if (counter > 1) throw new Error('Too many options');
      format = keys[i];
    }
  }

  return format;
}

async function generateFilePathList(inputPath, outputPath, inputFileExtension, outputFileExtension) {
  const inputStats = await _fs.default.statAsync(inputPath);
  const isDirectory = inputStats.isDirectory();
  const filePathList = [];

  if (isDirectory) {
    // inputPath is directory => outputPath must be directory
    // check if directory or file exist
    const outputStats = await _fs.default.statAsync(outputPath); // if path is file, throw error

    if (!outputStats.isDirectory()) {
      throw new Error('Expect an output path is a directory');
    }

    const files = await _fs.default.readdirAsync(inputPath);
    files.forEach(file => {
      if (_path.default.extname(file) !== inputFileExtension) {
        return;
      }

      const fileNameWithoutExtension = _path.default.basename(file, inputFileExtension);

      const outputFile = `${fileNameWithoutExtension}${outputFileExtension}`;
      filePathList.push({
        inputFile: `${inputPath}/${file}`,
        outputFile: `${outputPath}/${outputFile}`
      });
    });
  } else {
    try {
      const outputStats = await _fs.default.statAsync(outputPath);

      if (outputStats.isDirectory()) {
        const fileNameWithoutExtension = _path.default.basename(inputPath, inputFileExtension);

        const outputFile = `${fileNameWithoutExtension}${outputFileExtension}`;
        filePathList.push({
          inputFile: inputPath,
          outputFile: `${outputPath}/${outputFile}`
        });
      } else {
        filePathList.push({
          inputFile: inputPath,
          outputFile: outputPath
        });
      }
    } catch (err) {
      filePathList.push({
        inputFile: inputPath,
        outputFile: outputPath
      });
    }
  }

  return filePathList;
}

async function createGenerateTaskList(filePathList, format, generateAsyncFunction) {
  const taskList = [];
  filePathList.forEach(filePath => {
    taskList.push({
      title: `Generate ${_path.default.basename(filePath.inputFile)} ${_figures.default.arrowRight}  ${_path.default.basename(filePath.outputFile)}`,
      task: () => generateAsyncFunction(filePath.inputFile, filePath.outputFile, format)
    });
  });
  const tasks = new _listr.default(taskList, {
    concurrent: true
  });
  await tasks.run();

  if (filePathList.length !== 0) {
    console.log('');
    console.log(`  ${_chalk.default.bgGreen.bold('DONE')} Generated files at ${_path.default.dirname(filePathList[0].outputFile)}`);
  }
}