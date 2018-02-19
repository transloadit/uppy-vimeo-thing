const css = require('sheetify')
const Uppy = require('uppy/lib/core')
const Tus = require('uppy/lib/plugins/Tus')
const Dashboard = require('uppy/lib/plugins/Dashboard')
const Webcam = require('uppy/lib/plugins/Webcam')
const Instagram = require('uppy/lib/plugins/Instagram')
const Vimeo = require('./Vimeo')

css('uppy/dist/uppy.css')

if (typeof window !== 'undefined') {
  const uppy = Uppy({ autoProceed: false })

  uppy.use(Tus)
  uppy.use(Dashboard, {
    target: '#dashboard',
    inline: true,
    metaFields: [
      { id: 'description', name: 'Description', placeholder: 'My cool video' }
    ]
  })
  .use(Instagram, { target: Dashboard, host: 'https://api2.transloadit.com/uppy-server' })
  .use(Webcam, { target: Dashboard })

  setClientID(localStorage.vimeoClientId || 'a7c30cc8ece39349ea055bf61bd51426fe2c50ef')

  uppy.run()

  const clientIdInput = document.querySelector('#vimeoClientId')
  clientIdInput.value = localStorage.vimeoClientId
  clientIdInput.addEventListener('blur', (event) => {
    if (event.target.value) {
      setClientID(event.target.value)
    }
  }, false)

  window.uppy = uppy

  function setClientID (clientID) {
    localStorage.vimeoClientId = clientID
    const vimeoPlugin = uppy.getPlugin('Vimeo')
    if (vimeoPlugin) uppy.removePlugin(vimeoPlugin)
    uppy.use(Vimeo, {
      clientID,
      redirectUrl: `${location.origin}/redirect.html`
    })
  }
}
