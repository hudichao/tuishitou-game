class ImageHelper {
    public static images = {};
    public static getImage(name) {
        return ImageHelper.images[name];
    }
    public static loadImages(onComplete) {
        var names = ["bg_back", "bg1", "bg2", "stone", "player_1", "player_2", "other_1", "other_2"];
        var counter = names.length;

        for (var i = 0; i < names.length; i++) {
            (function (name) {
                var image = new Image();
                image.onload = function () {
                    ImageHelper.images[name] = this;
                    counter--;
                    if (counter == 0) {
                        onComplete();
                    }
                };
                image.src = Config.resourceSrc + name + ".png";
            })(names[i]);
        }
    }
}