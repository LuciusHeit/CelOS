export class User{
    id
    username
    password
    admin
    player

    constructor(id, username, password, admin, player) {
        this.id = id
        this.username = username
        this.password = password
        this.admin = admin
        this.player = player
    }

    static guestUser(){
        return new User(-1, "Guest", "", 0, 0)
    }
}