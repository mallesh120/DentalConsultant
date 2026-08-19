const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const url = "https://dental-consultant.netlify.app";
const outPath = path.join(__dirname, 'public', 'qr-code.png');

QRCode.toFile(outPath, url, {
  color: { dark: '#000', light: '#FFF' },
  width: 500,
  margin: 2
}, function (err) {
  if (err) throw err;
  console.log('QR Code saved to ' + outPath);
});
