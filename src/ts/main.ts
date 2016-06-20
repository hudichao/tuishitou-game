"use strict";

var url:string = "http://133.242.23.121:16001";

var _images = {};
window.addEventListener("load", function load(event) {
    window.removeEventListener("load", load, false);
    init();
});

function init() {

    var ready = 2;
    var finishHandler = function() {
        ready--;
        if (ready > 0) {
            return;
        }
        
        Client.login(url, function(client) {
            console.log(client);
            start(client);
        });
    }

    AudioHelper.getSharedAudioHelper().setup(finishHandler);
    ImageHelper.loadImages(finishHandler);
}

function start(client) {
    var game = new Game(client);

    setupAudio();
    setupAnimation(game);
    setupInput(game);
    setupMessageForm(game);
}

function setupAudio() {
    var audio = new Audio(Config.resourceSrc + "bgm.mp3");
    audio.loop = true;
    audio.play();
    
    var offButton = document.getElementById("audio_button_off");
    var onButton = document.getElementById("audio_button_on");
    
    offButton.style.display = "block";
    
    offButton.onclick = function() {
        offButton.style.display = "none";
        onButton.style.display = "block";
        audio.pause();
        AudioHelper.getSharedAudioHelper().setEnabled(false);
    };
    
    onButton.onclick = function() {
        onButton.style.display = "none";
        offButton.style.display = "block";
        audio.play();
        AudioHelper.getSharedAudioHelper().setEnabled(true);
    };
    
}

function setupAnimation(game) {
    var previousTimestamp = -1;
    window.requestAnimationFrame(function frame(timestamp) {
        if (previousTimestamp < 0) {
            previousTimestamp = timestamp;
        }

        var deltaTime = (timestamp - previousTimestamp) / 1000.0;
        if (deltaTime > 0.1) {
            deltaTime = 0.1
        }
        
        previousTimestamp = timestamp;

        game.onUpdate(deltaTime);
        game.onDraw();

        window.requestAnimationFrame(frame);
    });
}

function setupInput(game) {
    var KEY_CODE = 32;

    var keyDown = false;

    document.addEventListener("keydown", function(event) {
        if (event.keyCode != KEY_CODE) {
            return;
        }
        if (keyDown) {
            return;
        }
        keyDown = true;
        game.onInput();
    }, false);


    document.addEventListener("keyup", function(event) {
        if (event.keyCode != KEY_CODE) {
            return;
        }
        keyDown = false;
    }, false);

    $('#game_canvas').tap(function(event) {
        game.onInput();
    });
}

function setupMessageForm(game) {
    $('#game_message_form').submit(function(event) {
        event.preventDefault();
        var $input = $(this).children('input');
        var message = $input.val();
        $input.val("");
        game.onSendMessage(message);
    });
}

