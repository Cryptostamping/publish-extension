/* global chrome */
import createMetaMaskProvider from "metamask-extension-provider";
//import Moralis from 'moralis/dist/moralis.js';
import Web3 from "web3";

import {
  APP_SIGNING_MSG,
  MOLARIS_SERVER_URL,
  MOLARIS_APP_ID,
} from "~/src/lib/data";
import {
  createSignMessage,
  moralisQueryConstructor,
  getFromStorage,
} from "~/src/lib/plugin";

//Moralis.start({ serverUrl:MOLARIS_SERVER_URL, appId: MOLARIS_APP_ID });

const setupPopup = (provider_in) => {
  if (!provider_in.selectedAddress) {
    chrome.browserAction.setIcon({ path: "logo48.png" });
    chrome.browserAction.setPopup({
      popup: "index.html",
    });
  } else {
    chrome.browserAction.setIcon({ path: "logo48_add.png" });
    chrome.browserAction.setPopup({
      popup: "",
    });
  }
  //chrome.storage.sync.get(["address"], ({ address }) => {});
};

const setupEmmitter = (emit_data) => {
  chrome.tabs &&
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        const currentTabId = tabs[0]?.id;
        if (currentTabId)
          chrome.tabs.sendMessage(currentTabId, {
            type: "provider_events",
            name: "disconnect",
            data: { emit_data },
          });
      }
    );
};

