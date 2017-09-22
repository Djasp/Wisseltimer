import moment from 'moment';

export class Game {

    fieldPlayers: number = 5;
    minutesPerHalf: number = 0.2;
    gameStarted: boolean = false;
    gamePaused: boolean = false;
    actualGameStartedTime: moment.Moment = null;
    fullGame: boolean = false;
    formationDone: boolean = false;
    actualFormationDoneTime: moment.Moment = null;
    gameTime: moment.Moment = null;

    constructor(data = {}) {
        Object.assign(this, data);
    }

}


