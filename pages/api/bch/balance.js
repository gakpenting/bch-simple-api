import {BCH} from '../../../lib/bchjs'
export default async function handler(req, res) {
    const balance=await new BCH(req.query.network).getBalance(req.query.bch_address)
      res.status(200).json(balance)
  }