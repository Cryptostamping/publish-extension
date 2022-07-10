/* global chrome */
import createMetaMaskProvider from "metamask-extension-provider";
//import Moralis from 'moralis/dist/moralis.js';
import Web3 from "web3";
import Moralis from "moralis/dist/moralis.min.js";

import {
  APP_SIGNING_MSG,
  MOLARIS_SERVER_URL,
  MOLARIS_APP_ID,
} from "~/src/lib/data";
import {
  createSignMessage,
  generateMoralisQuery,
  moralisQueryConstructor,
  getFromStorage,
  EXT_LOGOS,
  EXT_LAYS,
  setExtIcon,
  setExtIconPromise,
  setExtPopup,
  getBadgeDetails
} from "~/src/lib/plugin";

//Moralis.start({ serverUrl:MOLARIS_SERVER_URL, appId: MOLARIS_APP_ID });

const initialisePopup = (provider_in) => {
  chrome.browserAction.setIcon(EXT_LOGOS.PLAIN);
  if (!provider_in.selectedAddress) {
    chrome.browserAction.setPopup(EXT_LAYS.CONNECT);
  } else {
    chrome.browserAction.setPopup(EXT_LAYS.NOPOP);
  }
  //chrome.storage.sync.get(["address"], ({ address }) => {});
};

const setupEmmitter = (emit_name, emit_data) => {
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
            name: emit_name,
            data: { emit_data },
          });
      }
    );
};

