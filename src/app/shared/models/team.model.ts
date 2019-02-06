import { Player } from './../models/player.model';
/**
 *
 *
 * @export
 * @class Team
 */
export class Team {

    players: Player[] = [];

    constructor(data = {}) {
        Object.assign(this, data);
    }

}