const setupProvider = () => {
  let provider = createMetaMaskProvider();
  const web3 = new Web3(provider);
  chrome.storage.sync.set({ provider: "metamask" });

  const accountsChangedListener = (accounts) => {
    if (!accounts.length) {
      chrome.storage.sync.set({ address: null });
      setupPopup(provider);
      return;
    }
    chrome.storage.sync.set({ address: accounts[0] });
    setupEmmitter(accounts);
    setupPopup(provider);
  };

  const disconnectListener = (accounts) => {
    chrome.storage.sync.set({ address: null });
    setupEmmitter(accounts);
    setupPopup(provider);
  };

  const errorListener = (error) => {
    if (error && error.indexOf("Lost connection") > -1) {
      chrome.storage.sync.set({ provider: null });
      provider.removeListener("error", errorListener);
      provider.removeListener("accountsChanged", accountsChangedListener);
      provider.removeListener("disconnect", disconnectListener);
      chrome.runtime.onMessage.removeListener(messagesFromContentListener);
      chrome.tabs.onUpdated.removeListener(tabsUpdateListener);
      setTimeout(() => {
        chrome.runtime.reload();
      }, 5000);
      //setSubtitle("MetaMask extension not detected."); timeout and reconnect.
    }
  };

  const messagesFromContentListener = (message, sender, response) => {
    if (message.type === "ethereum") {
      if (message.key === "connect_wallet" && message.from === "popup") {
        provider
          .request({
            method: "eth_requestAccounts",
            params: [],
          })
          .then((accounts) => {
            const _address = accounts[0];
            chrome.storage.sync.set({ address: _address });
            setupPopup(provider);
            response({ address: _address });
          })
          .catch((err) => {
            response({ error: err });
          });
        return true;
      }
      if (message.key === "connect_wallet" && message.from === "content") {
        provider
          .request({
            method: "eth_requestAccounts",
            params: [],
          })
          .then((accounts) => {
            if (accounts?.length <= 0) throw new Error("No Accounts connected");
            return Promise.all([getFromStorage("sign_data"), accounts]);
          })
          .then((response) => {
            const sign_data = response[0];
            const accounts = response[1];
            const current_address = accounts[0];
            //if (sign_data?.from === current_address) {
            //  return sign_data;
            //}
            var msg = `0x${Buffer.from(message.sign_message, "utf8").toString(
              "hex"
            )}`;
            const _address = accounts[0];
            chrome.storage.sync.set({ address: _address });
            return createSignMessage(web3, msg, _address);
          })
          .then((result) => {
            response({
              signature: result.signature,
              from: result.from,
              data: message.sign_message,
            });
            chrome.storage.sync.set({ sign_data: result });
          })
          .catch((err) => {
            console.log(err);
            response({ error: err });
          });
        return true;
      }

      if (message.key === "sign_message") {
        getFromStorage("address")
          .then((_address) => {
            return createSignMessage(web3, message.message, _address);
          })
          .then((result) => {
            response({
              signature: result.signature,
              signature_data: result.signature_data,
              from: result.address,
            });
          })
          .catch((err) => {
            response({ error: err });
          });
        return true;
      }

      if (message.key === "get_accounts") {
        provider
          .request({
            method: "eth_requestAccounts",
            params: [],
          })
          .then((accounts) => {
            response(accounts);
          })
          .catch((err) => {
            response({ error: err });
          });
        return true;
      }

      if (message.key === "get_address") {
        chrome.storage.sync.get(["address"], ({ address }) => {
          response({ address });
        });
        return true;
      }

      if (message.key === "provider_address") {
        response({ address: provider?.selectedAddress });
        return true;
      }
    }

    /*if (message.type === "moralis") {
      if (message.key === "query") {
        const query = moralisQueryConstructor(Moralis, message.queryParams);
        query
          .then((results) => {
            response(Array.from(results, (x) => x.toJSON()));
          })
          .catch((err) => {
            response({ error: err });
          });
        return true;
      }
      if (message.key === "current_user") {
        response(Moralis.User.current().toJSON());
        return true;
      }
    }

    if (message.key === "syncPopup") {
      setupPopup(provider);
    }*/
  };

  const tabsUpdateListener = (tabId, changeInfo, tab) => {
    if (changeInfo.status === "loading") {
    }
    if (changeInfo.status === "complete") {
      if (!provider.selectedAddress || tab.url === "chrome://newtab/") {
        chrome.browserAction.setIcon({ path: "logo48.png" });
        chrome.browserAction.setPopup({
          tabId: tabId,
          popup: "index.html",
        });
      } else {
        chrome.browserAction.setIcon({ path: "logo48_add.png" });
        chrome.browserAction.setPopup({
          tabId: tabId,
          popup: "",
        });
      }
    }
  };

  if (provider) {
    provider.on("error", errorListener);
    provider.on("accountsChanged", accountsChangedListener);
    provider.on("disconnect", disconnectListener);
    chrome.runtime.onMessage.addListener(messagesFromContentListener);
    chrome.tabs.onUpdated.addListener(tabsUpdateListener);
    chrome.runtime.onStartup.addListener(() => {
      setupPopup(provider);
    });
  }
};

setupProvider();

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ address: null });
});

chrome.runtime.onConnect.addListener(() => {
  console.log("background connected");
});

chrome.browserAction.onClicked.addListener(function (tab) {
  // Send a message to the active tab
  chrome.tabs &&
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      if (activeTab)
        chrome.tabs.sendMessage(activeTab?.id, {
          from: "background",
          message: "embed_stamper",
        });
    });
});

/*
function isCSPHeader(headerName) {
  return (headerName === 'CONTENT-SECURITY-POLICY') || (headerName === 'X-WEBKIT-CSP');
}

// Listens on new request
chrome.webRequest.onHeadersReceived.addListener((details) => {
  for (let i = 0; i < details.responseHeaders.length; i += 1) {
    if (isCSPHeader(details.responseHeaders[i].name.toUpperCase())) {
      const csp = 'default-src * \'unsafe-inline\' \'unsafe-eval\' data: blob:; ';
      details.responseHeaders[i].value = csp;
    }
  }
  return { // Return the new HTTP header
    responseHeaders: details.responseHeaders,
  };
}, {
  urls: ['<all_urls>'],
  types: ['main_frame'],
}, ['blocking', 'responseHeaders']);
*/
