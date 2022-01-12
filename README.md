# Cryptostamping Extension


`npm run build` will bild the unpacked extension for chrome.


## Cryptostamping | Extension for browser.





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

