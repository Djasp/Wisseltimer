/**
 * The standard settings for a game, like number of players on the field and number of minutes per half.
 * 
 * @export
 * @class Settings
 */
export class Settings {

    fieldPlayers: number = 6;
    minutesPerHalf: number = 20;
    fullGame: boolean = false;

    constructor(data = {}) {
        Object.assign(this, data);
    }
}