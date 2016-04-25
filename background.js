var accessControlRequestHeaders;
var exposedHeaders;

var requestListener = function(details) {
  var flag = false,
    rule = {
      name: "Origin",
      value: "http://evil.com/"
    };
  var i;

  for (i = 0; i < details.requestHeaders.length; ++i) {
    if (details.requestHeaders[i].name.toLowerCase() === rule.name.toLowerCase()) {
      flag = true;
      details.requestHeaders[i].value = rule.value;
      break;
    }
  }
  if (!flag) details.requestHeaders.push(rule);

  for (i = 0; i < details.requestHeaders.length; ++i) {
    if (details.requestHeaders[i].name.toLowerCase() === "access-control-request-headers") {
      accessControlRequestHeaders = details.requestHeaders[i].value
    }
  }

  return { requestHeaders: details.requestHeaders };
};

var responseListener = function(details) {
  var flag = false,
    rule = {
      "name": "Access-Control-Allow-Origin",
      "value": "*"
    };

  for (var i = 0; i < details.responseHeaders.length; ++i) {
    if (details.responseHeaders[i].name.toLowerCase() === rule.name.toLowerCase()) {
      flag = true;
      details.responseHeaders[i].value = rule.value;
      break;
    }
  }
  if (!flag) details.responseHeaders.push(rule);

  if (accessControlRequestHeaders) {

    details.responseHeaders.push({ "name": "Access-Control-Allow-Headers", "value": accessControlRequestHeaders });

  }

  if (exposedHeaders) {
    details.responseHeaders.push({ "name": "Access-Control-Expose-Headers", "value": exposedHeaders });
  }

  details.responseHeaders.push({ "name": "Access-Control-Allow-Methods", "value": "GET, PUT, POST, DELETE, HEAD, OPTIONS" });

  return { responseHeaders: details.responseHeaders };

};

/*On install*/
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({ "active": false, "urls": ["<all_urls>"], "exposedHeaders": "" });
});



/*Reload settings*/
function reload() {
  chrome.storage.local.get({ 'active': false, 'urls': ["<all_urls>"], 'exposedHeaders': '' }, function(result) {

    exposedHeaders = result.exposedHeaders;

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
    chrome.webRequest.onHeadersReceived.removeListener(responseListener);
    /*
     * onBeforeSendHeaders (optionally synchronous)
     * Fires when a request is about to occur and the initial headers have been prepared.
     * The event is intended to allow extensions to add, modify, and delete request headers (*).
     * The onBeforeSendHeaders event is passed to all subscribers,
     * so different subscribers may attempt to modify the request;
     * see the Implementation details section for how this is handled.
     * This event can be used to cancel the request.
     */
    chrome.webRequest.onBeforeSendHeaders.removeListener(requestListener);

    if (result.active) {
      chrome.browserAction.setIcon({ path: "on.png" });

      if (result.urls.length) {

        /*Add Listeners*/
        chrome.webRequest.onHeadersReceived.addListener(responseListener, {
          urls: result.urls
        }, ["blocking", "responseHeaders"]);

        chrome.webRequest.onBeforeSendHeaders.addListener(requestListener, {
          urls: result.urls
        }, ["blocking", "requestHeaders"]);
      }
    } else {
      chrome.browserAction.setIcon({ path: "off.png" });
    }
  });
}


function getConfig(keys, callback) {
  chrome.storage.local.get(keys, callback);
}

function setConfig(value, callback) {
  // Save it using the Chrome extension storage API.
  chrome.storage.local.set(value, function() {
    // Notify that we saved.
    console.log('Settings saved');

    var _icon = value.active ? 'on' : 'off';
    chrome.browserAction.setIcon({ path: _icon + ".png" });

    reloadSettings();

    callback();
  });
}

var onHeadersReceived = function(details) {
  var flag = false,
    rule = {
      "name": "Access-Control-Allow-Origin",
      "value": "*"
    };

  for (var i = 0; i < details.responseHeaders.length; ++i) {
    if (details.responseHeaders[i].name.toLowerCase() === rule.name.toLowerCase()) {
      flag = true;
      details.responseHeaders[i].value = rule.value;
      break;
    }
  }
  if (!flag) details.responseHeaders.push(rule);

  if (accessControlRequestHeaders) {

    details.responseHeaders.push({ "name": "Access-Control-Allow-Headers", "value": accessControlRequestHeaders });

  }

  if (exposedHeaders) {
    details.responseHeaders.push({ "name": "Access-Control-Expose-Headers", "value": exposedHeaders });
  }

  details.responseHeaders.push({ "name": "Access-Control-Allow-Methods", "value": "GET, PUT, POST, DELETE, HEAD, OPTIONS" });

  return { responseHeaders: details.responseHeaders };
}



function reloadSettings() {
  getConfig(['active', 'urls'], function(data) {

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
    chrome.webRequest.onHeadersReceived.removeListener(responseListener);

    /*
     * onBeforeSendHeaders (optionally synchronous)
     * Fires when a request is about to occur and the initial headers have been prepared.
     * The event is intended to allow extensions to add, modify, and delete request headers (*).
     * The onBeforeSendHeaders event is passed to all subscribers,
     * so different subscribers may attempt to modify the request;
     * see the Implementation details section for how this is handled.
     * This event can be used to cancel the request.
     */
    chrome.webRequest.onBeforeSendHeaders.removeListener(requestListener);

    // if(data.active) {
    //   chrome.browserAction.setIcon({ path: "on.png" });
    // } else {
    //   chrome.browserAction.setIcon({ path: "off.png" });
    // }

    // chrome.browserAction.setIcon({ path: "off.png" });

  });


}

// chrome.storage.local.clear();
