const BCHJS = require("@psf/bch-js");

class BCH {
  constructor(network="testnet") {
    this.NETWORK=network;
  }
  
  BCHN_MAINNET = "https://bchn.fullstack.cash/v4/";
  TESTNET3 = "https://testnet3.fullstack.cash/v4/";
  bchjs = new BCHJS({
    restURL: this.NETWORK === "testnet" ? this.TESTNET3 : this.BCHN_MAINNET,
  });
  async getBalance(address) {
    try{
      const balance = await this.bchjs.Electrumx.balance(
        address
      );
      return balance;
    }catch(e){
      console.log(e.message);
      throw e;
    }
  }
  async getSLPBalance(address) {
    try{
      const balance = await this.bchjs.SLP.Utils.balancesForAddress(
        address
      );
      const a=await Promise.all(balance.map(async ({tokenId,...rest})=>({tokenDetail:(await this.getTokenDetail(tokenId)),tokenId,...rest})))
      return a;
    }catch(e){
      console.log(e.message);
      throw e;
    }
  }
  async getTokenDetail(tokenId){
    try{
      let stats = await this.bchjs.SLP.Utils.tokenStats(
        tokenId
      )
      
      return stats;
    }catch(e){
      console.log(e.message);
      throw e;
    }
  }
  async getSLPaddress(bch_address){
    try{
      let address = await this.bchjs.SLP.Address.toSLPAddress(
        bch_address
      )
      
      return address;
    }catch(e){
      console.log(e.message);
      throw e;
    }
  }
  async createWallet() {
    try {

const lang = "english"; // Set the language of the wallet.

// These objects used for writing wallet information out to a file.

const outObj = {};

      // create 256 bit BIP39 mnemonic
      const mnemonic = this.bchjs.Mnemonic.generate(
        128,
        this.bchjs.Mnemonic.wordLists()[lang]
      );
      outObj.mnemonic = mnemonic;
  
      const rootSeed = await this.bchjs.Mnemonic.toSeed(mnemonic);
  
      // master HDNode
      let masterHDNode;
      if (this.NETWORK === "mainnet") masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed);
      else masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed, "testnet"); // Testnet
  
      const childNode = masterHDNode.derivePath(`m/44'/145'/0'/0/0`);
  
      outObj.cashAddress = this.bchjs.HDNode.toCashAddress(childNode);
      outObj.legacyAddress = this.bchjs.HDNode.toLegacyAddress(childNode);
      outObj.WIF = this.bchjs.HDNode.toWIF(childNode);
  
