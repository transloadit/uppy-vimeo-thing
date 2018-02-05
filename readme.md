# uppy + vimeo

Using Tus to upload things to Vimeo.

[Vimeo.js](./Vimeo.js) contains the code for the Vimeo plugin. It handles authentication with Vimeo, creating the video, and then configures the Tus plugin in order to upload.

The client ID in [app.js](./app.js) is only allowed to upload to my (@goto-bus-stop) own account though, unfortunately!
When users are signed in, they are redirected to `redirect.html`, which sends the authentication data to the Vimeo plugin using localStorage events.

Clone, then `npm install` and run `npm run dev` to try.
