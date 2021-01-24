import {BCH as SLP} from '../../../lib/bchjs'
export default async function handler(req, res) {
    const address=await new SLP(req.query.network).getSLPaddress(req.query.bch_address)
      res.status(200).json(address)
  }