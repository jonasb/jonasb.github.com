---
layout: post
title: Releasing — Dossier
---

For the last two years I've been working on a project, which I have now released as open source. It's called [Dossier](https://www.dossierhq.dev/) and it's a toolkit for building headless CMSs.

<img src="/static/images/posts/dossier-logo.svg" alt="Dossier logo" width="300">

For a long time I've found that selection of CMS has been one of the trickiest parts of technology selection for a solution. There are of course many great CMSs out there, and whatever I build will have it's own set of restrictions, but at least I have more of a say in what those are.

After spending some time on a side project with a custom database-driven backend, I decided to bite the bullet and start on my own CMS and use it for my own projects. A year ago I launched [mmö.se](https://mmö.se/), which is a site for restaurants in Malmö, Sweden. It's built on Dossier and has been extremely useful in order to have an outside-in perspective. Similar to how unit tests drives the design of the code, mmö.se has driven the design of Dossier to a large extent.

Now I've reached a place where I'm happy with the big strokes of the project, so I've put it up on [GitHub](https://github.com/dossierhq/dossierhq/) and [npm](https://www.npmjs.com/org/dossierhq)

<video controls width="700">
<source src="/static/videos/posts/dossier-gource.webm">
</video>

There's some documentation on the [website](https://www.dossierhq.dev/docs) and there's a [playground](https://playground.dossierhq.dev/) where you can try it out. For developers, there's a [getting started guide](https://www.dossierhq.dev/docs/getting-started) that helps you set up and deploy a simple project.

There's still [a lot to work on](https://www.dossierhq.dev/docs/limitations) and I'd like to use it for a few more projects so it doesn't become too tailored for one specific use case. But I'm happy with the progress so far and I'm looking forward to seeing what people do with it.
