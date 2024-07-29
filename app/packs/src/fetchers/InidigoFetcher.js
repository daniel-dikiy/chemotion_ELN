// for endpoints check: https://github.dev/epam/Indigo/tree/master/utils/indigo-service/backend/service
import 'whatwg-fetch';

export default class IndigoServiceFetcher {
  static convertMolfileToDefaultIndigo(params) {
    const { struct, output_format } = params;

    // enum: param output_format ***
    // - chemical/x-mdl-rxnfile
    // - chemical/x-mdl-molfile
    // - chemical/x-indigo-ket
    // - chemical/x-daylight-smiles
    // - chemical/x-chemaxon-cxsmiles
    // - chemical/x-cml
    // - chemical/x-inchi
    // - chemical/x-inchi-key
    // - chemical/x-iupac
    // - chemical/x-daylight-smarts
    // - chemical/x-inchi-aux
    console.log(struct);

    const root = "http://localhost:8002";
    return fetch(`${root}/v2/indigo/convert`, {
      // credentials: 'same-origin',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        struct,
        // output_format  default: chemical/x-mdl-molfile
      }),
    })
      .then((response) => response.json())
      .then((json) => json)
      .catch((errorMessage) => {
        console.log(errorMessage.message);
      });
  }
}