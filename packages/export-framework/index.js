if (process.env.MARKO_REQUIRE_PREBUILT_TEMPLATES == null) {
  // force prebuilt templates if env not set
  process.env.MARKO_REQUIRE_PREBUILT_TEMPLATES = true;
}

const startServer = require('./start-server');

module.exports = { startServer };
