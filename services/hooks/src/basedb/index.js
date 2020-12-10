const caprica = require('./caprica');
const leonis = require('./leonis');
const tauron = require('./tauron');
const virgon = require('./virgon');

module.exports = tenant => ({
  caprica: caprica(tenant),
  leonis: leonis(tenant),
  tauron: tauron(tenant),
  virgon: virgon(tenant),
});
