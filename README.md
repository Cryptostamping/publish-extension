# Cryptostamping Extension

`npm run build` will bild the unpacked extension for chrome.


## Cryptostamping | Extension for browser.

With the extension, users will be enabled to stamp their NFTs/Stamps on any webpages they visit. The extension is scope limited to only sign requests so, there will be no transaction requests occurring at any point.


## injected module window.cryptostamping

A global module is injected to to all webpages via content script, that lets you sign requests via cryptostamping plugin.

```bash
windiw.cryptostamping.signMessage(message)
.then((response) => {
	console.log(response.signature);
	console.log("Signed from User Address - "+response.from);
})
```


### `to do`

- load images & media in blobs to bypass CSP.
- widget bar hidable by scroll up.
- Add firefox version.

