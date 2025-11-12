const chokidar = require('chokidar');
const path = require('path');
const build = require('./build-tailwind');

const watchPath = path.resolve(__dirname, '../assets');

console.log('Watching CSS and Tailwind files for changes...');
chokidar.watch(watchPath, { ignoreInitial: true }).on('all', (event, p) => {
  console.log(`${event} ${p} — rebuilding CSS...`);
  // Re-require the build script to ensure fresh context
  try {
    delete require.cache[require.resolve('./build-tailwind')];
  } catch (e) {}
  const buildFn = require('./build-tailwind');
  buildFn().catch(err => console.error(err));
});
