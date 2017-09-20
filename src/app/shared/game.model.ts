export class Game {

    fieldPlayers: Number = 5;
    minutesPerHalf: Number = 0.2;
    gameStarted: Boolean = false;
    actualGameStartedTime: Date;
    fullGame: Boolean = false;

    constructor(data = {}) {
        Object.assign(this, data);
    }

}


