# webcg-framework

webcg-framework is a framework to create and develop HTML templates for CasparCG and WebCG. The framework provides an API to listen for AMCP commands, automatically parses the XML or JSON data to a JavaScript object, and provides a lazy-load injection for the [webcg-devtools](https://github.com/indr/webcg-devtools).

Running examples can be found at http://indr.github.io/webcg-framework/ and https://indr.github.io/webcg-adobe-animate-adapter/.

## Installation

Download the [latest release](https://github.com/indr/webcg-framework/releases) and extract and copy the files in the same folder as your HTML template. Add a script reference  `webcg-framework.umd.js` in your HTML file like:

`<script src="webcg-framework.umd.js"></script>`

You must not add a reference to `webcg-devtools.umd.js`. If you open your template in a browser and add `?debug=true` to bring up the DevTools, the framework will lazyingly load `webcg-devtools.umd.js` from the same directory.

## API

Have a look at the example [lower-third](https://github.com/indr/webcg-framework/blob/master/docs/lower-third-css-animations.html) template to see how to use the API. A live version of this template can be found at https://indr.github.io/webcg-framework/lower-third-css-animations.html?debug=true.

### Methods

The webcg-framework exposes a global object `webcg` with these methods:

#### addEventListener(type, listener)  

Register an event handler to a specific event type and/or AMCP command.

`type`: A case-sensitive string representing the event type, AMCP command and/or invoked function to listen for. For example `play`, `stop`, `update`, `data`, `myfunc1`.
  
`listener`: The JavaScript function that receives a notification when an event of the specified type occurs.

#### removeEventListener(type, listener)

Removes an event listener.

#### on(type, listener)

Alias for `addEventListener()`
  
#### off(type, listener)

Alias for `removeEventListener()`

### Events

| Type | Description |
| ---- | ----------- |
| `play` | Fired when the template should play the intro animations and become visible. |
| `stop` | Fired when the template should play the outro animations and become invisible. |
| `next` | Fired when the template should move the the next step in a multi step template. |
| `update` | Fired when the template receives raw data. |
| `data` | Fired after `update` with the raw data parsed as a JSON object. Handles component XML data, JSON strings and JavaScript objects. |

## Contributing

`npm run build` builds the library to `dist`.  
`npm run dev` builds the library, then keeps rebuilding it whenever the source files change.  
`npm run test` run the unit tests in watch mode.  
`npm run demo` starts a demo at localhost:8080.

## Copyright and License

Copyright (c) 2018 Reto Inderbitzin, [MIT License](LICENSE)
