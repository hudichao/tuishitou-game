"use strict";

var _playerSharedAudio = null;

class Player {
    private user;
    private position;
    private targetPosition;
    private pushAnimationCounter = 0;
    private images = [];
    public constructor(user, position) {
        this.user = user;
        this.position = position;
        this.targetPosition = position;


        if (this.user.isLocal()) {
            this.images.push(ImageHelper.getImage("player_1"));
            this.images.push(ImageHelper.getImage("player_2"));
        } else {
            this.images.push(ImageHelper.getImage("other_1"));
            this.images.push(ImageHelper.getImage("other_2"));
        }
    }
    public static MOVE_SPEED = 100;
    public static PUSH_ANIMATION_TIME = 0.1;
    public static MAX_TAP_SCALE = 1000;
    public static MIN_SCALE = 1;
    public static MAX_SCALE = 2;

    public getUser() {
        return this.user;

    }
    public move(position) {
        this.targetPosition = position;

    }
    public animatePush() {
        AudioHelper.getSharedAudioHelper().playSound("move");

        this.pushAnimationCounter = Player.PUSH_ANIMATION_TIME;
    }
    public update(deltaTime) {
        this.updateMove(deltaTime);
        this.updateAnimation(deltaTime);
    }
    public updateMove(deltaTime) {
        if (this.position < this.targetPosition) {
            this.position += Player.MOVE_SPEED * deltaTime;
            if (this.position > this.targetPosition) {
                this.position = this.targetPosition;
            }
        } else if (this.position > this.targetPosition) {
            this.position -= Player.MOVE_SPEED * deltaTime;
            if (this.position < this.targetPosition) {
                this.position = this.targetPosition;
            }
        }
    }
    public updateAnimation(deltaTime) {
        this.pushAnimationCounter -= deltaTime;
        if (this.pushAnimationCounter > 0) {
            return;
        }
        this.pushAnimationCounter = 0;
    }
    public getScale() {
        var t = this.user.getTapCount() / Player.MAX_TAP_SCALE;
        if (t > 1) {
            t = 1;
        }
        return Player.MIN_SCALE + (Player.MAX_SCALE - Player.MIN_SCALE) * Math.sin(t * Math.PI * 0.5);

    }
    public draw(context) {
        var scale = this.getScale();

        var image = this.images[this.pushAnimationCounter > 0 ? 1 : 0];

        context.save();
        context.translate(this.position + Stone.RADIUS * 0.5, 0);
        context.scale(scale, scale);

        context.drawImage(image, -image.width, -image.height);

        context.restore();

    }
}

