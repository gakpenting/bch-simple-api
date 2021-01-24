import {BCH} from '../../../lib/bchjs'
export default async function handler(req, res) {
    const fee=await new BCH(req.query.network).getFee(req.body.bch_address,req.body.amount)
  
      res.status(200).json(fee)
  }