html5-videoEditor
=================

About
-----

This is more of a proof of concept than a fully functional web-application.
Right now it allows you to load videos into the browser, they get automatically uploaded via WebsSocket to a node.js application, where those assets get transcoded (H264/WebM/OGG).
Then you can  create a composition (=new video), copy videos to the stage, trim them, transform them, stack them and then finally encode them on the server-side using [AviSynth](http://www.avisynth.org) and [ffmpeg](http://www.ffmpeg.org)
Currently each encoding job will produce a H264 encoded video.

![Alt text](/screenshot.jpg "Screenshot")

Installation
------------

For the application you will need the following on the server-side (where the node-app is running):

* node.js
* node-app dependencies (package.json)
* ffmpeg
* avisynth
* mongodb


License
-------
Feel free to modify, contribute, fork, print it or whatever.
Every part of this code I wrote is released under the [WTFPL](http://www.wtfpl.net/).
For the libraries/modules I used you have to see for yourself.