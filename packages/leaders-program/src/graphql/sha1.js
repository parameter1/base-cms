const { error } = console;

export default async (string) => {
  try {
    const buffer = new TextEncoder('utf-8').encode(string);
    const digest = await crypto.subtle.digest('SHA-1', buffer);
    const hexCodes = [];
    const view = new DataView(digest);
    for (let i = 0; i < view.byteLength; i += 1) {
      const byte = view.getUint8(i).toString(16).padStart(2, '0');
      hexCodes.push(byte);
    }
    return hexCodes.join('');
  } catch (e) {
    error('Unable to create SHA1 - GraphQL cache will be disabled.', e);
    return null;
  }
};
