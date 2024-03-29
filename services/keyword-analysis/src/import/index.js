const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const clear = require('clear');
const env = require('../env');
const run = require('./run');

const { log } = console;
const { TENANT_KEY } = env;

const questions = [
  {
    type: 'input',
    name: 'batchSize',
    default: 200,
    message: 'The batch size.',
    validate: (v) => {
      const num = parseInt(v, 10);
      if (!num || num < 1) {
        return 'Please provide a number greater than 0.';
      }
      return true;
    },
    filter: (v) => parseInt(v, 10),
  },
  {
    type: 'confirm',
    name: 'populate',
    message: 'Populate the Elasticsearch index (will overwrite existing data)?',
    default: false,
  },
  {
    type: 'confirm',
    name: 'saveToMongo',
    message: 'Populate MongoDB with score results (will overwrite existing data)?',
    default: false,
  },
  {
    type: 'confirm',
    name: 'shouldRun',
    message: `Proceed with indexing for '${TENANT_KEY}'?`,
    default: true,
  },
];

clear();
log(chalk.blue(figlet.textSync('Keyword Analysis', { horizontalLayout: 'full' })));

const execute = async () => {
  const answers = await inquirer.prompt(questions);

  const {
    shouldRun,
    batchSize,
    populate,
    saveToMongo,
  } = answers;
  if (shouldRun) {
    await run({ batchSize, populate, saveToMongo });
  } else {
    log(chalk.green('Exiting import.'));
    process.exit(0);
  }
};

execute().then(() => process.exit()).catch((e) => {
  log(chalk.red('AN ERROR OCCURRED!'));
  log(e);
  process.exit(1);
});
