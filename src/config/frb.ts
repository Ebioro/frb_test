import { registerAs } from '@nestjs/config';

export default registerAs('frb', () => ({

  name:"frb",
  
  api_signer_key:process.env.FRB_API_SIGNER_KEY,
  api_secret: process.env.FRB_API_SECRET,
  xlm_asset_id:process.env.FRB_XLM_ASSET_ID,
  
}));