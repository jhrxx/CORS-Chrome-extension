var bgp = chrome.extension.getBackgroundPage();

$(function() {
  // var on = chrome.i18n.getMessage("on");
  // var error = chrome.i18n.getMessage("error", ["code 1001."]);

  var $switch = $('#switch');

  // init switch and filter list
  bgp.getConfig(['active', 'urls'], function(data) {
    // console.log('gets settings: ', data);
    // set active icon
    var _icon = data.active ? 'on' : 'off';
    chrome.browserAction.setIcon({ path: _icon + ".png" });

    // set switch status
    $switch.prop('checked', data.active);

    html = template('filter_list_template', data);

    $('#filter_list').html(html);
  });

  // bind events
  $switch.on('change', function(e) {
    bgp.setConfig({ "active": e.target.checked });
  });

  $('#filter_list').on('change', '.weui_check', function(e) {
    var _target = e.target;
    bgp.getConfig("urls", function(data) {
      var _id = parseInt(_target.id.replace('fu_', ''));
      $.each(data.urls, function(i, v) {
        if (v.id === _id) {
          console.log(v);
          v.active = _target.checked;
          return false;
        }
      });
      bgp.setConfig({ "urls": data.urls });
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

});
