var bgp = chrome.extension.getBackgroundPage();
var headers = [{
  id: 'allow_origin',
  title: 'Access-Control-Allow-Origin',
  placeholder: '<origin> | *',
  description: 'origin参数指定一个允许向该服务器提交请求的 URI.对于一个不带有 credentials 的请求,可以指定为\'*\',表示允许来自所有域的请求.'
}, {
  id: 'allow_headers',
  title: 'Access-Control-Allow-Headers',
  placeholder: '<field-name>[, <field-name>]*',
  description: '在响应预检请求的时候使用.用来指明在实际的请求中,可以使用哪些自定义 HTTP 请求头'
}, {
  id: 'expose_headers',
  title: 'Access-Control-Expose-Headers',
  placeholder: '',
  description: '设置浏览器允许访问的服务器的头信息的白名单'
}, {
  id: 'allow_credentials',
  title: 'Access-Control-Allow-Credentials',
  placeholder: 'true | false',
  description: '告知客户端,当请求的 credientials 属性是  true 的时候,响应是否可以被得到.当它作为预请求的响应的一部分时,它用来告知实际的请求是否使用了 credentials. 注意,简单的GET请求不会预检,所以如果一个请求是为了得到一个带有 credentials的资源,而响应里又没有Access-Control-Allow-Credentials头信息,那么说明这个响应被忽略了.'
}, {
  id: 'max_age',
  title: 'Access-Control-Max-Age',
  placeholder: '<delta-seconds>',
  description: '这个头告诉我们这次预请求的结果的有效期是多久, delta-seconds 参数表示,允许这个预请求的参数缓存的秒数,在此期间,不用发出另一条预检请求. '
}, {
  id: 'allow_methods',
  title: 'Access-Control-Allow-Methods',
  placeholder: '<method>[, <method>]*',
  description: '指明资源可以被请求的方式有哪些(一个或者多个). 这个响应头信息在客户端发出预检请求的时候会被返回.'
}];

var getTimestamp = function() {
  return new Date().getTime();
};

