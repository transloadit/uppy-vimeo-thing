const css = require('sheetify')
const Uppy = require('uppy/lib/core')
const Tus = require('uppy/lib/plugins/Tus')
const Dashboard = require('uppy/lib/plugins/Dashboard')
const Webcam = require('uppy/lib/plugins/Webcam')
const GoogleDrive = require('uppy/lib/plugins/GoogleDrive')
const Vimeo = require('./Vimeo')

css('uppy/dist/uppy.css')

if (typeof window !== 'undefined') {
  const uppy = Uppy({ autoProceed: false })

  uppy.use(Tus)
  uppy.use(Dashboard, {
    target: 'body',
    inline: true,
    metaFields: [
      { id: 'description', name: 'Description', placeholder: 'My cool video' }
    ]
  })
  .use(GoogleDrive, { target: Dashboard, host: 'https://server.uppy.io' })
  .use(Webcam, { target: Dashboard })

  setClientID(localStorage.vimeoClientId || 'a7c30cc8ece39349ea055bf61bd51426fe2c50ef')

  uppy.run()

  window.addEventListener('storage', (event) => {
    if (event.key === 'vimeoClientId') {
      setClientID(event.newValue)
    }
  })

  window.uppy = uppy

  function setClientID (clientID) {
    const vimeoPlugin = uppy.getPlugin('Vimeo')
    if (vimeoPlugin) uppy.removePlugin(vimeoPlugin)
    uppy.use(Vimeo, {
      clientID,
      redirectUrl: `${location.origin}/redirect.html`
    })
  }
}
