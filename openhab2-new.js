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
     * openhab2-new-controller
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
    RED.nodes.registerType('openhab2-new-controller', OpenHABControllerNode);

    /**
     * ====== openhab2-new-events ===================
     * monitors opnHAB events
     * =======================================
     */
    function OpenHABEvents(config) {
        // Create OpenHABEvents node
        RED.nodes.createNode(this, config);

        var openHABController = RED.nodes.getNode(config.controller);
        var node = this;

        node.name = config.name;

        openHABController.on('status', function(args) {
            node.status({ fill: "green", shape: "dot", text: "state:" + JSON.stringify(args) });
        });
    }
    RED.nodes.registerType('openhab2-new-events', OpenHABEvents);
}