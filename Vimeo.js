const Plugin = require('uppy/lib/core/Plugin')
const mapLimit = require('promise-map-limit')
const stringify = require('qs-stringify')
const delay = require('delay')
const API_ROOT = 'https://api.vimeo.com'

function whenWindowClosed (window) {
  return new Promise((resolve) => {
    function check () {
      if (window.closed) resolve()
      else setTimeout(check, 50)
    }
    check()
  })
}

class Vimeo extends Plugin {
  constructor (uppy, opts) {
    super(uppy, opts)

    this.name = 'Vimeo'
    this.id = 'Vimeo'
    this.type = 'uploader'

    this.authorization = null

    this.opts = Object.assign({
      limit: 100
    }, this.opts)

    this.prepareUpload = this.prepareUpload.bind(this)
    this.afterUpload = this.afterUpload.bind(this)
  }

  async authorize () {
    const self = this
    const { clientID, redirectUrl } = this.opts
    if (this.authorization && this.authorization.expiration < Date.now()) {
      return this.authorization
    }

    return new Promise((resolve, reject) => {
      const localStorageKey = 'uppyVimeo' + Math.random().toString(32).slice(2)

      const query = stringify({
        client_id: clientID,
        response_type: 'token',
        redirect_uri: redirectUrl,
        state: localStorageKey,
        scope: [
          'upload',
          'edit'
        ].join(' ')
      })

      window.addEventListener('storage', onstorage)
      const vimeoWindow = window.open(`${API_ROOT}/oauth/authorize?${query}`)

      whenWindowClosed(vimeoWindow)
        .then(() => delay(2000))
        .then(() => reject(new Error('Vimeo: Login closed without getting upload permissions.')))

      function onstorage (event) {
        if (event.key === localStorageKey) {
          window.removeEventListener('storage', onstorage)
          delete localStorage[localStorageKey]

          const result = JSON.parse(event.newValue)
          ontoken(result)
        }
      }

      function ontoken ({ token, scopes, expires }) {
        if (!scopes.includes('upload')) {
          return reject(new Error('Vimeo: Did not get upload permissions.'))
        }

        self.authorization = {
          accessToken: token,
          expiration: Date.now() + expires * 1000
        }
        resolve(self.authorization)
      }
    })
  }

  async prepareUpload (fileIDs) {
    const { accessToken } = await this.authorize()

    fileIDs.forEach((fileID) => {
      this.uppy.emit('preprocess-progress', fileID, {
        mode: 'indeterminate',
        message: 'Creating videos...'
      })
    })

    await mapLimit(fileIDs, this.opts.limit, async (fileID) => {
      const file = this.uppy.getFile(fileID)

      const response = await fetch(`${API_ROOT}/me/videos`, {
        method: 'post',
        headers: {
          'authorization': `Bearer ${accessToken}`,
          'content-type': 'application/json',
          'accept': 'application/vnd.vimeo.*+json;version=3.4'
        },
        body: JSON.stringify({
          upload: {
            approach: 'tus',
            size: file.size
          },

          name: file.meta.name.replace(/\.\w+$/, ''),
          description: file.meta.description,
          privacy: {
            view: 'nobody'
          }
        })
      })

      const { upload, link, uri } = await response.json()
      this.uppy.setFileState(fileID, {
        uploadURL: link,
        vimeo: {
          link,
          id: uri.split('/').pop()
        },
        tus: Object.assign({}, file.tus, {
          endpoint: 'https://files.tus.vimeo.com/files/', // HACK this is to appease tus-js-client
          // NOTE: This is uploadUrl instead of endpoint, different from what you might expect;
          // Vimeo pre-creates the Tus upload.
          uploadUrl: upload.upload_link
        })
      })

      this.uppy.emit('preprocess-complete', fileID)
    })
  }

  async afterUpload (fileIDs) {
    const { accessToken } = this.authorization

    fileIDs.forEach((fileID) => {
      const file = this.uppy.getFile(fileID)
      const video = file.vimeo

      this.uppy.setFileState(fileID, {
        uploadURL: video.link
      })
    })
  }

  install () {
    this.uppy.addPreProcessor(this.prepareUpload)
    this.uppy.addPostProcessor(this.afterUpload)
  }

  uninstall () {
    this.uppy.removePreProcessor(this.prepareUpload)
    this.uppy.removePostProcessor(this.afterUpload)
  }
}

module.exports = Vimeo
