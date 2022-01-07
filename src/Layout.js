/* global chrome */
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import createMetaMaskProvider from "metamask-extension-provider";

import { MoralisProvider } from "react-moralis";
import { Provider } from "react-redux";

import Tooltip from "~/src/components/modals/tooltip";
import CryptoStamper from "~/src/components/cryptostamper/main";
import {
  MOLARIS_APP_ID,
  MOLARIS_SERVER_URL,
  FRONTEND_BASE_URL,
} from "~/src/lib/data";
import {useConnect} from "~/src/lib/web3";

import styles from "~/src/styles/pages/layout.module.scss";

import store from "~/src/lib/redux/store";

const version = process.env.REACT_APP_VERSION;

function Layout({ domElement }) {
  const [theme, setTheme] = useState("light");
  const [url, setUrl] = useState(null);
  const [provider, setProvider] = useState();
  const [subtitle, setSubtitle] = useState("To fetch your stamps.");
  const {
    address,
    accounts,
    connectWallet,
    setProvider: setConnectProvider,
  } = useConnect();

  useEffect(() => {
    setProvider(createMetaMaskProvider());
  }, []);
  useEffect(() => {
    if (provider) {
      setConnectProvider(provider);
      provider.on("error", (error) => {
        if (error && error.includes("lost connection")) {
          setSubtitle("MetaMask extension not detected.");
        }
      });
    }
  }, [provider, setConnectProvider]);

  useEffect(() => {
    const queryInfo = { active: true, lastFocusedWindow: true };

    chrome.tabs &&
      chrome.tabs.query(queryInfo, (tabs) => {
        const url = tabs[0].url;
        setUrl(url);
        //console.log(url);
      });
  }, []);

  const sendTestMessage = () => {
    console.log(provider);
    const message = {
      from: "background",
      message: "embed_stamper"
    };
    const queryInfo = {
      active: true,
      currentWindow: true,
    };
    chrome.tabs &&
      chrome.tabs.query(queryInfo, (tabs) => {
        console.log(tabs);
        const currentTabId = tabs[0].id;
        chrome.tabs.sendMessage(currentTabId, message, (response) => {
          console.log(response);
        });
      });

  };

  const connectMetamask = () => {
    /*connectWallet()
      .then((res) => {
        const currentUser = Moralis.User.current();
        if (currentUser) {
          dispatch(setUser(currentUser.toJSON()));
          return;
        }
        return Moralis.authenticate({
          signingMessage:
            "Hey there, this seems to be your first time stamping here. Please sign to verify this is you. This will not charge any gas transaction fee.",
        });
      })
      .then(() => {
        openSelector(address);
      })
      .catch((err) => {
        console.log(err);
      });*/
  }

  return (
    <div
      className={`${styles.initial_lay} cryptostamping-wrapper`}
      data-theme={theme}
    >
      <img className={styles.logo_image} src="/logo_favicon.svg" alt="" />
      <h1 className={styles.logo_title}>Cryptostamping</h1>
      <p className={styles.logo_subtitle}>Version {version}</p>
      <div onClick={sendTestMessage} className={styles.connect_btn}>
        <img
          className={styles.icon_metamask}
          src="/icons/metamask.png"
          alt=""
        />
        Connect to Metamask
      </div>
    </div>
  );
}

export default Layout;
