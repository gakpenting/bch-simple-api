import {BCH} from '../../../lib/bchjs'
export default async function handler(req, res) {
    const wallet=await new BCH(req.query.network).createWallet()
  
      res.status(200).json(wallet)
  }