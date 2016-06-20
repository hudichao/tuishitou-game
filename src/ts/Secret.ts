"use strict";
class Secret {
    private timestamps;
    private index;
    private next;

    public constructor() {
        this.timestamps = [0.6, 0.6, 0.3, 0.3];

        this.index = -1;
        this.next = 0;
    }
    public tap() {
        if (this.index < 0) {
            this.index = 0;
            this.next = this.timestamps[this.index];
            return;
        }

        if (this.next > 0.1) {
            this.index = -1;
            this.next = 0;
            return;
        }

        this.index++;
        if (this.index < this.timestamps.length) {
            this.next = this.timestamps[this.index];
        } else {
            this.index = -1;
            this.next = 0;

            AudioHelper.getSharedAudioHelper().playSound("applause");
        }
    }
    public update(deltaTime) {
        if (this.index < 0) {
            return;
        }

        this.next -= deltaTime;
        if (this.next < -0.1) {
            this.index = -1;
            this.next = 0;
            return;
        }
    }
}



