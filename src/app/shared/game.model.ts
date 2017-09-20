import { Player } from './player.model';
export class Game {

    fieldPlayers: Number;
    minutesPerHalf: Number;
    gameStarted: Boolean;
    actualGameStartedTime: Date;
    fullGame: Boolean;
    players: Array<Player>;

    // // "fieldPlayers": 5,
    // "minutesPerHalf": 0.2,
    // "gameStarted": null,
    // "actualGameStartedTime": null,
    // "fullGame": "no",
    // "players": [
    //     { id: 1, name: "Cas", present: "1" },
    //     { id: 2, name: "Daan", present: "1" },
    //     { id: 3, name: "Davi", present: "0" },
    //     { id: 4, name: "Maes", present: "1" },
    //     { id: 5, name: "Mouhand", present: "1" },
    //     { id: 6, name: "Nikey", present: "1" },
    //     { id: 7, name: "Nikki", present: "1" },
    //     { id: 8, name: "Luuk", present: "0" },
    //     { id: 9, name: "Seb", present: "1" }
    // ]
}


