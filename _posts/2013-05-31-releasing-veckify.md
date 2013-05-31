---
layout: post
title: Releasing — Veckify
---

For the last couple of weeks I've been working on an Android app, called Veckify, that plays Spotify playlists as alarms, and now [it's out on Play Store](https://play.google.com/store/apps/details?id=com.wigwamlabs.veckify).

![Veckify start screen](/static/images/posts/veckify1.png) ![Veckify alarm screen](/static/images/posts/veckify2.png)

The app uses [libspotify](https://developer.spotify.com/technologies/libspotify/) so it requires a Spotify Premium account and doesn't depend on the Spotify app.

It was my first time using a database since [loaders](http://developer.android.com/guide/components/loaders.html) were added to the system. I used [CWAC LoaderEx](https://github.com/commonsguy/cwac-loaderex) which worked quite fine. I also rolled my own swipe dismiss list view based on code from [DashClock](https://code.google.com/p/dashclock/) and SystemUI that I'd like to polish off and release as open source. I didn't find any solution out there where you can swipe to dismiss items in a list view where the items also can react on touch input, but I might be wrong.

All in all it's been a fun project. There are many system interaction aspects that I had a chance to learn (like waking up the screen, putting my activity on top of the unlock screen, handling audio focus and bluetooth headset buttons, reliable alarms). There are a few features I still would like to add and it needs polishing and tablet support (not to speak of the artwork overhaul), but I'm not sure how much time I'll have. And at least for me it works quite nicely as is, I've been using it as my alarm clock daily for over a month.

[Give it a go](https://play.google.com/store/apps/details?id=com.wigwamlabs.veckify) and please let me know what you think!
