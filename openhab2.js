/*

  OpenHAB nodes for IBM's Node-Red
  https://github.com/QNimbus/node-red-contrib-openhab2
  (c) 2018, Bas van Wetten <bas.van.wetten@gmail.com>

  Licensed under the Apache License, Version 2.0 (the 'License');
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an 'AS IS' BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  
*/
var EventSource = require('@joeybaker/eventsource');
var request = require('request');

function getConnectionString(config) {
    var url;

    if (config.protocol)
        url = config.protocol;
    else
        url = 'http';

    url += '://';

    if ((config.username != undefined) && (config.username.trim().length != 0)) {
        url += config.username.trim();

        if ((config.password != undefined) && (config.password.length != 0)) {
            url += ':' + config.password;
        }
        url += '@';
    }
    url += config.host;

    if ((config.port != undefined) && (config.port.trim().length != 0)) {
        url += ':' + config.port.trim();
    }

    if ((config.path != undefined) && (config.path.trim().length != 0)) {
        var path = config.path.trim();

        path = path.replace(/^[\/]+/, '');
        path = path.replace(/[\/]+$/, '');

        url += '/' + path;
    }

    return url;
}

module.exports = function(RED) {

    /**
     * httpAdmin.get
     * 
     * Enable http route to static files
     *
     */
    RED.httpAdmin.get('/static/*', function(req, res) {
        var options = {
            root: __dirname + '/static/',
            dotfiles: 'deny'
        };
        res.sendFile(req.params[0], options);
    });

    /**
     * httpAdmin.get
     * 
     * Enable http route GET all available OpenHAB items
     *
     */
    RED.httpNode.get('/openhab2/items', function(req, res, next) {
        var config = req.query;
        var url = getConnectionString(config) + '/rest/items';
        request.get(url, function(error, response, body) {
            if (error) {
                res.send('request error \'' + JSON.stringify(error) + '\' on \'' + url + '\'');
            } else if (response.statusCode != 200) {
                res.send('response error \'' + JSON.stringify(response) + '\' on \'' + url + '\'');
            } else {
                res.send(body);
            }
        });

    });

    /**
     * openhab2-controller
     * 
     * Holds the configuration (hostname, port, creds, etc) of the OpenHAB server
     *
     */
    function OpenHABControllerNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        node.url = config.url;
        node.name = config.name;

        /**
         * getConfig
         * 
         * Getter for config object
         *
         */
        this.getConfig = function() {
            return config;
        }

        /**
         * getConfig
         * 
         * Getter for url string
         *
         */
        this.getUrl = function() {
            return node.url;
        }

        // /**
        //  * log
        //  * 
        //  * Logging function for controller node
        //  *
        //  */
        // this.log = function(logMessage) {
        //     node.log(`[LOG] ControllerNode ${node.name}: ${JSON.stringify(logMessage)}`);
        // }

        /* 
         * Node events
         */

        this.on('open', function open() {
            this.log('open');
            node.emit('status', 'Connected');
        });

        this.on('close', function() {
            node.log('close');
            node.emit('status', 'Disconnected');
        });

    }
    RED.nodes.registerType('openhab2-controller', OpenHABControllerNode);

    /**
     * ====== openhab2-events ===================
     * monitors opnHAB events
     * =======================================
     */
    function OpenHABEvents(config) {
        // Create OpenHABEvents node
        RED.nodes.createNode(this, config);

        var openhabController = RED.nodes.getNode(config.controller);
        var node = this;

        node.name = config.name;

        OpenHABController.on('status', function(args) {
            node.status({ fill: "green", shape: "dot", text: "state:" + JSON.stringify(args) });
        });

        //
        RED.nodes.registerType('openhab2-events', OpenHABEvents);
    }
}