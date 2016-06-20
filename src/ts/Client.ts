"use strict";
class Client {
    private socket;
    private localUser;
    private users;
    private totalTapCount;
    private currentTapCount;
    private onCurrentTapCountChangeHandler = null;
    private onUserEnterHandler = null;
    private onUserLeaveHandler = null;
    private onUserTapHandler = null;
    private onMessageArrivedHandler = null;
    public constructor(socket, localUser, users, totalTapCount, currentTapCount) {
        this.socket = socket;
        this.localUser = localUser;
        this.users = users;
        this.totalTapCount = totalTapCount;
        this.currentTapCount = currentTapCount;

    }
    public static login(url, onCompleteHandler) {
        var socket = io(url);

        var localUser = null;
        var users = [];

        var totalTapCount = 0;
        var currentTapCount = 0;

        var counter = 3;

        var finish = function () {
            counter--;
            if (counter > 0) {
                return;
            }

            onCompleteHandler(new Client(socket, localUser, users, totalTapCount, currentTapCount));
        }

        console.log('cookies:', JSON.stringify($.cookie()));
        socket.emit('login', $.cookie('token'));

        socket.on('users', function (data) {
            socket.on('users', null);

            var count = data.length;
            for (var i = 0; i < count; i++) {
                users.push(User.fromData(data[i], false));
            }
            finish();
        });

        socket.on('round', function (data) {
            socket.on('round', null);

            totalTapCount = data["total"];
            currentTapCount = data["tapped"];
            finish();
        });

        socket.on('user', function (data) {
            socket.on('user', null);
            localUser = User.fromData(data, true);
            $.cookie('token', data['token']);
            console.log('cookies:', JSON.stringify($.cookie()));
            finish();
        });
    }
    public getTotalTapCount() {
        return this.totalTapCount;
    }
    public getCurrentTapCount() {
        return this.currentTapCount;
    }
    public getUserCount() {
        return this.users.length;
    }
    public getUser(index) {
        return this.users[index];
    }
    public getUserIndexByID(userID) {
        var count = this.users.length;
        for (var i = 0; i < count; i++) {
            if (this.users[i].getUserID() === userID) {
                return i;
            }
        }
        return -1;
    }
    public getLocalUser() {
        return this.localUser;
    }
    public sendTap() {
        this.localUser.tapCount++;
        this.socket.emit('tap', {});
    }
    public sendMessage(message) {
        if (!message) {
            return;
        }
        this.socket.emit('message', message);
    }

    public setOnCurrentTapCountChangeHandler(handler) {
        this.onCurrentTapCountChangeHandler = handler;
    }
    public setOnUserEnterHandler(handler) {
        this.onUserEnterHandler = handler;
    }
    public setOnUserLeaveHandler(handler) {
        this.onUserLeaveHandler = handler;
    }
    public setOnUserTapHandler(handler) {
        this.onUserTapHandler = handler;

    }
    public setOnMessageArraivedHandler(handler) {
        this.onMessageArrivedHandler = handler;

    }

    public setupSocket() {
        this.socket.on('tapped', function (data) {
            this.currentTapCount = data;
            this.onCurrentTapCountChangeHandler();
        }.bind(this));

        this.socket.on('user in', function (data) {
            var user = User.fromData(data);
            this.users.push(user);
            this.onUserEnterHandler(user);
        }.bind(this));

        this.socket.on('user out', function (data) {
            var index = this.getUserIndexByID(data);
            if (index < 0) {
                return;
            }
            var user = this.users[index];
            this.users.splice(index, 1);
            this.onUserLeaveHandler(user);
        }.bind(this));

        this.socket.on('user tap', function (data) {
            var index = this.getUserIndexByID(data);
            if (index < 0) {
                return;
            }

            var user = this.users[index];
            user._tapCount++;
            this.onUserTapHandler(user);
        }.bind(this));


        this.socket.on('message', function (data) {
            this.onMessageArrivedHandler(data);
        }.bind(this));
    }
}

