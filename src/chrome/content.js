/* global chrome */
//import { ChromeMessage, Sender } from "../types";
import React from "react";
import ReactDOM from "react-dom";
import Plugin from "~/src/plugin";
import { CryptostampingProvider, EXT_LOGOS, EXT_LAYS } from "~/src/lib/plugin";
import "~/src/plugin.css";
import "~/src/styles/globals.scss";
import "~/src/styles/ui_lib/bootstrap-grid.css";

let externalExtension = false;
if (document.domain.indexOf("chrome-extension://") > -1) {
    externalExtension = true;
}

class cryptostamping extends CryptostampingProvider {
    constructor() {
        super();
        chrome.runtime.onMessage.addListener((message, sender, response) => {
            if (message.type === "provider_events") {
                this.emit(message.name, message.data);
            }
        });
    }

    selectedAddress = () => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { type: "ethereum", key: "get_address", from: "content" },
                (res) => {
                    if (res.error) reject(res.error);
                    else resolve(res.address);
                }
            );
        });
    };

    closeEmbed = () => {
        const app = document.getElementById("cryptostamping-root");
        app.style.display = "none";
        for (var i = 0; i < document.body.children.length; i++) {
            if (
                document.body.children[i].tagName === "SCRIPT" ||
                document.body.children[i].tagName === "NOSCRIPT"
            ) {
                continue;
            }
            document.body.children[i].style.position = "initial";
            break;
        }
        chrome.runtime.sendMessage({
            type: "ui",
            key: "close_embed",
            from: "content",
        });
    };

    isConnected = () => {
        return true;
    };

    close = () => {
        const app = document.getElementById("cryptostamping-root");
        app.style.display = "none";
    };

    ethereum = {
        connectWallet: (sign_message) => {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(
                    {
                        type: "ethereum",
                        key: "connect_wallet",
                        from: "content",
                        sign_message,
                    },
                    (res) => {
                        if (res.error) reject(res.error);
                        else resolve(res);
                    }
                );
            });
        },

        getAccounts: ({ requestPermission }) => {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(
                    {
                        type: "ethereum",
                        key: "get_accounts",
                        from: "content",
                        requestPermission,
                    },
                    (res) => {
                        if (res.error) reject(res.error);
                        else resolve(res);
                    }
                );
            });
        },

        signMessage: (message, callback) => {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(
                    {
                        type: "ethereum",
                        key: "sign_message",
                        from: "content",
                        message: message,
                    },
                    (res) => {
                        if (res.error) reject(res.error);
                        else resolve(res);
                    }
                );
            });
        },

        providerAddress: () => {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(
                    {
                        type: "ethereum",
                        key: "provider_address",
                        from: "content",
                    },
                    (res) => {
                        if (res.error) reject(res.error);
                        else resolve(res.address);
                    }
                );
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
}

const messagesFromReactAppListener = (message, sender, response) => {
    if (
        sender.id === chrome.runtime.id &&
        (message.from === "background" || message.from === "popup") &&
        message.message === "inject_stamping"
    ){
        window.cryptostamping = new cryptostamping();
    }
    if (
        sender.id === chrome.runtime.id &&
        (message.from === "background" || message.from === "popup") &&
        message.message === "embed_stamper"
    ) {
        var link = document.createElement("link");
        link.href =
            "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap";
        link.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(link);

        var csp = document.createElement("META");
        csp.httpEquiv = "Content-Security-Policy";
        csp.content =
            "font-src * 'unsafe-inline' data:; media-src * data: blob:; img-src * blob: data:;";
        document.getElementsByTagName("head")[0].appendChild(csp);

        const app =
            document.getElementById("cryptostamping-root") ||
            document.createElement("div");
        app.id = "cryptostamping-root";
        app.className = "extension_root";
        app.style.display = "block";
        window.cryptostamping = new cryptostamping();
        document.body.style.display = "block";
        for (var i = 0; i < document.body.children.length; i++) {
            if (
                document.body.children[i].tagName === "SCRIPT" ||
                document.body.children[i].tagName === "NOSCRIPT"
            ) {
                continue;
            }
            document.body.children[i].style.position = "relative";
            break;
        }
        //if (document.body.firstElementChild)
        //  document.body.firstElementChild.style.position = "relative";
        document.body.insertBefore(app, document.body.firstChild);

        ReactDOM.render(<Plugin view={"plugin"} theme={"light"} />, app);

        response({ loaded: true });
        return true;
    }
};
/*
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((msg) => {
        // Handle message however you want
        console.log(msg);
    });
});
*/

if (!externalExtension)
    chrome.runtime.onMessage.addListener(messagesFromReactAppListener);

/*

        for(const child of document.body.children){
            if(child.style?.position?.indexOf("relative") === -1){
                child.style.position = "relative";
                if(child.style.top)
                    child.style.top = `${parseInt(child.style.top,10)+200}px`
                else
                    child.style.top = '200px';
            }
        }
        */
