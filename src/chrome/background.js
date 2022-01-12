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

const provider = createMetaMaskProvider();
const web3 = new Web3(provider);
//Moralis.start({ serverUrl:MOLARIS_SERVER_URL, appId: MOLARIS_APP_ID });
provider.on("error", (error) => {
  if (error && error.includes("lost connection")) {
    //setSubtitle("MetaMask extension not detected.");
    console.log("provider error");
  }
});
provider.on("accountsChanged", (accounts) => {
  if (!accounts.length) {
    chrome.storage.sync.set({ address: null });
    setupPopup();
    return;
  }
  chrome.storage.sync.set({ address: accounts[0] });
  setupEmmitter(accounts);
  setupPopup();
});
provider.on("disconnect", (accounts) => {
  chrome.storage.sync.set({ address: null });
  setupEmmitter(accounts);
  setupPopup();
});

const setupPopup = () => {
  if (!provider.selectedAddress) {
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
        const currentTabId = tabs[0].id;
        chrome.tabs.sendMessage(currentTabId, {
          type: "provider_events",
          name: "disconnect",
          data: { emit_data },
        });
      }
    );
};

const messagesFromContentListener = (message, sender, response) => {
  /*if (message.type === "moralis") {
    if(message.key === "query"){
      const query = moralisQueryConstructor(Moralis, message.queryParams);
        query
        .then((results) => {
          response(Array.from(results, (x) => x.toJSON()));
        })
        .catch((err) => {
          response({ error: err });
        })
      return true;
    }
    if(message.key === "current_user"){
      response(Moralis.User.current().toJSON());
      return true;
    }
  }
  */

  if (message.key === "syncPopup") {
    setupPopup();
  }

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
          setupPopup();
          response({address: _address});
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

    if(message.key === "provider_address"){
      response({address: provider?.selectedAddress});
      return true;
    }
  }
};

chrome.runtime.onMessage.addListener(messagesFromContentListener);

chrome.runtime.onConnect.addListener(() => {
  console.log("background connected");
});

chrome.browserAction.onClicked.addListener(function (tab) {
  // Send a message to the active tab
  chrome.tabs &&
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {
        from: "background",
        message: "embed_stamper",
      });
    });
});

chrome.runtime.onStartup.addListener(() => {
  setupPopup();
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ address: null });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
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