const leadersAttrs = require('./event-attrs');

module.exports = ({
  category,
  label,
  companyId,
  linkAttrs,
} = {}) => ({
  ...linkAttrs,
  ...leadersAttrs({
    action: 'click',
    category,
    label,
    payload: { companyId },
  }),
});
