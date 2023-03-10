module.exports = (bytes) => `${(bytes / 1000).toLocaleString('en', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})} kB`;
