const bgp = chrome.extension.getBackgroundPage()
const optionsUrl = chrome.runtime.getURL('options.html')

const lang = {
  title: chrome.i18n.getMessage('enable_cross_origin_resource_sharing'),
  cors: chrome.i18n.getMessage('CORS'),
  list: chrome.i18n.getMessage('filter_list'),
  custom: chrome.i18n.getMessage('options'),
  more_details: chrome.i18n.getMessage('more_details')
}

const convert = str => {
  str = str.replace(/&/g, '&amp;')
  str = str.replace(/>/g, '&gt;')
  str = str.replace(/</g, '&lt;')
  str = str.replace(/"/g, '&quot;')
  str = str.replace(/'/g, '&#039;')
  return str
}

 // sync option page data
const syncOptions = () => {
  // TODO: refreash option page
  chrome.tabs.query({ url: optionsUrl }, tabs => {
    if (tabs.length === 1) {
      chrome.tabs.sendMessage(tabs[0].id, { onchange: 'weui-check' })
    }
  })
}

const eventHandler = () => {
  const bindEvents = () => {
    const $inputs = document.querySelectorAll('#filter_list .weui-check')

    document.getElementById('switch').addEventListener('change', function(event) {
      bgp.setConfig({ active: event.target.checked })
    })

    for (const input of $inputs) {
      input.addEventListener('click', function(event) {
        const id = parseInt(event.target.dataset['key'])
        bgp.getConfig('urls', ({urls}) => {
          urls = urls.map(url=>{
            if (url.id === id) {
              url.active = event.target.checked
            }
            return url
          })

          bgp.setConfig({ urls }, syncOptions)
        })
      })
    }

    document.getElementById('options').addEventListener('click', event => {
      event.preventDefault()

      chrome.tabs.query({ url: optionsUrl }, function(tabs) {
        // if option page is open, actcive option page
        if (tabs.length === 1) {
          if (!tabs[0].active) {
            chrome.tabs.update(tabs[0].id, { active: true })
          }
        } else {
          chrome.tabs.create({ url: optionsUrl })
        }
      })
    })
  }

  // init switch and filter list
  bgp.getConfig(['active', 'urls'], function(data) {
    // prevent list to long to display scroll bar
    if (data.urls.length > 8) {
      data.urls.length = 8
    }

    const urls = data.urls.map(item => {
      item.url = convert(item.url)
      item.description = convert(item.description)
      return item
    })

    let filterListHtml = tmpl('filter_list_template', { urls })
    // console.log('filterListHtml: ', filterListHtml)
    let containerHtml = tmpl('container_template', { data, lang, filterListHtml })
    // console.log('containerHtml: ', containerHtml)
    document.getElementById('container').innerHTML = containerHtml

    bindEvents()

    // set active icon
    bgp.setIcon(data.active)

    // set switch status
    // document.getElementById('switch').setAttribute('checked', data.active)
  })
}

document.addEventListener('DOMContentLoaded', eventHandler)
