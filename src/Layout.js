/* global chrome */
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

import Tooltip from "~/src/components/modals/tooltip";
import CryptoStamper from "~/src/components/cryptostamper/main";
import {
  MOLARIS_APP_ID,
  MOLARIS_SERVER_URL,
  FRONTEND_BASE_URL,
} from "~/src/lib/data";
import { printAddress } from "~/src/lib/utils";
import { sendChromeMessage, EXT_LOGOS, EXT_LAYS } from "~/src/lib/plugin";

import selector from "~/src/components/cryptostamper/selector.module.scss";
import styles from "~/src/styles/pages/layout.module.scss";

import store from "~/src/lib/redux/store";

const version = process.env.REACT_APP_VERSION;

function Layout({ domElement }) {
  const [theme, setTheme] = useState("light");
  const [url, setUrl] = useState(null);
  const [subtitle, setSubtitle] = useState("To fetch your stamps.");
  const [isConnected, SetConnected] = useState(false);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    chrome.tabs &&
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const url = tabs[0].url;
        setUrl(url);
        //console.log(url);
      });
    sendChromeMessage({
      type: "ethereum",
      key: "provider_address",
      from: "popup",
    }).then((res) => {
      if (res.address) {
        setAddress(res.address);
        SetConnected(true);
      }
    });
  }, []);

  const connectMetamask = () => {
    sendChromeMessage({
      type: "ethereum",
      key: "connect_wallet",
      from: "popup",
    })
      .then((res) => {
        return sendChromeMessage(
          {
            from: "popup",
            message: "embed_stamper",
          },
          {
            active: true,
            currentWindow: true,
          }
        );
      })
      .then((res) => {
        chrome.browserAction.setIcon(EXT_LOGOS.ADD);
        chrome.browserAction.setPopup(EXT_LAYS.NOPOP);
        window.close();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  if (isConnected) {
    return (
      <div
        className={`${styles.initial_lay} cryptostamping-wrapper`}
        data-theme={theme}
      >
        <img className={styles.logo_image} src="/logo_favicon.svg" alt="" />
        <h1 className={styles.logo_title}>Cryptostamping</h1>
        <p className={selector.bold_subtitle}>{printAddress(address)}</p>
      </div>
    );
  }
  return (
    <div
      className={`${styles.initial_lay} cryptostamping-wrapper`}
      data-theme={theme}
    >
      <img className={styles.logo_image} src="/logo_favicon.svg" alt="" />
      <h1 className={styles.logo_title}>Cryptostamping</h1>
      <p className={styles.logo_subtitle}>Version {version}</p>
      <div onClick={connectMetamask} className={styles.connect_btn}>
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
