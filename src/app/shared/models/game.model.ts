export class Game {

    gameStarted: boolean = false;
    gamePaused: boolean = false;
    actualGameStartedTimeInUnixTimeStamp: number = 0;
    formationDone: boolean = false;
    actualFormationDoneTimeInUnixTimeStamp: number = 0;
    gameTimeInUnixTimeStamp: number = 0;

    constructor(data = {}) {
        Object.assign(this, data);
    }

}
