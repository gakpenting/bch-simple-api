import {generateQr} from '../../../lib/qrcode'
export default async function handler(req, res) {
  res.setHeader("Content-Type", `image/png`);
    result.pipe(res);
    const qrcode=await generateQr(req.query.bch_address)
    if(req.query.type==="image") res.status(200).end(`<img src=${qrcode} />`)
    else res.status(200).json(qrcode)
      
  }