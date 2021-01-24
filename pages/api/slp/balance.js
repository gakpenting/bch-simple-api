import {BCH as SLP} from '../../../lib/bchjs'
export default async function handler(req, res) {
    const balance=await new SLP(req.query.network).getSLPBalance(req.query.slp_address)
      res.status(200).json(balance)
  }