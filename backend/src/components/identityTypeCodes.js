import config from '../config/index.js';
import { ServiceError } from './error.js';
import { getData } from './utils.js';

/** Codes state */
let codes = null;
/** Set the codes state to some arbitrary value for testing purposes only */
export function _setCodes(val = null) { codes = val; }
/** Get the codes state directly for testing purposes only */
export function _getCodes() { return codes; }

export async function getServerSideCodes(accessToken, correlationID) {
  if (!codes) {
    try {
      const codeUrls = [
        `${config.get('digitalID:apiEndpoint')}/identityTypeCodes`
      ];

      const [identityTypes] = await Promise.all(codeUrls.map(url => getData(accessToken, url), correlationID));
      codes = {identityTypes};
    } catch(e) {
      throw new ServiceError('getServerSideCodes error', e);
    }
  }
  return codes;
}
