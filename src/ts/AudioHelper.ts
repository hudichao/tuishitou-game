"use strict";
var _sharedAudioHelper = null;
class AudioHelper {
    private context;
    private soundBuffers = {};
    private activeSources = [];
    private enabled = true;

    private static MAX_ACTIVE_SOURCES = 10;

    public constructor() {
        this.context = AudioHelper.createAudioContext();
    }
    public static createAudioContext() {
        if (typeof AudioContext !== "undefined") {
            return new AudioContext();
        } 
        return null;
    }
    public static getSharedAudioHelper() {
        if (_sharedAudioHelper == null) {
            _sharedAudioHelper = new AudioHelper();
        }
        return _sharedAudioHelper;
    }
    private setup(onComplete) {
        if (!this.context) {
            onComplete();
            return;
        }

        var names = ["move", "applause"];
        var counter = names.length;

        var loadSound = function (name) {
            var request = new XMLHttpRequest();
            request.open("GET", Config.resourceSrc + name + ".mp3", true);
            request.responseType = "arraybuffer";

            request.onload = function () {
                this.context.decodeAudioData(request.response, function (buffer) {
                    this.soundBuffers[name] = buffer;

                    counter--;
                    if (counter > 0) {
                        return;
                    }

                    onComplete();
                }.bind(this), function () {
                    counter--;
                    if (counter > 0) {
                        return;
                    }
                    onComplete();
                });
            }.bind(this);
            request.send();
        }.bind(this);

        for (var i = 0; i < names.length; i++) {
            loadSound(names[i]);
        }
    }
    private setEnabled(enabled) {
        this.enabled = enabled;
    }
    private playSound(name) {
        if (!this.enabled) {
            return;
        }

        var buffer = this.soundBuffers[name];
        if (!buffer) {
            return;
        }

        if (this.activeSources.length >= AudioHelper.MAX_ACTIVE_SOURCES) {
            this.activeSources[0].stop(0);
            this.activeSources.splice(0, 1);
        }


        var source = this.context.createBufferSource();
        source.buffer = buffer;

        var gainNode = this.context.createGain();
        gainNode.gain.value = 0.15;

        source.connect(gainNode);
        gainNode.connect(this.context.destination);

        source.start(0);

        this.activeSources.push(source)
    }
}
