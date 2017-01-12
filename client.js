/**
 * Installs the Vue-Remote Client
 * Vue Plugin to utilize the Authority server model
 * 
 * @module vue-remote/client
 * @author Justin MacArthur <macarthurjustin@gmail.com>
 * @version 1.0.0
 * 
 * @param {Object} Vue
 * @param {Object} [options]
 */
module.exports.install = function(Vue, options) {
    Vue.Remote = (function(options) {
        let Client = null,
            Handlers = Object.create(null),
            socketPump = [],
            pumpInterval = null;

        options = options || {};
        options.secure = options.secure || false;
        options.host = options.host || "localhost";
        options.port = options.port || 8080;

        /**
         * Connect to Websocket Server
         */
        function connect() {
            Client = new WebSocket((options.secure ? "wss://" : "ws://") + options.host + ":" + options.port, options.protocol);

            Client.onopen = openHandler;
            Client.onerror = errorHandler;
            Client.onmessage = messageHandler;
            Client.onclose = closeHandler;
        }

        /**
         * Handle Server Connection Event
         * 
         * @param {Event} open
         */
        function openHandler(open) {
            console.log("Connected to Web Server");
            console.log(open);

            if (options.openHandler) options.openHandler(open);
        }

        /**
         * Handle Server Errors
         * 
         * @param {Event} error
         */
        function errorHandler(error) {
            console.log("Error occured");
            console.log(error);

            if (options.errorHandler) options.errorHandler(error);
        }

        /**
         * Handle Messages Returned from the Server
         * 
         * @param {MessageEvent} message
         * @returns
         */
        function messageHandler(message) {
            let Json = JSON.parse(message.data),
                Events = Handlers[Json.identifier];

            if (Events) {
                Events.forEach(
                    (Event) => {
                        Event.callback.apply(Event.thisArg, [Json.data]);
                    }
                )
            }
        }

        /**
         * {EventListener} For When the Websocket Client Closes the Connection
         * 
         * @param {CloseEvent} close
         */
        function closeHandler(close) {
            if (options.closeHandler) options.closeHandler(close);

            if (pumpInterval) {
                window.clearInterval(pumpInterval);
                pumpInterval = null;
            }

            Client = null;
        }

        /**
         * Attaches Handlers to the Event Pump System
         * 
         * @param {Boolean} server      True/False whether the Server should process the trigger
         * @param {String} identifier   Unique Name of the trigger
         * @param {Function} callback   Function to be called when the trigger is tripped
         * @param {Object} [thisArg]    Arguement to be passed to the handler as `this`
         */
        function attachHandler(identifier, callback, thisArg) {
            !(Handlers[identifier] || (Handlers[identifier] = [])).push({
                callback: callback,
                thisArg: thisArg
            });
        }

        /**
         * Detaches Handlers from the Event Pump System
         * 
         * @param {String} identifier   Unique Name of the trigger
         * @param {Function} callback   Function to be called when the trigger is tripped
         */
        function detachHandler(identifier, callback) {
            if(arguments.length == 0) {
                Handlers = Object.create(null);
                return;
            }

            let Handler = Handlers[identifier];
            if(!Handler) return;

            if(arguments.length == 1) {
                Handlers[identifier] = null;
                return;
            }

            for(let index = Handler.length - 1; index >= 0 ; index--) {
                if(Handler[index].callback === callback || Handler[index].callback.fn === callback) {
                    Handler.splice(index, 1);
                }
            }
        }


        /**
         * Handles Event Triggers
         * 
         * @param {String} identifier
         * @returns
         */
        function emitHandler(identifier) {
            let args = arguments.length > 1 ? [].slice.apply(arguments, [1]) : [];

            socketPump.push(
                JSON.stringify({
                    'identifier': identifier,
                    'arguments': args
                })
            );
        }

        /**
         * Sends Messages to the Websocket Server every 250 ms
         * 
         * @returns
         */
        function pumpHandler() {
            if (socketPump.length == 0) return;
            if (!Client) connect();

            if (Client.readyState == WebSocket.OPEN) {
                socketPump.forEach(
                    (item) => {
                        Client.send(item);
                    }
                )

                socketPump.length = 0;
            }
        }


        if (!pumpInterval) {
            window.setInterval(pumpHandler, 250);
        }

        return {
            connect: connect,
            disconnect: () => {
                if (Client) {
                    Client.close();
                    Client = null;
                }
            },
            attach: attachHandler,
            detach: detachHandler,
            emit: emitHandler
        }
    })(options);

    Vue.mixin({
        created: function() {
            if (this.$options.remote) 
            {
                let Handlers = this.$options.remote;
                for (let name in Handlers) {
                    if (Handlers.hasOwnProperty(name) && typeof Handlers[name] === "function") {
                        Vue.Remote.attach(name, Handlers[name], this);
                    }
                }
            }
        }
    });

    Vue.prototype.$remote = {
        $on: function(identifier, callback) {
            Vue.Remote.attach(identifier, callback, this);
            return this;
        },
        $once: function(identifier, callback) {
            const thisArg = this;
            function once() {
                Vue.remote.detach(identifier, callback);
                callback.apply(thisArg, arguments);
            }

            once.fn = callback;

            Vue.Remote.attach(identifier, once, thisArg);
            return thisArg;
        },
        $off: function(identifier, callback) {
            Vue.Remote.detach(identifier, callback, this);
            return this;
        },
        $emit: Vue.Remote.emit
    };
};