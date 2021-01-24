import {BCH} from '../../../lib/bchjs'
export default async function handler(req, res) {
  try{
   

    const send=await new BCH(req.query.network).
    sendBch(req.body.sender,req.body.sender_mnemonic,req.body.receiver,req.body.amount)
  
      res.status(200).json(send)
  }catch(e){
    res.status(200).json({error:true,message:e.message})
  }
    
  }