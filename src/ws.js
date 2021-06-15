import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
var WebSocketClient = require('websocket').client;

const client = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@kline_30m');

class WSApp extends Component {
  componentWillMount() {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      console.log(message);
    };
  }
  
  render() {
    return (
      <div>
        Practical Intro To WebSockets.
      </div>
    );
  }
}

export default WSApp;