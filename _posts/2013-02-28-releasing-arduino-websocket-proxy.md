---
layout: post
title: Releasing — Arduino WebSocket proxy
---

I got this [Arduino Mega ADK](http://labs.arduino.cc/ADK/Index) board from [David Cuartielles](http://david.cuartielles.com/) a few weeks back and have been experimenting with it a bit since then. David also had the idea of communicating with the board using [WebSocket](http://www.websocket.org/). So I've made an app that acts as proxy between the Arduino board and the web page.

![Arduino WebSocket proxy](/static/images/posts/arduinowebsocketproxy.png)

>Arduino WebSocket proxy enables an Arduino board and a web page to communicate with each other. The communication between the Arduino board and the app uses ADK (Accessory Development Kit) over USB. The communication between the web page and the app uses WebSocket.
>
>The web page can run on the Android device or on a computer on the same wireless network. There's no security, anyone on the same network can talk to the app.
>
>All communication that goes through the app is logged on screen.
>
>The app works with any accessory. It will be launched automatically if the accessory uses the following information: manufacturer="Wigwam Labs", model="Arduino WebSocket proxy", version="1.0".

![Screenshot](/static/images/posts/arduinowebsocketproxy-screen.jpg)

The code is up at [GitHub](https://github.com/jonasb/ArduinoWebSocketProxy), and the app is in the Play Store.

[<img alt="Get it on Google Play" src="https://developer.android.com/images/brand/en_generic_rgb_wo_60.png" />](https://play.google.com/store/apps/details?id=com.wigwamlabs.arduinowebsocketproxy)

As soon as I had the basic interaction with ADK under control there weren't any major issues. There were two hurdles.

One hurdle is that using `adb` is a bit cumbersome since you need to connect the Android device to the board using USB. It's possible to use `adb` over wi-fi, but whenever the device is connected/disconnected from USB the `adb` session is disconnected (which seems like a bug). I use this `zsh` script to reconnect: `while {true} { adb connect $IP; adb shell }`. But since the app logs all communication on screen the need for ADB is reduced a bit.

Another problem is that it seems like I can only read one byte at a time from the board. At the moment the data is sent over WebSocket as soon as it's available, which means that the performance for larger messages is less than stellar.

The GitHub project contains [an echo Arduino sketch](https://github.com/jonasb/ArduinoWebSocketProxy/tree/master/arduino/Echo), and [an echo html client](https://github.com/jonasb/ArduinoWebSocketProxy/blob/master/html/echo-client.html).
