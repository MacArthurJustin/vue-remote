# vue-events

A websocket based remote event system for [Vue.js](http://vuejs.org).

Works with `Vue 2.0`.

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
        port: 8080
    }
)
```

or

```
window.Vue = require('vue');
const VueRemote = require('vue-events');

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

## License

[MIT](http://opensource.org/licenses/MIT)