"use strict";

class Foreground {
    private width;
    private height;
    private position;
    private outerPattern = null;
    private innerPattern = null;
    public constructor(width, height) {
        this.width = width;
        this.height = height;
        this.position = 0;

    }
    public static TILE_SIZE = 300;
    public prepare(context) {
        this.outerPattern = context.createPattern(ImageHelper.getImage("bg1"), "repeat");
        this.innerPattern = context.createPattern(ImageHelper.getImage("bg2"), "repeat");
    }
    public getPosition() {
        return this.position;

    }
    public setPosition(position) {
        this.position = position % Foreground.TILE_SIZE;

    }
    public draw(context, scale) {
        var width = this.width / scale;
        var height = this.height / scale;


        var xs = Math.floor(-width / Foreground.TILE_SIZE / 2);
        var xe = Math.ceil(+width / Foreground.TILE_SIZE / 2);
        var h = Math.ceil(height / Foreground.TILE_SIZE);

        var extra = 1.0 / scale;      // just a little bit extra to prevent safari seaming problem


        context.save();
        context.translate(-this.position, 0);

        context.fillStyle = this.outerPattern;
        context.fillRect(xs * Foreground.TILE_SIZE, 0, (xe - xs + 1) * Foreground.TILE_SIZE, Foreground.TILE_SIZE);

        context.fillStyle = this.innerPattern;
        context.fillRect(xs * Foreground.TILE_SIZE, Foreground.TILE_SIZE - extra, (xe - xs + 1) * Foreground.TILE_SIZE, (h - 1) * Foreground.TILE_SIZE + extra);

        context.restore();
    }
}