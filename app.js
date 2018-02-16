const css = require('sheetify')
const Uppy = require('uppy/lib/core') // require('uppy') or require('@uppy/core')
const Tus = require('uppy/lib/plugins/Tus') // require('@uppy/tus')
const Dashboard = require('uppy/lib/plugins/Dashboard') // require('@uppy/dashboard')
const Vimeo = require('./Vimeo')

css('uppy/dist/uppy.css')

if (typeof window !== 'undefined') {
  window.uppy = Uppy({ autoProceed: false })

  uppy.use(Tus)
  uppy.use(Vimeo, {
    clientID: 'a7c30cc8ece39349ea055bf61bd51426fe2c50ef',
    redirectUrl: `${location.origin}/redirect.html`
  })
  uppy.use(Dashboard, {
    target: '#dashboard',
    inline: true,
    metaFields: [
      { id: 'description', name: 'Description', placeholder: 'My cool video' }
    ]
  })

  uppy.run()
}
