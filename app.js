const css = require('sheetify')
const Uppy = require('uppy/lib/core')
const Tus = require('uppy/lib/plugins/Tus')
const Dashboard = require('uppy/lib/plugins/Dashboard')
const Webcam = require('uppy/lib/plugins/Webcam')
const GoogleDrive = require('uppy/lib/plugins/GoogleDrive')
const Vimeo = require('./Vimeo')

css('uppy/dist/uppy.css')

if (typeof window !== 'undefined') {
  const uppy = Uppy({ 
    autoProceed: false,
    restrictions: {
      maxFileSize: 5000000000,
      maxNumberOfFiles: 3,
      minNumberOfFiles: 1,
      allowedFileTypes: ['video/*']
    }    
  })

  uppy.use(Tus)
  uppy.use(Dashboard, {
    target: '#vimeo-uploader',
    inline: true,
    note: 'Video only, 1–3 files, up to 5GB',
    metaFields: [
      { id: 'description', name: 'Description', placeholder: 'My cool video' },
      { id: 'privacy', name: 'Video privacy', placeholder: 'Who can see this video' }
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
  
  // Set privacy meta acording to <select id="vimeo-privacy"> element
  const privacySelect = document.getElementById('vimeo-privacy')
  uppy.setMeta({ privacy: privacySelect.value })
  privacySelect.addEventListener('change', (ev) => {
    console.log(ev.target.value)
    uppy.setMeta({ privacy: ev.target.value })
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
