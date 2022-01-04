/* global chrome */
import { ChromeMessage, Sender } from "../types";

const messagesFromReactAppListener = (message, sender, response) => {
    console.log('[content.js]. Message received', {
        message,
        sender,
    })

    if (
        sender.id === chrome.runtime.id &&
        message.from === Sender.React &&
        message.message === 'Hello from React') {
        response('Hello from content.js');
    }

    if (
        sender.id === chrome.runtime.id &&
        message.from === Sender.React &&
        message.message === "delete logo") {

        const logo = document.getElementById('hplogo');
        logo.parentElement.removeChild(logo)
    }
}

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);

/*
<MoralisProvider
            appId={MOLARIS_APP_ID}
            serverUrl={MOLARIS_SERVER_URL}
          >
            <Provider store={store}>
              <CryptoStamper settings={{ view: view || "button" }} theme={theme} />
            </Provider>
          </MoralisProvider>
          */