$(function() {
  var $dialog = $('#dialog');
  var $list = $('#filter_list');

  // menu list
  $(".menu").on('click', 'a', function(e) {
    var selected = "selected";
    $(".mainview > *").removeClass(selected);

    $(".menu li").removeClass(selected);

    setTimeout(function() {
      $(".mainview > *:not(.selected)").css("display", "none")
    }, 100);

    $(e.currentTarget).parent().addClass(selected);

    var c = $($(e.currentTarget).attr("href"));

    c.css("display", "block");

    setTimeout(function() {
      c.addClass(selected)
    }, 0);

    setTimeout(function() {
      $("body").scrollTop = 0
    }, 200);
    return false;
  });

  // dialog
  var showDialog = function(type, data) {
    var _html = "";
    switch (type) {
      case 'delete':
        _html = template('delete_template', data);
        break;
      case 'add':
        _html = template('add_edit_template', data);
        break;
      case 'edit':
        _html = template('add_edit_template', data);
        break;
    }
    $('.page', $dialog).html(_html);
    $dialog.removeClass('transparent');
    if ($dialog.find('input')[0]) {
      $dialog.find('input')[0].focus();
    } else {
      $dialog.find('button')[0].focus();
    }
  };

  var hideDialog = function() {
    $dialog.addClass('transparent');
    setTimeout(function() {
      $('.page', $dialog).empty();
    }, 300);
  };

  var storageHeaderValue = function(id, type, value) {
    headerData[id][type] = value;
    bgp.setConfig({ "headers": headerData }, initResponseHeaders);
  };

  var storageUrlData = function(urls) {
    // storage url list data
    // after saving rander filter list
    bgp.setConfig({ "urls": urls }, initFilterList);
  };

  var getDataByType = function(type, callback) {
    bgp.getConfig(type, function(data) {
      callback(data);
    });
  };

  // Url List
  var getUrlIndexById = function(urls, id) {
    var index = -1;
    $.each(urls, function(i, value) {
      if (value.id === id) {
        index = i;
        return false;
      }
    })
    return index;
  };

  var deleteUrlById = function(id) {
    bgp.getConfig('urls', function(data) {
      var _urls = [];
      _urls = _urls.concat(data.urls);
      var _index = getUrlIndexById(data.urls, id);
      if (_index > 0) {
        _urls.splice(_index, 1);
        storageUrlData(_urls);
      }
    });
  };

  var saveUrl = function(newValue) {
    bgp.getConfig('urls', function(data) {
      var _urls = [];
      if ('id' in newValue) {
        // edit
        var _index = getUrlIndexById(data.urls, newValue.id);
        var _obj = $.extend(data.urls[_index], newValue);
        _urls = _urls.concat(data.urls);
        _obj.last_modify = getTimestamp();
        _urls[_index] = _obj;
      } else {
        // add
        var _obj = $.extend({}, newValue);
        _urls = _urls.concat(data.urls);
        _obj.last_modify = getTimestamp();
        _obj.id = data.urls.slice(-1).pop().id + 1;
        _urls.push(_obj);
      }
      storageUrlData(_urls);
    });
  };

  // init
  var init = function() {
    initDialog();

    initResponseHeaders();

    initFilterList();

    bindEvents();
  };

  var initDialog = function() {
    $dialog.on('click', '.save-edit', function() {
      var $url_pattern = $('#url_pattern'),
        _pattern = $url_pattern.val().trim();
      if (_pattern) {
        var _urlObj = {
          id: $(this).data('id'),
          active: $('#url_active').prop('checked'),
          url: _pattern,
          description: $('#url_description').val(),
        }
        saveUrl(_urlObj);

        hideDialog();
      } else {
        $url_pattern.focus();
      }
      return false;
    });

    $dialog.on('click', '.save-add', function() {
      var $url_pattern = $('#url_pattern'),
        _pattern = $url_pattern.val().trim();
      if (_pattern) {
        var _urlObj = {
          active: $('#url_active').prop('checked'),
          url: _pattern,
          description: $('#url_description').val(),
        }
        saveUrl(_urlObj);
        hideDialog();
      } else {
        $url_pattern.focus();
      }
      return false;
    });

    $dialog.on('click', '.confirm-delete', function() {
      // delete id
      deleteUrlById(parseInt($(this).data('id')));
      hideDialog();
      return false;
    });

    $dialog.on('click', '.cancel, .close-button', function() {
      hideDialog();
      return false;
    });

    $dialog.on('click', function(e) {
      if (e.target.id === 'dialog') {
        var $page = $('.page', $dialog);
        $page.addClass('pulse');
        setTimeout(function() {
          $page.removeClass('pulse');
        }, 200);
      }
    });
  };

  var initFilterList = function() {
    getDataByType('urls', function(data) {
      var _listHtml = template('filter_list_template', data);
      $list.html(_listHtml);
      // var lastUrl = data.urls.slice(-1).pop();
    });
  };

  var headerData;

  var initResponseHeaders = function() {
    getDataByType('headers', function(data) {
      headerData = data.headers;

      $.each(headers, function(index, header) {
        $.each(headerData, function(i, v) {
          if (i === header.id) {
            $.extend(header, v);
            return false;
          }
        });
      });

      // render response header
      var _html = template('response_headers_template', { headers: headers });
      $('#response_headers .content').html(_html);
    });
  };

  var bindEvents = function() {
    // filter list events
    $list.on('click', '.del', function() {
      showDialog('delete', { type: 'delete', id: $(this).data('id') });
      return false;
    });

    $list.on('click', '.edit', function() {
      showDialog('edit', {
        type: 'edit',
        title: "编辑",
        id: $(this).data('id'),
        active: $(this).data('active'),
        pattern: $(this).data('pattern'),
        description: $(this).data('description')
      });
      return false;
    });

    $('#add_url').on('click', function() {
      showDialog('add', { type: 'add', title: "新增Url" });
      return false;
    });

    $list.on('change', 'input[type=checkbox]', function(e) {
      var _id = parseInt($(this).prop('id').replace('url_', ''));
      var _status = $(this).prop('checked');
      bgp.getConfig('urls', function(data) {
        var _index = getUrlIndexById(data.urls, _id);
        if (_index !== -1) {
          data.urls[_index].active = _status;
          data.urls[_index].last_modify = getTimestamp();
          storageUrlData(data.urls);
        }
      });
    });

    // response headers
    $('#response_headers').on('change', 'input[type=checkbox]', function(e) {
      var id = e.target.id.replace('enable_access_control_', '');
      storageHeaderValue(id, 'active', $(this).prop('checked'));
    });

    $('#response_headers').on('keypress', 'input[type=text]', function(e) {
      if (e.keyCode === 13) {
        var id = e.target.id.replace('access_control_', '');
        storageHeaderValue(id, 'value', $(this).val());
      }
    }).on('blur', 'input[type=text]', initResponseHeaders);

    $dialog.on('keypress', 'input[type=text]', function(e) {
      if (e.keyCode === 13) {
        $($('button', $dialog)[0]).click();
      }
    });
  };

  init();

  // i18n

  // sync
  chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
      if (request.onchange == "weui_check") {
        initFilterList();
      }
    });
});
