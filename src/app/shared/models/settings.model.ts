/**
 * The standard settings for a game, like number of players on the field and number of minutes per half.
 * 
 * @export
 * @class Settings
 */
export class Settings {

    // default settings
    fieldPlayers: number = 8; // number of players on the field 
    minutesPerHalf: number = 30; // how long each half lasts 
    fullGame: boolean = false;

    constructor(data = {}) {
        Object.assign(this, data);
    }
}