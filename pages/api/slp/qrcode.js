import {generateQr} from '../../../lib/qrcode'
export default async function handler(req, res) {
    const qrcode=await generateQr(req.query.slp_address,"SLP")
    if(req.query.type==="image") res.status(200).end(`<img src=${qrcode} />`)
    else res.status(200).json(qrcode)
      
  }