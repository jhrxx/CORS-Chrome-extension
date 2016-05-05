/*On install*/
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({
    "active": false,
    "urls": [{
      "id": 0,
      "active": true,
      "url": "<all_urls>",
      "description": "匹配所有链接",
      "last_modify": getTimestamp()
    }],
    "headers": {
      allow_origin: {active:true,value:'*'},
      allow_headers: {active:false,value:''},
      expose_headers: {active:false,value:''},
      allow_credentials: {active:false,value:''},
      max_age: {active:false,value:''},
      allow_methods: {active:true,value:"GET, PUT, POST"}
    }
  });
});

var getTimestamp = function(){
  return new Date().getTime();
};

function getConfig(keys, callback) {
  chrome.storage.local.get(keys, callback);
}

function setConfig(value, callback) {
  if(typeof callback !== 'function') {
    callback = function(){};
  }

  // Save it using the Chrome extension storage API.
  chrome.storage.local.set(value, function() {
    // Notify that we saved.
    console.log('Settings saved');

    if('active' in value) {
      var _icon = value.active ? 'on' : 'off';
      chrome.browserAction.setIcon({ path: _icon + ".png" });
    }

    reloadSettings();

    callback();
  });
}

function headersReceivedListener (details) {
  for(item in headersCfg) {
    if(headersCfg[item].active) {
      details.responseHeaders.push({name: headers[item], value: headersCfg[item].value});
    }
  }

  return { responseHeaders: details.responseHeaders };
};

var headers = {
  allow_origin: 'Access-Control-Allow-Origin',
  allow_headers: 'Access-Control-Allow-Headers',
  expose_headers: 'Access-Control-Expose-Headers',
  allow_credentials: 'Access-Control-Allow-Credentials',
  max_age: 'Access-Control-Max-Age',
  allow_methods: 'Access-Control-Allow-Methods'
};

var headersCfg;

/*Reload settings*/
function reloadSettings() {
  getConfig(['active', 'urls', 'headers'], function(data) {
    headersCfg = data.headers;

    var _urls = [];

    for (var i = data.urls.length - 1; i >= 0; i--) {
      if(data.urls[i].active) {
        _urls.push(data.urls[i].url);
      }
    };

    /*Remove Listeners*/
    /*
     * onHeadersReceived (optionally synchronous)
     * Fires each time that an HTTP(S) response header is received.
     * Due to redirects and authentication requests this can happen multiple times per request.
     * This event is intended to allow extensions to add, modify, and delete response headers,
     * such as incoming Set-Cookie headers.
     * The caching directives are processed before this event is triggered,
     * so modifying headers such as Cache-Control has no influence on the browser's cache.
     * It also allows you to redirect the request.
     */
    chrome.webRequest.onHeadersReceived.removeListener(headersReceivedListener);

    if(data.active) {
      console.log('urls', _urls);
      chrome.webRequest.onHeadersReceived.addListener(headersReceivedListener, {
        urls: _urls
      },["blocking", "responseHeaders"]);
    }
  });
};
