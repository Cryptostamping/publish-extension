/* global chrome */
import {
  MOLARIS_APP_ID,
  APP_SIGNING_MSG,
  supportedTestChains,
  supportedMainChains,
} from "~/src/lib/data";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";

export async function createSigningData(Moralis, message) {
  let data;

  try {
    const { dateTime } = await Moralis.Cloud.run("getServerTime");

    data = `${message}\n\nId: ${MOLARIS_APP_ID}:${dateTime}`;
  } catch (error) {
    data = `${message}`;
  }
  return data;
}

export async function getFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, resolve);
    })
    .then(result => {
      if (key == null) return result;
      else return result[key];
    });
}

export async function MoralisLogin(Moralis, response) {
  const _sign_data = await createSigningData(Moralis, APP_SIGNING_MSG);
  const authData = {
    id: response.address,
    signature: response.signature,
    data: _sign_data,
  };
  const _user = await Moralis.User.logInWith("moralisDot", { authData });
  await _user.setACL(new Moralis.ACL(_user));
  _user.addAllUnique("dotAccounts", [response.address]);
  _user.set("dotAddress", response.address);
  await _user.save();
  return _user;
}

export const moralisQueryConstructor = (Moralis, queryParams) => {
  const moralisClass = Moralis.Object.extend(queryParams.className);
  const query = new Moralis.Query(moralisClass);
  for (const containedIn of queryParams.containedIn) {
    query.containedIn(containedIn.name, queryParams.containedIn.value);
  }
  for (const equalTo of queryParams.equalTo) {
    query.equalTo(equalTo.name, queryParams.equalTo.value);
  }
  if(queryParams.sort) {
    query[queryParams.sort.order](queryParams.sort.name);
  }
  if(queryParams.limit) {
    query.limit(queryParams.limit);
  }
  if (queryParams.exec === "find") return query.find();
  if (queryParams.exec === "count") return query.count();
  else return query.count();
};

export const generateMoralisQuery = (type, params) => {
  if (type === "stampingQuery") {
    const query = {
      className: "Stamping",
      exec: params.exec,
      limit: params.limit,
      containedIn: [
        {
          name: "chain",
          value: params?.testnet ? supportedTestChains : supportedMainChains,
        },
      ],
      equalTo: []
    };
    if(params.url){
      query.equalTo.push({
          name: "web_id",
          value: `${params?.url}${
            params?.embedId ? "-embed-" + params?.embedId : ""
          }`,
        });
    }
    if(params.address){
      query.equalTo.push({ name: "user_address", value: params?.address });
    }
    if(params.sort){
      query.sort = {
        name: params.sort,
        order: params.sort_order ? "descending" : "ascending"
      }
    }
    return query;
  }
};

export const createSignMessage = (web3, msg, _address) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(
      {
        method: "personal_sign",
        params: [msg, _address],
        from: _address,
      },
      function (err, result) {
        if (err) {
          console.log(err);
          reject(err);
        }
        if (result.error) {
          reject(result.error.message);
        } else {
          const msgParams = { data: msg };
          msgParams.signature = result.result;

          const recovered = recoverPersonalSignature(msgParams);

          if (recovered === _address) {
            resolve({
              address: _address,
              signature: JSON.stringify(result.result),
              signature_data: JSON.stringify(msgParams),
            });
          } else {
            reject(
              "SigUtil Failed to verify signer when comparing " +
                recovered.result +
                " to " +
                _address
            );
            console.log("Failed, comparing %s to %s", recovered, _address);
          }
        }
      }
    );
  });
};

export class CryptostampingProvider {
  constructor() {
    this._events = {};
  }

  on(name, listener) {
    if (!this._events[name]) {
      this._events[name] = [];
    }

    this._events[name].push(listener);
  }

  removeListener(name, listenerToRemove) {
    if (!this._events[name]) {
      throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
    }

    const filterListeners = (listener) => listener !== listenerToRemove;

    this._events[name] = this._events[name].filter(filterListeners);
  }

  emit(name, data) {
    if (!this._events[name]) {
      throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);
    }

    const fireCallbacks = (callback) => {
      callback(data);
    };

    this._events[name].forEach(fireCallbacks);
  }
}
