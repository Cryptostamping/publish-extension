/* global chrome */
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactDOM from "react-dom";
import createMetaMaskProvider from 'metamask-extension-provider';

import { MoralisProvider } from "react-moralis";
import { Provider } from "react-redux";

import Tooltip from "~/src/components/modals/tooltip";
import CryptoStamper from "~/src/components/cryptostamper/main";
import {
  MOLARIS_APP_ID,
  MOLARIS_SERVER_URL,
  FRONTEND_BASE_URL,
} from "~/src/lib/data";

import styles from "~/src/styles/pages/layout.module.scss";
import selector from "~/src/components/cryptostamper/selector.module.scss";

import store from "~/src/lib/redux/store";

function Layout({ domElement }) {
  const [view, setView] = useState("button");
  const [theme, setTheme] = useState("light");
  const [url, setUrl] = useState(null);

  /*useEffect(()=>{
    document.documentElement.setAttribute("data-cryptostamping", theme);
  },[theme]);*/

  useEffect(() => {
        const queryInfo = {active: true, lastFocusedWindow: true};

        chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
            const url = tabs[0].url;
            setUrl(url);
            console.log(url);
        });
  }, []);

  const BASE_URL = FRONTEND_BASE_URL;



  return (
    <div className={`${styles.back} cryptostamping-wrapper`} data-theme={theme}>
      <div className={styles.initial_lay}>
      </div>
    </div>
  );
}

export default Layout;
