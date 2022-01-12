/* global chrome */
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactDOM from "react-dom";

import Frame, { FrameContextConsumer } from "react-frame-component";

import { MoralisProvider } from "react-moralis";
import { Provider } from "react-redux";

import CryptoStamper from "~/src/components/cryptostamper/main";
import { MOLARIS_APP_ID, MOLARIS_SERVER_URL } from "~/src/lib/data";

import * as styles from "~/src/styles/pages/home.module.scss";

import store from "~/src/lib/redux/store";

function Plugin({ provider, view, theme }) {
  const initialContent = `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="font-src * 'unsafe-inline' data:; media-src * data: blob:; img-src * blob: data:;"></head><body><div id="mountHere"></div></body></html>`;
  return (
    <div
      className={`${styles.container} cryptostamping-wrapper`}
      data-theme={theme || "light"}
    >
      <div className={styles.screen_one}>
        <MoralisProvider appId={MOLARIS_APP_ID} serverUrl={MOLARIS_SERVER_URL}>
          <Provider store={store}>
            <CryptoStamper
              provider={provider}
              settings={{ view: "plugin" }}
              theme={theme || "light"}
            />
          </Provider>
        </MoralisProvider>
      </div>
    </div>
  );
}

export default Plugin;

/*
<Frame
      initialContent={initialContent}
      head={[
        <link
          type="text/css"
          rel="stylesheet"
          href={chrome.runtime.getURL("/static/css/content.css")}
        ></link>,
      ]}
    >
      <FrameContextConsumer>
        {({ document, window }) => {
          return (

           );
        }}
      </FrameContextConsumer>
    </Frame>
*/
