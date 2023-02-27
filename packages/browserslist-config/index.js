// targeting a subset of es2020
// https://caniuse.com/mdn-javascript_operators_nullish_coalescing,es6-module-dynamic-import,mdn-javascript_operators_import_meta,es6-module

// North America (95.1% as of this commit)
// https://browsersl.ist/#q=chrome+%3E%3D+80%2C+edge+%3E%3D+80%2C+safari+%3E%3D+13.1%2C+firefox+%3E%3D+72%2C+opera+%3E%3D+67%2C+ios+%3E%3D+13.4%2C+last+2+chromeandroid+versions%2C+samsung%3E%3D+13&region=alt-na

// This one states 91% (globally?)
// https://browserslist.dev/?q=Y2hyb21lID49IDgwLCBlZGdlID49IDgwLCBzYWZhcmkgPj0gMTMuMSwgZmlyZWZveCA%2BPSA3Miwgb3BlcmEgPj0gNjcsIGlvcyA%2BPSAxMy40LCBsYXN0IDIgY2hyb21lYW5kcm9pZCB2ZXJzaW9ucywgc2Ftc3VuZz49IDEz
module.exports = [
  'chrome >= 80',
  'edge >= 80',
  'safari >= 13.1',
  'firefox >= 72',
  'opera >= 67',
  'ios >= 13.4',
  'last 2 chromeandroid versions',
  'samsung >= 13',
];
