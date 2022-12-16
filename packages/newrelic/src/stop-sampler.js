const sampler = require('newrelic/lib/sampler');

const envEnabled = [true, 'true', 1, '1'].includes(process.env.NEW_RELIC_TURN_OFF_SAMPLER);

module.exports = ({
  enabled = envEnabled,
  maxWaitMS = 5000,
  intervalMs = 250,
} = {}) => {
  if (!enabled) return;
  let totalMS = 0;
  const interval = setInterval(() => {
    totalMS += intervalMs;
    if (sampler.state === 'running') {
      sampler.stop();
      clearInterval(interval);
    } else if (totalMS > maxWaitMS) {
      clearInterval(interval);
    }
  }, intervalMs);
};
