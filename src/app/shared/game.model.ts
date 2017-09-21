import moment from 'moment';

export class Game {

    fieldPlayers: number = 5;
    minutesPerHalf: number = 0.2;
    gameStarted: boolean = false;
    actualGameStartedTime: moment.Moment;
    fullGame: boolean = false;

    constructor(data = {}) {
        Object.assign(this, data);
    }

}


