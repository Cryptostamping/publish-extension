const fs = require('fs');

const assets = JSON.parse(fs.readFileSync('build/asset-manifest.json', 'utf8'));
let manifest = JSON.parse(fs.readFileSync('build/manifest.json', 'utf8'));
//to="/widgets`+hashes.files['content.js']+`"
manifest.content_scripts[0].js = [];
manifest.content_scripts[0].js.push(assets.files['content.js']);
manifest.content_scripts[0].css = [];
manifest.content_scripts[0].css.push(assets.files['content.css']);
manifest.background.scripts = [];
manifest.background.scripts.push(assets.files['background.js']);
fs.writeFileSync('build/manifest.json', JSON.stringify(manifest));
//manifest.background.service_worker = assets.files['background.js'];

/*
"optional_permissions": [
    "*:// * / * "
  ],

      "all_frames": false,
      "run_at": "document_end"
      "background": {
    "service_worker": "chrome/background.js"
  }
  "web_accessible_resources":[
    {
      "resources": ["/static/css/*", "/static/js/*","/icons/*", "/logo_favicon.svg"],
      "matches": [],
      "extension_ids": ["nkbihfbeogaeaoehlefnkodbefgpgknn"]
    }
  ]
*/