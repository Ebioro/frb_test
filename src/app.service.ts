import { Injectable } from '@nestjs/common';
import { FireblocksSDK, RawMessage, RawMessageData, SigningAlgorithm, TransactionArguments, TransactionOperation } from 'fireblocks-sdk';
import {Server,TransactionBuilder,Memo,BASE_FEE,Networks,Operation,Asset} from 'stellar-sdk';
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
 
  async getHello(){

  
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
        derivationPath:[44,1,7,0,0]
      }

      const rawMessageData:RawMessageData ={
          messages:[rawMessage],
          algorithm:SigningAlgorithm.MPC_EDDSA_ED25519
      }

      const rawTransaction: TransactionArguments = {
          operation:TransactionOperation.RAW,
          extraParameters:rawMessageData,
      }   

    try {

        const result = await fireblocks.createTransaction(rawTransaction);

        return result
        
    } catch (error) {

        return error
        
    }
    
}

}
