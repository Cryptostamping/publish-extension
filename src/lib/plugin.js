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
  }).then((result) => {
    if (key == null) return result;
    else return result[key];
  });
}

export const sendChromeMessage = (message, tabQuery) => {
  return new Promise((resolve, reject) => {
    if (tabQuery) {
      chrome.tabs.query(tabQuery, (tabs) => {
        const currentTabId = tabs[0].id;
        chrome.tabs.sendMessage(currentTabId, message, (res) => {
          if (!res.error) {
            resolve(res);
          }
          reject(res.error);
        });
      });
    } else {
      chrome.runtime.sendMessage(message, (res) => {
        if (!res.error) {
          resolve(res);
        }
        reject(res.error);
      });
    }
  });
};

export async function MoralisLogin(Moralis, response) {
  const authData = {
    id: response.from,
    signature: response.signature,
    data: response.data,
  };
  const isLoggedIn = await Moralis.User.currentAsync();
  if (isLoggedIn) {
    await Moralis.User.logOut();
  }
  Moralis.cleanup();
  console.log(response);
  const _user = await Moralis.User.logInWith("moralisEth", { authData });
  await _user.setACL(new Moralis.ACL(_user));
  _user.addAllUnique("accounts", [response.from]);
  _user.set("ethAddress", response.from);
  await _user.save(null, { signingMessage: APP_SIGNING_MSG });
  return _user;
}

export const moralisQueryConstructor = (Moralis, queryParams) => {
  const moralisClass = Moralis.Object.extend(queryParams.className);
  const query = new Moralis.Query(moralisClass);
  for (const containedIn of queryParams.containedIn) {
    query.containedIn(containedIn.name, containedIn.value);
  }
  for (const equalTo of queryParams.equalTo) {
    query.equalTo(equalTo.name, equalTo.value);
  }
  if (queryParams.sort) {
    query[queryParams.sort.order](queryParams.sort.name);
  }
  if (queryParams.limit) {
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
      equalTo: [],
    };
    if (params.url) {
      query.equalTo.push({
        name: "web_id",
        value: `${params?.url}${
          params?.embedId ? "-embed-" + params?.embedId : ""
        }`,
      });
    }
    if (params.address) {
      query.equalTo.push({ name: "user_address", value: params?.address });
    }
    if (params.sort) {
      query.sort = {
        name: params.sort,
        order: params.sort_order ? "descending" : "ascending",
      };
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
              from: _address,
              signature: result.result,
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

export const EXT_LOGOS = {
  SIGN: { path: "logos/logo48_sign.png" },
  ADD: { path: "logos/logo48_add.png" },
  PLAIN: { path: "logos/logo48.png" },
  CONNECT: { path: "logos/logo48_connect.png" },
  DISABLED: { path: "logos/logo48_disabled.png" },
};

export const EXT_LAYS = {
  NOPOP: { popup: "" },
  CONNECT: { popup: "index.html" },
  ADD: { path: "logos/logo48_add.png" },
  PLAIN: { path: "logos/logo48_add.png" },
};

export const setExtIcon = (icon_logo,tab_id) => {
  if(tab_id){
    chrome.browserAction.setIcon({
          tabId: tab_id,
          ...icon_logo,
        });
    return;
  }
  chrome.tabs &&
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      if (activeTab)
        chrome.browserAction.setIcon({
          tabId: activeTab.id,
          ...icon_logo,
        });
    });
};

export const setExtIconPromise = (icon_logo) => {
  return new Promise((resolve, reject) => {
    chrome.tabs &&
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        if (activeTab){
          chrome.browserAction.setIcon({
            tabId: activeTab.id,
            ...icon_logo,
          });
          resolve(activeTab.id);
        }
        reject(new Error("No active Tab"));
      });
  });
};

export const setExtPopup = (icon_popup) => {
  chrome.tabs &&
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      if (activeTab)
        chrome.browserAction.setPopup({
          tabId: activeTab.id,
          ...icon_popup,
        });
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
      throw new Error(
        `Can't remove a listener. Event "${name}" doesn't exits.`
      );
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
