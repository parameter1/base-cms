/* eslint-disable no-plusplus */
let idx = 256;
const hex = [];
const size = 256;
let buffer;

while (idx--) hex[idx] = (idx + 256).toString(16).substring(1);

export default (len) => {
  let i = 0;
  const tmp = (len || 11);
  if (!buffer || ((idx + tmp) > size * 2)) {
    for (buffer = '', idx = 0; i < size; i++) {
      // eslint-disable-next-line no-bitwise
      buffer += hex[Math.random() * 256 | 0];
    }
  }

  return buffer.substring(idx, idx++ + tmp);
};
