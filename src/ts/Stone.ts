"use strict";

class Stone {
    private angle;
    public constructor() {
        this.angle = 0;

    }
    public static RADIUS = 200;
    public getAngle() {
        return this.angle;

    }
    public setAngle(angle) {
        this.angle = angle % (Math.PI * 2);

    }
    public draw(context) {
        var image = ImageHelper.getImage("stone");
        context.save();
        context.translate(Stone.RADIUS, -Stone.RADIUS);
        context.rotate(this.angle);

        context.drawImage(image, -image.width * 0.5, -image.height * 0.5);

        context.restore();
    }
}


