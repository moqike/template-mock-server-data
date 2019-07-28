const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const ora = require('ora');
const chalk = require('chalk');
const inquirer = require('inquirer');

/**
 * Generate mock server data files
 * @param targetPath absolute path where to generate the data files
 */
async function generate(targetPath){
  const dataPath = await getDataPath(targetPath);
  const defaultScenario = await getDefaultScenario();
  const proxy = await getProxy();
  const options = {
    proxy,
    templateData: {
      defaultScenario
    }
  };
  generateFolder(path.join(targetPath, dataPath));
  generateFiles(path.join(targetPath, dataPath), options);
  console.log(chalk.green(`=== data files: ${dataPath} created!===`))
}

async function getDataPath(targetPath) {
  let isDataPathValid = false;
  let dataPath = null;
  while (!isDataPathValid) {
    dataPath = (await inquirer.prompt({
      type: 'input',
      name: 'dataPath',
      message: 'Enter the data path'
    })).dataPath;
    isDataPathValid = !isDataPathExist(targetPath, dataPath);
    if (isDataPathValid) {
      console.log(chalk.green(`data path valid: ${dataPath}`))
    } else {
      console.log(chalk.red(`${dataPath} already exists!`));
    }
  }
  return dataPath;
}

async function getDefaultScenario() {
  let scenario = null;
  while (!scenario) {
    scenario = (await inquirer.prompt({
      type: 'input',
      name: 'scenario',
      message: 'Enter the default scenario',
      default: 'success'
    })).scenario;
  }
  return scenario;
}

async function getProxy() {
  let proxy = null;
  proxy = (await inquirer.prompt({
    type: 'list',
    name: 'proxy',
    message: 'Want to include a proxy scenario?',
    choices: ['yes' , 'no']
  })).proxy;
  return proxy;
}

function isDataPathExist(targetPath, dataPath) {
  const folderExist = isFolderExist(targetPath, dataPath);
  return folderExist;
}

function isFolderExist(targetPath, dataPath) {
  let folderExists = false;
  const folderPath = path.join(targetPath, dataPath);
  try {
    fs.accessSync(folderPath);
    folderExists = true;
  } catch(e) {
  }
  return folderExists;
}

function generateFolder(dataPath) {
  const spinner = ora(`creating ${dataPath}`).start();
  fs.mkdirSync(dataPath, {
    recursive: true
  });
  spinner.stop();
  console.log(chalk.green(`folder: ${dataPath} created!`));
}

function generateFiles(dataPath, options) {
  const { templateData, proxy } = options;
  const spinner = ora('creating files').start();
  const defaultTemplate = prepareTemplate(path.resolve(__dirname, '../templates/_default.ts.hbs'));
  const scenarioTemplate = prepareTemplate(path.resolve(__dirname, '../templates/scenario.ts.hbs'));
  const proxyTemplate = prepareTemplate(path.resolve(__dirname, '../templates/proxy.ts.hbs'));
  fs.writeFileSync(path.join(dataPath, '_default.ts'), defaultTemplate(templateData));
  fs.writeFileSync(path.join(dataPath, `${templateData.defaultScenario}.ts`), scenarioTemplate(templateData));
  if (proxy === 'yes') {
    fs.writeFileSync(path.join(dataPath, 'proxy.ts'), proxyTemplate(templateData));
  }
  spinner.stop();
  console.log(chalk.green('all data filse created!'));
}

function prepareTemplate(templatePath) {
  const encoding = 'utf-8';
  let template = fs.readFileSync(templatePath, encoding);
  template = Handlebars.compile(template);
  return template;
}

module.exports = generate;
