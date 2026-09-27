// Pembungkus generate QR code (data URL PNG) memakai library "qrcode".
const QRCode = require('qrcode');

async function generateQrDataUrl(targetUrl) {
  return QRCode.toDataURL(targetUrl, {
    width: 320,
    margin: 2,
    color: {
      dark: '#2B211B',
      light: '#FBF3E7',
    },
  });
}

module.exports = { generateQrDataUrl };
