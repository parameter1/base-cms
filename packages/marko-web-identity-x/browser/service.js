// It's 2022, why is there not a better way to do this?
const getCookie = (key) => {
  const cookies = document.cookie.split(';').reduce((obj, cookie) => {
    const trimmed = cookie.trim();
    if (!trimmed) return obj;
    const [name, value] = trimmed.split('=').map(v => decodeURIComponent(v.trim()));
    return { ...obj, [name]: value };
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
  constructor() {
    this.loadContext();
  }

  getLoginSource() {
    return this.context.loginSource;
  }

  loadContext() {
    this.context = parseContext();
  }
}
