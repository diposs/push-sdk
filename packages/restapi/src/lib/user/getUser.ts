import axios from 'axios';
import { AccountEnvOptionsType, IUser } from '../types';
import { isValidETHAddress, walletToPCAIP10 } from '../helpers/address';
import { getAPIBaseUrls, verifyProfileKeys } from '../helpers';
import Constants from '../constants';
import { populateDeprecatedUser } from '../utils/populateIUser';

export const get = async (options: AccountEnvOptionsType): Promise<IUser> => {
  const { account, env = Constants.ENV.PROD } = options || {};
  if (!isValidETHAddress(account)) {
    throw new Error(`Invalid address!`);
  }
  const caip10 = walletToPCAIP10(account);
  const API_BASE_URL = getAPIBaseUrls(env);
  const requestUrl = `${API_BASE_URL}/v2/users/?caip10=${caip10}`;
  return axios
    .get(requestUrl)
    .then(async (response) => {
      if (response.data) {
        response.data.publicKey = await verifyProfileKeys(
          response.data.encryptedPrivateKey,
          response.data.publicKey,
          response.data.did,
          response.data.wallets,
          response.data.verificationProof
        );
      }
      return populateDeprecatedUser(response.data);
    })
    .catch((err) => {
      console.error(`[Push SDK] - API ${requestUrl}: `, err);
      throw Error(`[Push SDK] - API ${requestUrl}: ${err}`);
    });
};
