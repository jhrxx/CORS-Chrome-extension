// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];
    console.log(tabs)

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // console.log('chrome-extension://__MSG_@@extension_id__/background.png')

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    // console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

var bgp = chrome.extension.getBackgroundPage();
console.log('BackgroundPage: ', bgp)

$(function() {
  getCurrentTabUrl(function(url) {
    console.log('CurrentTabUrl:', url)
  });

  var $switch = $('#switch');

  bgp.getConfig('active', function(data) {
    console.log('gets settings: ', data);
    var _icon = data.active?'on':'off';
    chrome.browserAction.setIcon({ path: _icon + ".png" });

    $switch.prop('checked', data.active);
  });

  $switch.on('change', function(e) {
    bgp.setConfig({ "active": e.target.checked}, function() {
      console.log('set active as', e.target.checked);
    //   /*Remove Listeners*/
    //   // chrome.webRequest.onHeadersReceived.removeListener(responseListener);
    //   // chrome.webRequest.onBeforeSendHeaders.removeListener(requestListener);
    });
  });
})