const setupProvider = () => {
  let provider = createMetaMaskProvider();
  const web3 = new Web3(provider);
  Moralis.start({ serverUrl: MOLARIS_SERVER_URL, appId: MOLARIS_APP_ID });
  chrome.storage.sync.set({ provider: "metamask" });

  const handleAccountsChanged = (accounts) => {
    if (!accounts.length) {
      console.log("no accounts");
      chrome.storage.sync.set({ address: null });
      initialisePopup(provider);
      return;
    }
    chrome.storage.sync.set({
      address: provider?.selectedAddress || accounts[0],
    });
    initialisePopup(provider);
  };

  const accountsChangedListener = (accounts) => {
    handleAccountsChanged(accounts);
    setupEmmitter("accountsChanged", accounts);
  };

  const disconnectListener = (accounts) => {
    chrome.storage.sync.set({ address: null });
    setupEmmitter("disconnect", accounts);
    initialisePopup(provider);
    console.log("disconnect listener");
  };

  const connectListener = (connectInfo) => {
    setupEmmitter("connect", connectInfo);
    provider
      .request({
        method: "eth_accounts",
        params: [],
      })
      .then((accounts) => {
        handleAccountsChanged(accounts);
      });
    console.log("connect listener");
  };

  const errorListener = (error) => {
    if (error && error.indexOf("Lost connection") > -1) {
      chrome.storage.sync.set({ provider: null });
      provider.removeListener("error", errorListener);
      provider.removeListener("accountsChanged", accountsChangedListener);
      provider.removeListener("disconnect", disconnectListener);
      provider.removeListener("connect", connectListener);
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
            initialisePopup(provider);
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
            return Promise.all([
              getFromStorage("sign_data"),
              accounts,
              getFromStorage("sign_handling"),
            ]);
          })
          .then((response) => {
            const sign_data = response[0];
            const accounts = response[1];
            const current_address = accounts[0];
            const sign_handling = response[2];
            //if (sign_data?.from === current_address) {
            //  return sign_data;
            //}
            if (sign_handling) {
              throw new Error("Handling Signature request");
            }
            //setExtIcon(EXT_LOGOS.SIGN);
            var msg = `0x${Buffer.from(message.sign_message, "utf8").toString(
              "hex"
            )}`;
            chrome.storage.sync.set({ address: current_address });
            chrome.storage.sync.set({ sign_handling: true });
            return createSignMessage(web3, msg, current_address);
          })
          .then((result) => {
            response({
              signature: result.signature,
              from: result.from,
              data: message.sign_message,
            });
            chrome.storage.sync.set({ sign_handling: false });
            chrome.storage.sync.set({ sign_data: result });
            //setExtIcon(EXT_LOGOS.ADD);
          })
          .catch((err) => {
            console.log(err);
            response({ error: err });
            chrome.storage.sync.set({ sign_handling: false });
            //setExtIcon(EXT_LOGOS.ADD);
          });
        return true;
      }

      if (message.key === "sign_message") {
        Promise.all([
          setExtIconPromise(EXT_LOGOS.SIGN),
          getFromStorage("address"),
        ])
          .then((responses) => {
            const tabId = responses[0];
            const _address = responses[1];
            if (provider && _address !== provider?.selectedAddress) {
              throw new Error("Address Mismatch");
            }
            chrome.storage.sync.set({ sign_handling: tabId });
            return Promise.all([
              tabId,
              createSignMessage(web3, message.message, _address),
            ]);
          })
          .then((results) => {
            const tabId = results[0];
            setExtIcon(EXT_LOGOS.ADD, tabId);
            chrome.storage.sync.set({ sign_handling: false });
            response({
              signature: results[1].signature,
              signature_data: results[1].signature_data,
              from: results[1].from,
            });
          })
          .catch((err) => {
            getFromStorage("sign_handling").then((tabId) => {
              if (tabId) setExtIcon(EXT_LOGOS.ADD, tabId);
              chrome.storage.sync.set({ sign_handling: false });
            });
            response({ error: err });
          });
        return true;
      }

      if (message.key === "get_accounts") {
        provider
          .request({
            method: message.requestPermission
              ? "eth_requestAccounts"
              : "eth_accounts",
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
    if (message.type === "ui") {
      if (message.key === "close_embed") {
        setExtIcon(EXT_LOGOS.PLAIN);
        setExtPopup(EXT_LAYS.NOPOP);
        return false;
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

  const syncMoralisChecker = (tab_id, tab) => {
    const testnet = tab.url?.indexOf("testnet=true") > -1;
    const url = testnet ? tab.url.substring(0,tab.url.indexOf("?")) : tab.url;
    const embedId = null;
    const userStampingQueryCount = generateMoralisQuery("stampingQuery", {
      testnet,
      url,
      embedId,
      exec: "count",
    });
    moralisQueryConstructor(Moralis, userStampingQueryCount)
      .then((response) => {
        console.log("count", response);
        if (response > 0) {
          const {badge_text, badge_color} = getBadgeDetails(response,testnet);
          chrome.browserAction.setBadgeBackgroundColor({tabId: tab_id, color: badge_color});
          chrome.browserAction.setBadgeText({tabId: tab_id, text: badge_text});
        } else {
          chrome.browserAction.setBadgeText({tabId: tab_id, text: ""});
        }
      })
      .catch((err) => {
        //console.log(err);
        chrome.browserAction.setBadgeText({tabId: tab_id, text: ""});
      });
  };

  const tabsUpdateListener = (tabId, changeInfo, tab) => {
    if (tab.url.indexOf("chrome-extension://") > -1) {
      return;
    }
    if (changeInfo.status === "loading") {
      setExtIcon(EXT_LOGOS.DISABLED, tabId);
      syncMoralisChecker(tabId, tab);
      return;
    }
    if (changeInfo.status === "complete") {
      chrome.tabs.sendMessage(tabId, {
        from: "background",
        message: "inject_stamping",
        tabId: tabId,
      });
      setExtIcon(EXT_LOGOS.PLAIN, tabId);
      if (!provider.selectedAddress || tab.url.indexOf("chrome://") > -1) {
        setExtPopup(EXT_LAYS.CONNECT, tabId);
      } else {
        setExtPopup(EXT_LAYS.NOPOP, tabId);
      }
    }
  };

  if (provider) {
    provider.on("error", errorListener);
    provider.on("accountsChanged", accountsChangedListener);
    provider.on("disconnect", disconnectListener);
    provider.on("connect", connectListener);
    chrome.runtime.onMessage.addListener(messagesFromContentListener);
    chrome.tabs.onUpdated.addListener(tabsUpdateListener);
    chrome.runtime.onStartup.addListener(() => {
      initialisePopup(provider);
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
        chrome.tabs.sendMessage(
          activeTab?.id,
          {
            from: "background",
            message: "embed_stamper",
            tabId: activeTab?.id,
          },
          (res) => {
            if (res.error) return;
            if (res.loaded) {
              setExtIcon(EXT_LOGOS.ADD,activeTab?.id);
              setExtPopup(EXT_LAYS.CONNECT, activeTab?.id);
            }
          }
        );
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
