// It's 2022, why is there not a better way to do this?
const getCookie = (key) => {
  const cookies = document.cookie.split(/; */).reduce((obj, cookie) => {
    const [name, value] = cookie.split('=').map(decodeURIComponent);
    return { ...obj, [name]: value };
  }, {});
  return cookies[key];
};
const { warn } = console;

export default class IdentityX {
  context = {};

  constructor() {
    try {
      // Read cookie
      const cookie = getCookie('__idx_ctx');
      this.context = JSON.parse(cookie || '{}');
    } catch (e) {
      warn('Unable to read IdentityX context from cookie');
    }
  }

  getLoginSource() {
    return this.context.loginSource || 'login';
  }
}
