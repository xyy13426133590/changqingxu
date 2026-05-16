"use strict";
const services_api = require("./api.js");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
let socket = null;
function wsUrlToSocketIoHttp(url) {
  if (url.startsWith("ws://"))
    return `http://${url.slice(5)}`;
  if (url.startsWith("wss://"))
    return `https://${url.slice(6)}`;
  return url;
}
function disconnectChatSocket() {
  return __async(this, null, function* () {
    if (!socket)
      return;
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  });
}
function connectChatSocket(handlers) {
  return __async(this, null, function* () {
    yield disconnectChatSocket();
    try {
      const { io } = yield "../common/vendor.js".then((n) => n.index$1);
      const token = services_api.getToken();
      if (!token)
        return;
      const url = wsUrlToSocketIoHttp(services_api.WS_BASE_URL || "http://localhost:3000/chat");
      socket = io(url, {
        transports: ["websocket", "polling"],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2e3
      });
      if (handlers.onNewMessage)
        socket.on("new_message", handlers.onNewMessage);
      if (handlers.onMessageSent)
        socket.on("message_sent", handlers.onMessageSent);
    } catch (e) {
    }
  });
}
exports.connectChatSocket = connectChatSocket;
exports.disconnectChatSocket = disconnectChatSocket;
