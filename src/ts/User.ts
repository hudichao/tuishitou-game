"use strict";

class User {
    private userID;
    private tapCount;
    private local;
    public constructor(userID, tapCount, local) {
        this.userID = userID;
        this.tapCount = tapCount;
        this.local = local;
    }
    public static fromData(data, local?) {
        return new User(data["id"], data["tapped"], local);

    }
    public getUserID() {
        return this.userID;

    }
    public getTapCount() {
        return this.tapCount;

    }
    public isLocal() {
        return this.local;

    }
}