# webcg-framework

## API

### Methods

#### addEventListener(type, listener)  

Register an event handler to a specific event type and/or AMCP command.

`type`: A case-sensitive string representing the event type, AMCP command and/or invoked function to listen for. For example `play`, `stop`, `update`, `data`, `myfunc1`.
  
`listener`: The JavaScript function that receives a notification (an object that implements the [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) interface) when an event of the specified type occurs.

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
| `data` | Fired after `update` with the raw data parsed as a JSON object. |

## Contributing

`npm run build` builds the library to `dist`.  
`npm run dev` builds the library, then keeps rebuilding it whenever the source files change.  
`npm run test` run the unit tests in watch mode.  
`npm run demo` starts a demo at localhost:8080.

## Copyright and License

Copyright (c) 2018 Reto Inderbitzin, [MIT License](LICENSE)