      return outObj;
    } catch (err) {
      throw new Error("Error in createWallet(): ", err);
    }
  }
  async getFee(address,amount){
    const utxos = await this.bchjs.Electrumx.utxo(address)
    const utxo = await this.findBiggestUtxo(utxos.utxos)
    const satoshisToSend =amount
    const originalAmount = utxo?.value
    const byteCount = this.bchjs.BitcoinCash.getByteCount(
      { P2PKH: 1 },
      { P2PKH: 2 }
    )
    const satoshisPerByte = 1.2
      const txFee = Math.floor(satoshisPerByte * byteCount)
      let remainder = 0;
      if(originalAmount){
        remainder = originalAmount - satoshisToSend - txFee;
      }
      const balance = await this.getBCHBalance2(address, false)    
          return {transaction_fee:txFee,remaining_balance:remainder,amount:Number(satoshisToSend),balance}
  }
  async getBCHBalance2 (addr, verbose) {
    try {
      const result = await this.bchjs.Electrumx.balance(addr)
  
      if (verbose) console.log(result)
  
      // The total balance is the sum of the confirmed and unconfirmed balances.
      const satBalance = result
        
  
      // Convert the satoshi balance to a BCH balance
      
  
      return satBalance
    } catch (err) {
      console.error('Error in getBCHBalance: ', err)
      console.log(`addr: ${addr}`)
      throw err
    }
  }
  async findBiggestUtxo (utxos) {
    let largestAmount = 0
    let largestIndex = 0
  
    for (var i = 0; i < utxos.length; i++) {
      const thisUtxo = utxos[i]
      // console.log(`thisUTXO: ${JSON.stringify(thisUtxo, null, 2)}`);
  
      // Validate the UTXO data with the full node.
      const txout = await this.bchjs.Blockchain.getTxOut(thisUtxo.tx_hash, thisUtxo.tx_pos)
      if (txout === null) {
        // If the UTXO has already been spent, the full node will respond with null.
        console.log(
          'Stale UTXO found. You may need to wait for the indexer to catch up.'
        )
        continue
      }
  
      if (thisUtxo.value > largestAmount) {
        largestAmount = thisUtxo.value
        largestIndex = i
      }
    }
  
    return utxos[largestIndex]
  }
  async transactionStatus (transactionInput, network) {
    if (network === 'mainnet') {
      return {transaction_status:`https://www.blockchain.com/bch/tx/${transactionInput}`}
    } else {
      return {transaction_status:`https://www.blockchain.com/bch-testnet/tx/${transactionInput}`}
    }
  }
  async sendBch (sender,sender_mnemonic,receiver,amount) {
    try {
      // Get the balance of the sending address.
      const balance = await this.getBCHBalance(sender, false)
      console.log(`balance: ${JSON.stringify(balance, null, 2)}`)
      
      // Exit if the balance is zero.
      if (balance <= 0.0) {
        console.log('Balance of sending address is zero. Exiting.')
        throw new Error('Balance of sending address is zero. Exiting.')
      }
  
      // If the user fails to specify a reciever address, just send the BCH back
      // to the origination address, so the example doesn't fail.
      if (receiver === '') receiver = sender
  
      // Convert to a legacy address (needed to build transactions).
      const SEND_ADDR_LEGACY = this.bchjs.Address.toLegacyAddress(sender)
      const RECV_ADDR_LEGACY = this.bchjs.Address.toLegacyAddress(receiver)
      console.log(`Sender Legacy Address: ${SEND_ADDR_LEGACY}`)
      console.log(`Receiver Legacy Address: ${RECV_ADDR_LEGACY}`)
  
      // Get UTXOs held by the address.
      // https://developer.bitcoin.com/mastering-bitcoin-cash/4-transactions/
      const utxos = await this.bchjs.Electrumx.utxo(sender)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`);
  
      if (utxos.utxos.length === 0) throw new Error('No UTXOs found.')
  
      // console.log(`u: ${JSON.stringify(u, null, 2)}`
      const utxo = await this.findBiggestUtxo(utxos.utxos)
      // console.log(`utxo: ${JSON.stringify(utxo, null, 2)}`);
  
      // instance of transaction builder
      let transactionBuilder
      if (this.NETWORK === 'mainnet') {
        transactionBuilder = new this.bchjs.TransactionBuilder()
      } else transactionBuilder = new this.bchjs.TransactionBuilder('testnet')
  
      // Essential variables of a transaction.
      const satoshisToSend = amount
      const originalAmount = utxo.value
      const vout = utxo.tx_pos
      const txid = utxo.tx_hash
  
      // add input with txid and index of vout
      transactionBuilder.addInput(txid, vout)
  
      // get byte count to calculate fee. paying 1.2 sat/byte
      const byteCount = this.bchjs.BitcoinCash.getByteCount(
        { P2PKH: 1 },
        { P2PKH: 2 }
      )
      console.log(`Transaction byte count: ${byteCount}`)
      const satoshisPerByte = 1.2
      const txFee = Math.floor(satoshisPerByte * byteCount)
      console.log(`Transaction fee: ${txFee}`)
  
      // amount to send back to the sending address.
      // It's the original amount - 1 sat/byte for tx size
      const remainder = originalAmount - satoshisToSend - txFee
  
      if (remainder < 0) { throw new Error('Not enough BCH to complete transaction!') }
  
      // add output w/ address and amount to send
      transactionBuilder.addOutput(receiver, satoshisToSend)
      transactionBuilder.addOutput(sender, remainder)
  
      // Generate a change address from a Mnemonic of a private key.
      const change = await this.changeAddrFromMnemonic(sender_mnemonic)
  
      // Generate a keypair from the change address.
      const keyPair = this.bchjs.HDNode.toKeyPair(change)
  
      // Sign the transaction with the HD node.
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )
  
      // build tx
      const tx = transactionBuilder.build()
      // output rawhex
      const hex = tx.toHex()
      
      const txidStr = await this.bchjs.RawTransactions.sendRawTransaction([hex])
      
      return this.transactionStatus(txidStr, this.NETWORK)
    } catch (err) {
      throw new Error(err)
      console.log('error: ', err)
    }
  }
  async changeAddrFromMnemonic (mnemonic) {
    // root seed buffer
    const rootSeed = await this.bchjs.Mnemonic.toSeed(mnemonic)
  
    // master HDNode
    let masterHDNode
    if (this.NETWORK === 'mainnet') masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)
    else masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed, 'testnet')
  
    // HDNode of BIP44 account
    const account = this.bchjs.HDNode.derivePath(masterHDNode, "m/44'/145'/0'")
  
    // derive the first external change address HDNode which is going to spend utxo
    const change = this.bchjs.HDNode.derivePath(account, '0/0')
  
    return change
  }
  
  // Get the balance in BCH of a BCH address.
  async getBCHBalance (addr, verbose) {
    try {
      const result = await this.bchjs.Electrumx.balance(addr)
  
      if (verbose) console.log(result)
  
      // The total balance is the sum of the confirmed and unconfirmed balances.
      const satBalance =
        Number(result.balance.confirmed) + Number(result.balance.unconfirmed)
  
      // Convert the satoshi balance to a BCH balance
      const bchBalance = this.bchjs.BitcoinCash.toBitcoinCash(satBalance)
  
      return bchBalance
    } catch (err) {
      console.error('Error in getBCHBalance: ', err)
      console.log(`addr: ${addr}`)
      throw err
    }
  }
  
}

module.exports = { BCH };
