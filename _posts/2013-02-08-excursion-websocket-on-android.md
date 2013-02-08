---
layout: post
title: Excursion — WebSocket on Android
---

It's been a long time since I made any web development on mobile, and I have never tried out WebSocket, so let's see how feasible it is to create an Android WebSocket server and interface it with an Android HTML client.

## Step 1) set up a WebSocket server on desktop

There are a lot of full featured WebSocket servers out there. I want something simple to test the water. [web-socket-ruby](https://github.com/gimite/web-socket-ruby) seems to fit the bill.

Cloning the repo and starting an echo server is easy enough.

    ➤ git clone https://github.com/gimite/web-socket-ruby.git
    ➤ cd web-socket-ruby
    ➤ ruby samples/echo_server.rb localhost 10081

## Step 2) try a WebSocket client on desktop

WebSocket.org has a simple [echo client](http://www.websocket.org/echo.html). It works against the default `ws://echo.websocket.org/` URI. Changing `wsUri` to `ws://localhost:10081/` causes the server to barf some errors.

    web-socket-ruby/lib/web_socket.rb:63:in `initialize': Unaccepted origin: null (server.accepted_domains = ["localhost"])

That's probably due to the web page being opened with `file://` instead of being served by a server. Least resistance: comment out the origin checks in `web-socket-ruby/lib/web-socket.rb`. Now it works :-)

## Step 3) try the client on Chrome on Android

According to [Can I use WebSockets?](http://caniuse.com/websockets) my browser choices on Android are Chrome for Android, Opera Mobile and Firefox for Android. Chrome is my browser of choice.

Changing `wsUri` once more to match the IP of my laptop, I upload the HTML file to my phone and open it in Chrome for Android.

Well look at that.

![Screen shot of echo client working on Chrome for Android](/static/images/posts/screen-echo-chrome-android.png)

The origin issue is consistent with desktop Chrome, server says:

```
Connection accepted
Path: /, Origin: null
Received: "WebSocket rocks"
Sent: "WebSocket rocks"
Connection closed
```

As expected it doesn't work on the Android Browser. But it works equally well on Firefox for Android, Chrome, Chrome Beta and Opera Mobile.

## Step 4) try out remote debugging for Chrome

So the work flow of uploading files to the phone is not feasible and there are a number of alternatives, but I've always wanted to try remote debugging for Chrome.

It's very well documented over [here](https://developers.google.com/chrome-developer-tools/docs/remote-debugging).

Well, it's extremely easy. After the initial settings, launching it is just a few commands away:

    ➤ adb forward tcp:9222 localabstract:chrome_devtools_remote
    ➤ open http://localhost:9222

## Step 5) get a WebSocket server running on the phone

[Java-WebSocket](https://github.com/TooTallNate/Java-WebSocket) looks like a good implementation that is known to work on Android. It compiles without a hitch.

Least resistance: start a WebSocket server in an `Activity`'s `onCreate()`.

    // Initialize and start echo server
    final int port = 8080;
    WebSocketImpl.DEBUG = true;
    WebSocketServer server = new WebSocketServer(
            new InetSocketAddress(port)) {
        @Override
        public void onClose(WebSocket conn, int code, String reason,
                boolean remote) {
            Log.d("SERVER", "onClose()");
        }
    
        @Override
        public void onError(WebSocket conn, Exception ex) {
            Log.d("SERVER", "onError()", ex);
        }
    
        @Override
        public void onMessage(WebSocket conn, String message) {
            Log.d("SERVER", String.format("onMessage(%s)", message));
            conn.send(message);
        }
    
        @Override
        public void onOpen(WebSocket conn, ClientHandshake handshake) {
            Log.d("SERVER", "onOpen()");
        }
    };
    
    server.start();

This will start an echo server in a background thread. It's not proper, one main issue is that it never stops the server. We should honor the Android activity life cycle, but it'll work for now. Also we have to remember to add `android.permission.INTERNET` to `AndroidManifest.xml`.

With this we can modify `wsUri` of the HTML client to `ws://localhost:8080/` (I did it using remote debugging and ran `testWebSocket()`). Everything seems to work.

## Fin

That concludes today's excursion. It seems very feasible to write a WebSocket server on Android and connect to it using a HTML page running in a browser on the same phone. There are some compatibility concerns with the built in Browser but for people who can't run Chrome (it requires Android 4.0+), Firefox and Opera Mobile are available.
