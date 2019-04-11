$(function() {
  var bgp = chrome.extension.getBackgroundPage();

  // init switch and filter list
  bgp.getConfig(['active', 'urls'], function(data) {
    // prevent list to lang to display scroll bar
    if (data.urls.length > 8) {
      data.urls.length = 8;
    }
    var lang = {
      title: chrome.i18n.getMessage("enable_cross_origin_resource_sharing"),
      cors: chrome.i18n.getMessage("CORS"),
      list: chrome.i18n.getMessage("filter_list"),
      custom: chrome.i18n.getMessage("options"),
      add_more: chrome.i18n.getMessage("add_more")
    }

    var containerHtml = template('container_template', lang);

    $('#container').html(containerHtml);

    // var filterListHtml = template('filter__template', data);
    var filterListHtml = template('filter_list_template',{urls:data.urls});

    $('#filter_list').html(filterListHtml);

    var $switch = $('#switch');

    bindEvents($switch);

    // set active icon
    var _icon = data.active ? 'on' : 'off';
    chrome.browserAction.setIcon({ path: _icon + ".png" });

    // set switch status
    $switch.prop('checked', data.active);
  });

  var bindEvents = function($switch) {
    $switch.on('change', function(e) {
      bgp.setConfig({ "active": e.target.checked });
    });

    $('#filter_list').on('change', '.weui-check', function(e) {
      var _target = e.target;
      bgp.getConfig("urls", function(data) {
        var _id = parseInt(_target.id.replace('fu_', ''));
        $.each(data.urls, function(i, v) {
          if (v.id === _id) {
            v.active = _target.checked;
            return false;
          }
        });
        bgp.setConfig({ "urls": data.urls });
        // TODO  refreash option page
        sync();
      });
    });

    $('#options').click(function() {
      var optionsUrl = chrome.extension.getURL('options.html');

      chrome.tabs.query({ url: optionsUrl }, function(tabs) {
        // if option page is open, actcive option page
        if (tabs.length === 1) {
          if (!tabs[0].active) {
            chrome.tabs.update(tabs[0].id, { active: true });
          }
        } else {
          chrome.tabs.create({ url: optionsUrl });
        }
      });
      return false;
    });
  };

  // sync option page data
  var sync = function() {
    var optionsUrl = chrome.extension.getURL('options.html');
    chrome.tabs.query({ url: optionsUrl }, function(tabs) {
      if (tabs.length === 1) {
        chrome.tabs.sendRequest(tabs[0].id, { onchange: "weui-check" });
      }
    });
  };
});
