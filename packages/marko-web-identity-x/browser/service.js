// It's 2022, why is there not a better way to do this?
const getCookie = (key) => {
  const cookies = document.cookie.split(';').reduce((obj, cookie) => {
    const [name, value] = cookie.split('=').map(v => decodeURIComponent(v.trim()));
    return { ...obj, ...(value && { [name]: value }) };
  }, {});
  return cookies[key];
};

const parseContext = () => {
  try {
    return JSON.parse(getCookie('__idx_ctx'));
  } catch (e) {
    return {};
  }
};

export default class IdentityX {
  context = {};

  constructor() {
    this.context = parseContext();
  }

  getLoginSource() {
    return this.context.loginSource;
  }
}
