const Hapi = require('hapi');

// Init server
const server = Hapi.Server({
  host: 'localhost',
  port: Number(process.argv[2] || 8000)
});

server.route({
  path: '/',
  method: 'GET',
  handler: (req, h) => h.file('./public/index.html')
});

server.route({
  path: '/{name}',
  method: 'GET',
  handler: (req, h) => {
    // Use logger
    req.logger.info('In handler %s', req.path);
    return `Hello, ${req.params.name}!`;
  }
});


// Start the server
const init = async () => {
  // Add inert package
  await server.register(require('inert'));

  // Add logger
  await server.register({
    plugin: require('hapi-pino'),
    options: {
      prettyPrint: true,
      logEvents: ['response', 'onPostStart']
    }
  });

  await server.start();
  console.log('Server running at', server.info.uri);
}

process.on('unhandledRejection', err => {
  console.error(err);
  process.exit(1);
});

init();