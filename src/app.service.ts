import { Injectable } from '@nestjs/common';
import { FireblocksSDK, PeerType, RawMessage, RawMessageData, SigningAlgorithm, TransactionArguments, TransactionOperation, TransferPeerPath } from 'fireblocks-sdk';
import {Server,TransactionBuilder,Memo,BASE_FEE,Networks,Operation,Asset,Transaction} from 'stellar-sdk';
import { ConfigService } from '@nestjs/config';

interface FrbConfig {
    
  api_signer_key:string,
  api_secret:string,
  xlm_asset_id:string,
}

let frbConfig:FrbConfig;


let fireblocks:FireblocksSDK;


@Injectable()
export class AppService {

  constructor(private configService:ConfigService){

    frbConfig = this.configService.get<FrbConfig>('frb');
    
    
    const privateKey = Buffer.from(frbConfig.api_secret, 'base64').toString();

    fireblocks = new FireblocksSDK(privateKey, frbConfig.api_signer_key);
}

async hexToBase64(tx:string){

  /*
  const base64String = btoa(String.fromCharCode.apply(null,
    tx.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
  );
*/ 
const buffer = Buffer.from(tx,'hex');
const base64String = buffer.toString('base64');
return base64String;

}
 
  async sendPayment(){

    const source_account_key = 'GC35TCKLNFMLNOIYGFSF5QWETSTIWU2TUOENZBMDOU7CG755T5F2ZNVS'; // account private key hosted at frb
    const account_destination = 'GBCLLJTK7NKOZ5HMUHMDWCZJZ75XFS54PFNGAGNACHISZVKO3ZMEFSSV'; // account to receive the payment transfer
    const horizon = new Server('https://horizon-testnet.stellar.org');
   
    const sourceAccount = await horizon.loadAccount(source_account_key);
    
   /**
    * Building Stellar Tx
    */

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
          Operation.payment({
          destination: account_destination,
          asset: Asset.native(),
          amount: "10",
        }),
      )
      
      .addMemo(Memo.text("Test Frb Transaction"))
      // Wait a maximum of three minutes for the transaction
      .setTimeout(180)
      .build();

      console.log('the Stellar transaction to sign '+transaction.toEnvelope().toXDR('base64'));

      /**
       * Prep Frb raw signature
       */

      const rawMessage:RawMessage = {
        content:transaction.toEnvelope().toXDR("hex"), 
        //derivationPath:[44,1,7,0,0]
      }

      const peerPath:TransferPeerPath ={
        type:PeerType.VAULT_ACCOUNT,
        id:'7'
      }

      const rawMessageData:RawMessageData ={
          messages:[rawMessage],
          //algorithm:SigningAlgorithm.MPC_EDDSA_ED25519
      }

      const rawTransaction: TransactionArguments = {
          assetId:'XLM_TEST',
          operation:TransactionOperation.RAW,
          source:peerPath,
          extraParameters:{rawMessageData}
      }   

    try {

        const result = await fireblocks.createTransaction(rawTransaction);

        const txId = result.id;

        const rawTxObject = await fireblocks.getTransactionById(txId);

        console.log('the raw object ' +JSON.stringify(rawTxObject))

        const signedTx = rawTxObject.signedMessages[0].content;

        console.log('the signed object ' +JSON.stringify(signedTx))

        const base64Tx = this.hexToBase64(signedTx)

        return base64Tx
        //result
        
    } catch (error) {

        return error
        
    }
    
  }

  async trustOperation(){

    const source_account_key = 'GC35TCKLNFMLNOIYGFSF5QWETSTIWU2TUOENZBMDOU7CG755T5F2ZNVS'; // account private key hosted at frb
    const account_destination = 'GBCLLJTK7NKOZ5HMUHMDWCZJZ75XFS54PFNGAGNACHISZVKO3ZMEFSSV'; // account to receive the payment transfer
    const horizon = new Server('https://horizon-testnet.stellar.org');
   
    const sourceAccount = await horizon.loadAccount(source_account_key);


    
   /**
    * Building Stellar Tx
    */

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: new Asset('EUR','GBCLLJTK7NKOZ5HMUHMDWCZJZ75XFS54PFNGAGNACHISZVKO3ZMEFSSV'),
        }),
      )
      
      .addMemo(Memo.text("Test Frb Transaction"))
      // Wait a maximum of three minutes for the transaction
      .setTimeout(180)
      .build();

      console.log('the Stellar transaction to sign '+transaction.toEnvelope().toXDR('base64'));

      /**
       * Prep Frb raw signature
       */

      const rawMessage:RawMessage = {
        content:transaction.toEnvelope().toXDR("hex"), 
        derivationPath:[44,1,7,0,0]
      }

      const peerPath:TransferPeerPath ={
        type:PeerType.VAULT_ACCOUNT,
        id:'7'
      }

      const rawMessageData:RawMessageData ={
          messages:[rawMessage],
          algorithm:SigningAlgorithm.MPC_EDDSA_ED25519
      }

      const rawTransaction: TransactionArguments = {
          //assetId:'XLM_TEST',
          operation:TransactionOperation.RAW,
          //source:peerPath,
          extraParameters:{rawMessageData}
      }   

    try {

        const result = await fireblocks.createTransaction(rawTransaction);

        return result
        
    } catch (error) {

        return error
        
    }

  }

  async getTransaction(){
    const result = await fireblocks.getTransactionById('ddfe4cba-0eb5-48fe-86d5-25f649800f44')
    const signedTx = result.signedMessages[0].content;

        console.log('the signed object ' +JSON.stringify(signedTx))

        const base64Tx = this.hexToBase64(signedTx)

        return base64Tx
  }

  async txBuilder(){
    const hex = '0000000200000000b7d9894b6958b6b91831645ec2c49ca68b5353a388dc8583753e237fbd9f4bac00000064002168190000000200000001000000000000000000000000604d1c1b00000001000000145465737420467262205472616e73616374696f6e0000000100000000000000010000000044b5a66afb54ecf4eca1d83b0b29cffb72cbbc795a6019a011d12cd54ede5842000000000000000005f5e1000000000000000000'
    const result = new Transaction(hex,Networks.TESTNET)
    //const transaction = TransactionBuilder.fromXDR(hex,Networks.TESTNET);
    return result.toEnvelope().toXDR('base64')
  }

}
