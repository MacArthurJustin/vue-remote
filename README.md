# vue-remote

A websocket based remote event system for [Vue.js](http://vuejs.org).

Works with `Vue 2.0`, untested with `Vue 1.0`.

## Installation

##### 1.) Install package via NPM
```
npm install vue-remote
```


##### 2.) Activate plugin within project.
```
import Vue from 'vue';
import VueRemote from 'vue-remote';

Vue.use(
    VueRemote,
    {
        secure: false,
        host: "localhost",
        port: 8080,
        identifier: 'identifier'
    }
)
```

or

```
window.Vue = require('vue');
const VueRemote = require('vue-remote');

Vue.use(
    VueRemote,
    {
        secure: false,
        host: "localhost",
        port: 8080
    }
)
```

## Usage

#### The `Vue.Remote` global object.
This plugin provides a direct interface into the websocket client using `attach`, `detach`, and `emit` functions.

#### The `$remote` prototype object.
This plugin provides a `vm.$remote` object with functionally based on Vue's event system with `$on`, `$once`, `$off`, and `$emit`.

---

A Note on `$emit` and `emit` functions, unlike the normal event system these calls send the information through the client and the server triggers the callback.

---

#### The `remote` component object
This plugin provides a mixin object `remote` which simplifies the attachment of server events.

#### Firing an event
There are 2 methods that fire events. They're functionally identical and only differ in name.
```
...
    this.$remote.$emit('trigger', ...Arguments)

    Vue.Remote.emit('trigger', ...Arguments)
...
```

The structure used by `vue-remote` is as follows
```
// One Argument
// Vue.Remote.emit('trigger', 5)
{
    "identifier": 'trigger',
    "arguments": 5
}

// One Argument which is an object
// Vue.Remote.emit('trigger', { 'data': 5, 'id': 10 })
{
    "identifier": 'trigger',
    "data": 5,
    "id": 10
}

// Two or more Arguments
// Vue.Remote.emit('trigger', 5, 10, 15)
{
    "identifier": 'trigger',
    "arguments": [
        5,
        10,
        15
    ]
}

```

#### Listening for an event
There are 3 methods that register event listeners. They're functionally identical and only differ in name.
```
...
    this.$remote.$on('trigger', function(data) {})
    
    Vue.Remote.attach('trigger', function(data) {}, thisArg)
    
    new Vue({
        remote: {
            trigger: function(data) {
                ...
            }
        }
    })
...
```

The structure expected by the client is as follows.
```
{
    "identifier": <identifier>,
    "data": <value to send into the function handler>
}

// example
{
    "identifier": 'trigger',
    "data": {
        "id": 10,
        "foo": "bar"
    }
}
```

## server
vue-remote comes with a basic websocket server script based on the [Websocket](https://www.npmjs.com/package/websocket) node package.

#### Usage
```
// testServer.js

const Server = require('vue-remote/server');

function messageHandler(message) {
    // message = {
    //    identifier: "trigger",
    //    arguments: [...]
    // }

    ... Handle Message object

    return {
        identifier: "trigger",
        data: "Handled Message"
    };
}

let socketServer = Server( messageHandler, [options]);
```

use `node testServer.js` to run the server.

## Example

[Vue-remote-chat](https://github.com/MacArthurJustin/vue-remote-chat) is a quick chat example of the system in action.

## License

[MIT](http://opensource.org/licenses/MIT)
