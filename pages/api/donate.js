import {generateQrImage} from '../../lib/qrcode'
export default async function handler(req, res) {
  res.setHeader("Content-Type", `image/png`);
   
    const qrcode=await generateQrImage(req.query.address,req.query.type)
    res.end(qrcode);
      
  }