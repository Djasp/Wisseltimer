import moment from 'moment';

export class Game {

    gameStarted: boolean = false;
    gamePaused: boolean = false;
    actualGameStartedTime: moment.Moment = null;

    formationDone: boolean = false;
    actualFormationDoneTime: moment.Moment = null;
    gameTime: moment.Moment = null;

    constructor(data = {}) {
        Object.assign(this, data);
    }

}


