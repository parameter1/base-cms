/* eslint-disable global-require */
const devOptions = yargs => yargs
  .option('file', {
    describe: 'The root newsletter server file to execute.',
    type: 'string',
  });

/**
 * Note: commands are required only when requested.
 * This saves the overhead of requiring _all_ command dependencies when only a single
 * command is executing.
 */
module.exports = (program) => {
  program
    .command('dev <file>', 'Start the BaseCMS website development server', devOptions, argv => require('./dev')(argv));
};
