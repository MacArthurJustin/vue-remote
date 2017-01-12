#!/usr/bin/env node

/**
 * Vue-Remote Server
 * Handles the creation and management of a basic Websocket Server for SPA Communications
 *
 * @module vue-remote/server
 * @author Justin MacArthur <macarthurjustin@gmail.com>
 * @version 1.0.0
 */

const http = require('http');
const WebSocket = require('websocket');

/**
 * Default System Handler that Echos Input
 * 
 * @param {connection} connection
 * @returns {Function} Message Handling Function for the Server
 */
function defaultHandler(message) {
    console.log(message);
    return {
        identifier: message.identifier,
        data: "Handled Message"
    };
}

/**
 * 
 * 
 * @param {Function} messageHandler
 * @param {Object} [options]
 */
module.exports = function(messageHandler, options) {
    options = options || Object.create(null);

    /**
     * Default HTTP Server Handler
     * Returns 404 to any nonWebserver requests
     * 
     * @param {request} request
     * @param {response} response
     */
    let server = http.createServer(
        function(request, response) {
            response.writeHead(404);
            response.end();
        }
    );

    server.listen(
        options.port || 8080,
        function() {
            console.log((new Date()) + ' Server is listening on port ' + (options.port || 8080));
        }
    );

    let wsServer = new WebSocket.server({
        httpServer: server,
        autoAcceptConnections: false
    });

    /**
     * Basic CORS test
     * 
     * @param {String} origin
     * @returns
     */
    function originIsAllowed(origin) {
        return typeof options.originIsAllowed === "function" ? options.originIsAllowed(origin) : true;
    }

    wsServer.on(
        'request',
        function(request) {
            if (!originIsAllowed(request.origin)) {
                request.reject();
                console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
                return;
            }

            console.log((new Date()) + ' Connection accepted.');

            let connection = request.accept(undefined, request.origin),
                handler = messageHandler || defaultHandler;

            connection.on(
                'message',
                function(message) {
                    console.log(message);
                    let Json = JSON.parse(message.utf8Data),
                        value = handler(Json);

                    connection.send(JSON.stringify(value));
                }
            );

            connection.on(
                'close',
                function(reasonCode, description) {
                    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
                }
            );
        }
    );
};