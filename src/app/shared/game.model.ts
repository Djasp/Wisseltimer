import moment from 'moment';

export class Game {

    fieldPlayers: number = 6;
    minutesPerHalf: number = 20;
    gameStarted: boolean = false;
    actualGameStartedTime: moment.Moment;
    fullGame: boolean = false;

    constructor(data = {}) {
        Object.assign(this, data);
    }

}


