const { task, watch } = require('gulp');
const { spawn } = require('child_process');

const { log } = console;

let node;

const serve = async () => {
  if (node) node.kill();
  node = await spawn('node', ['src/index.js'], { stdio: 'inherit' });
  node.on('close', (code, signal) => {
    const exited = [];
    if (code) exited.push(`code ${code}`);
    if (signal) exited.push(`signal ${signal}`);
    log(`Process exited with ${exited.join(' ')}`);
  });
};

task('default', () => {
  watch(
    ['src/**/*.js'],
    { queue: false, ignoreInitial: false },
    serve,
  );
});
