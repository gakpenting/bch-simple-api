const QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");
const path = require('path');

async function create(dataForQRcode, center_image, width, cwidth) {
  const canvas = createCanvas(width, width);
  QRCode.toCanvas(canvas, dataForQRcode, {
    errorCorrectionLevel: "H",
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const ctx = canvas.getContext("2d");
  const img = await loadImage(center_image);
  const center = (width - cwidth) / 2;
  ctx.drawImage(img, center, center, cwidth, cwidth);
  return canvas.toDataURL("image/png");
}
async function createImage(dataForQRcode, center_image, width, cwidth) {
  const canvas = createCanvas(width, width);
  QRCode.toCanvas(canvas, dataForQRcode, {
    errorCorrectionLevel: "H",
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const ctx = canvas.getContext("2d");
  const img = await loadImage(center_image);
  const center = (width - cwidth) / 2;
  ctx.drawImage(img, center, center, cwidth, cwidth);
  return canvas.toBuffer();
}
async function generateQrImage(address, type = "BCH") {
  const qrCode = await createImage(
    address,
    type === "BCH" ?path.join(process.cwd(), '/lib/bch.png') : path.join(process.cwd(), '/lib/slp.png'),
    170,
    50
  );

  return qrCode;
}
async function generateQr(address, type = "BCH") {
  const qrCode = await create(
    address,
    type === "BCH" ?path.join(process.cwd(), '/lib/bch.png') : path.join(process.cwd(), '/lib/slp.png'),
    170,
    50
  );

  return qrCode;
}
module.exports = { generateQr,generateQrImage };
