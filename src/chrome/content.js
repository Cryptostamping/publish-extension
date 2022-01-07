/* global chrome */
//import { ChromeMessage, Sender } from "../types";
import React from "react";
import ReactDOM from "react-dom";
import Plugin from "~/src/plugin";
import {CryptostampingProvider} from  "~/src/lib/plugin";
import "~/src/styles/globals.scss";
import "~/src/styles/ui_lib/bootstrap-grid.css";

let externalExtension = false;
if (document.domain.indexOf("chrome-extension://") > -1) {
    externalExtension = true;
}

class cryptostamping extends CryptostampingProvider {

    constructor(){
        super();
        chrome.runtime.onMessage.addListener((message, sender, response) => {
             if (message.type === "provider_events") {
                this.emit(message.name, message.data)
            }
        });
    }

    selectedAddress = async () => {
        const {address} = await chrome.runtime.sendMessage(
                { type: "ethereum", key: "get_address", from: "content" });
        return address;
    };

    isConnected = () => {
        return true;
    }

    ethereum = {
        connectWallet: (callback) => {
            chrome.runtime.sendMessage(
                { type: "ethereum", key: "connect_wallet", from: "content" },
                callback
            );
        },

        getAccounts: (callback) => {
            chrome.runtime.sendMessage(
                { type: "ethereum", key: "get_accounts", from: "content" },
                callback
            );
        },

        signMessage: (message, callback) => {
            return new Promise((resolve, reject) => {chrome.runtime.sendMessage(
                { type: "ethereum", key: "sign_message", from: "content", message: message}, (res) => {
                    if(res.error)
                        reject(res.error);
                    else
                        resolve(res);
                })
            });
        },
    };

    /*let moralis = {
        current_user: () => {
            return new Promise((resolve, reject) => {chrome.runtime.sendMessage(
                { type: "moralis", key: "current_user", from: "content" }, (res) => {
                    if(res.error)
                        reject(res.error);
                    else
                        resolve(res);
                })
            });
        },
        query: (queryParams) => {
            return new Promise((resolve, reject) => {chrome.runtime.sendMessage(
                { type: "moralis", key: "query", from: "content", queryParams }, (res) => {
                    if(res.error)
                        reject(res.error);
                    else
                        resolve(res);
                })
            });
        },
    }
    */
};

const messagesFromReactAppListener = (message, sender, response) => {
    console.log(message, sender, response);

    if (
        sender.id === chrome.runtime.id &&
        message.from === "background" &&
        message.message === "embed_stamper"
    ) {
        const app =
            document.getElementById("cryptostamping-root") ||
            document.createElement("div");
        app.id = "cryptostamping-root";
        app.className = "extension_root";
        window.cryptostamping = new cryptostamping();
        document.body.style.display = "block";
        document.body.firstChild.style.position = "relative";
        document.body.insertBefore(app, document.body.firstChild);
        ReactDOM.render(<Plugin view={"button"} theme={"light"} />, app);
        response("loaded");
        return true;
    }
};

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((msg) => {
        // Handle message however you want
        console.log(msg);
    });
});

if(!externalExtension)
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
