"use strict";

class Game {
    private client: Client;
    private context;
    private width;
    private height;
    private angle;
    private length;
    private cameraScale = 1;
    private scrollSpeed = 0;
    private secret: Secret;
    private foreground: Foreground;
    private stone: Stone;
    private players = [];
    private previousTapCount;

    public constructor(client: Client) {
        this.client = client;
        this.client.setOnCurrentTapCountChangeHandler(this.onClientCurrentTapCountChange.bind(this));
        this.client.setOnUserEnterHandler(this.onClientUserEnter.bind(this));
        this.client.setOnUserLeaveHandler(this.onClientUserLeave.bind(this));
        this.client.setOnUserTapHandler(this.onClientUserTap.bind(this));
        this.client.setOnMessageArraivedHandler(this.onClientGotMessage.bind(this));
        this.client.setupSocket();
        this.previousTapCount = this.client.getCurrentTapCount();

        var canvas: any = document.getElementById("game_canvas");
        this.context = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.angle = -Math.atan2(this.height, this.width);
        this.length = Math.sqrt(this.width * this.width + this.height * this.height);
        this.secret = new Secret();
        this.foreground = new Foreground(this.length, this.width * this.height / this.length);

        this.stone = new Stone();

        for (var i = 0; i < this.client.getUserCount(); i++) {
            this.addPlayer(this.client.getUser(i));
        }
        this.addPlayer(this.client.getLocalUser());

        this.refreshRemainingLabel();
        this.refreshMeLabel();


    }

    public static PLAYER_DISTANCE = 90;
    public static SCROLL_FACTOR = 100;
    public static SCROLL_SPEED_SMOOTHING = 0.5;
    public static CAMERA_MIN_SCALE = 0.05;
    public static CAMERA_MAX_SCALE = 1;
    public static CAMERA_SCALE_SMOOTHING = 0.5;

    public addPlayer(user) {
        var player = new Player(user, this.players.length * -Game.PLAYER_DISTANCE);
        this.players.push(player);
    }
    public removePlayer(user) {
        var index = this.getPlayerIndexByID(user.getUserID());
        if (index < 0) {
            return;
        }


        this.players.splice(index, 1);

        var count = this.players.length;
        for (var i = index; i < count; i++) {
            this.players[i].move(i * -Game.PLAYER_DISTANCE);
        }
    }

    public animatePlayer(user) {
        var player = this.getPlayerByID(user.getUserID());
        if (player == null) {
            return;
        }
        player.animatePush();
    }

    public getPlayerIndexByID(userID) {
        var count = this.players.length;
        for (var i = 0; i < count; i++) {
            if (this.players[i].getUser().getUserID() === userID) {
                return i;
            }
        }
        return -1;
    }

    public getPlayerByID(userID) {
        var index = this.getPlayerIndexByID(userID);
        if (index < 0) {
            return null;
        }
        return this.players[index];
    }

    public onClientCurrentTapCountChange() {
        this.refreshRemainingLabel();

        if (this.client.getCurrentTapCount() >= this.client.getTotalTapCount()) {
            window.location.href = "./html/goal.html";
        }
    }
    public onClientUserEnter(user) {
        this.addPlayer(user);

    }
    public onClientUserLeave(user) {
        this.removePlayer(user);

    }

    public onClientUserTap(user) {
        this.animatePlayer(user);
    }
    public onClientGotMessage(message) {
        this.addMessageLabel(message);

    }
    public onInput() {
        this.animatePlayer(this.client.getLocalUser());

        this.client.sendTap();
        this.refreshMeLabel();

        this.secret.tap();
    }
    public onSendMessage(message) {
        this.client.sendMessage(message);

    }
    public onUpdate(deltaTime) {
        this.secret.update(deltaTime);

        this.updateCameraScale(deltaTime);
        this.updateScrollSpeed(deltaTime);
        this.updateForeground(deltaTime);
        this.updateStone(deltaTime);

        this.updatePlayers(deltaTime);
    }

    public onDraw() {
        this.drawBackground();

        this.context.save();

        this.applyTransform();

        this.drawForeground();
        this.drawStone();
        this.drawPlayers();


        this.context.restore();
    }

    public updateCameraScale(deltaTime) {
        var targetCameraScale = 1.0 / (Game.PLAYER_DISTANCE * (this.client.getUserCount() + 1) / (this.length * 0.4));

        if (targetCameraScale > Game.CAMERA_MAX_SCALE) {
            targetCameraScale = Game.CAMERA_MAX_SCALE;
        } else if (targetCameraScale < Game.CAMERA_MIN_SCALE) {
            targetCameraScale = Game.CAMERA_MIN_SCALE;
        }

        this.cameraScale = this.cameraScale + (targetCameraScale - this.cameraScale) / (Game.CAMERA_SCALE_SMOOTHING / deltaTime);

    }

    public updateScrollSpeed(deltaTime) {
        var targetScrollSpeed = Game.SCROLL_FACTOR * (this.client.getCurrentTapCount() - this.previousTapCount);
        this.scrollSpeed = this.scrollSpeed + (targetScrollSpeed - this.scrollSpeed) / (Game.SCROLL_SPEED_SMOOTHING / deltaTime);
        this.previousTapCount = this.client.getCurrentTapCount();
    }

    public applyTransform() {
        this.context.translate(this.width / 2, this.height / 2);
        this.context.scale(this.cameraScale, this.cameraScale);
        this.context.rotate(this.angle);
    }
    public updateForeground(deltaTime) {
        var position = this.foreground.getPosition();
        position += this.scrollSpeed * deltaTime;
        this.foreground.setPosition(position);
    }

    public updateStone(deltaTime) {
        var angle = this.stone.getAngle();
        angle += this.scrollSpeed * deltaTime / Stone.RADIUS;
        this.stone.setAngle(angle);
    }

    public updatePlayers(deltaTime) {
        var count = this.players.length;
        for (var i = 0; i < count; i++) {
            this.players[i].update(deltaTime);
        }
    }
    public drawBackground() {
        this.context.drawImage(ImageHelper.getImage("bg_back"), 0, 0);

    }
    public drawForeground() {
        this.foreground.draw(this.context, this.cameraScale);

    }
    public drawStone() {
        this.stone.draw(this.context);

    }
    public drawPlayers() {
        var count = this.players.length;
        for (var i = 0; i < count; i++) {
            this.players[i].draw(this.context);
        }
    }
    public refreshRemainingLabel() {
        document.getElementById("game_remaining_label").innerHTML = "" + (this.client.getTotalTapCount() - this.client.getCurrentTapCount());

    }
    public refreshMeLabel() {
        document.getElementById("game_me_label").innerHTML = "" + this.client.getLocalUser().getTapCount();

    }
    public addMessageLabel(message) {
        var appended = $('<p>' + message + '</p>').appendTo($('#game_message_label'));
        setTimeout(function () {
            appended.fadeOut(1000, function () {
                appended.remove();
            })
        }, 15000);
    }
}

