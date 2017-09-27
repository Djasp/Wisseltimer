import { Player } from './../models/player.model';
import { Team } from './../models/team.model';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class TeamService {
    currentTeam: Team = new Team();
    constructor(private storage: Storage) {
    }

    /**
     * Load the team from the database 
     * 
     * @returns {Team} 
     * @memberof TeamService
     */
    loadTeam(): Promise<Team> {
        // create new promise 
        let promise = new Promise<Team>((resolve, reject) => {
            // get team object from storage 
            this.storage.get("team")
                .then(value => {
                    if (value != null) {
                        this.currentTeam = new Team(value);
                        console.log("Loaded team", this.currentTeam);
                    }
                    resolve(this.currentTeam);
                });
        });
        return promise;
    }

    /**
     * Save the team to the database
     * 
     * @param {Team} team 
     * @memberof TeamService
     */
    saveTeam(team: Team): Promise<Team> {
        // let saved: boolean;
        let promise = new Promise<Team>((resolve, reject) => {
            console.log("Save team", team);
            // save the team object to the storage
            this.storage.set("team", team).then(
                () => resolve(),
                () => reject()
            );
        });
        return promise;
    }

    /**
     * Toggle the attendance of a player
     * 
     * @param {Player} player 
     * @returns {Promise<Team>} 
     * @memberof TeamService
     */
    togglePlayerAttendance(player: Player): Promise<Team> {
        // let saved: boolean;
        let promise = new Promise<Team>((resolve, reject) => {

            console.log("Toggle player present", player);

            this.loadTeam().then(value => {
                if (value !== null) {
                    this.currentTeam = value;

                    // get the index of the item to be deleted 
                    let index: number = this.currentTeam.players.map(function (e) { return e.name; }).indexOf(player.name);
                    player.isPresent = !player.isPresent; // toggle                    
                    this.currentTeam.players[index] = player;
                    this.saveTeam(this.currentTeam).then( // store the team
                        () => resolve(this.currentTeam),
                        () => reject()
                    );
                }
            });
        });
        return promise;
    }

    /**
     * Toggle the starting formation of a player
     * 
     * @param {Player} player 
     * @returns {Promise<Team>} 
     * @memberof TeamService
     */
    togglePlayerInStartingFormation(player: Player): Promise<Team> {
        // let saved: boolean;
        let promise = new Promise<Team>((resolve, reject) => {

            console.log("Toggle player in starting formation", player);

            this.loadTeam().then(value => {
                if (value !== null) {
                    this.currentTeam = value;

                    // get the index of the item to be deleted 
                    let index: number = this.currentTeam.players.map(function (e) { return e.name; }).indexOf(player.name);
                    player.inStartingFormation = !player.inStartingFormation; // toggle                    
                    this.currentTeam.players[index] = player;
                    this.saveTeam(this.currentTeam).then( // store the team
                        () => resolve(this.currentTeam),
                        () => reject()
                    );
                }
            });
        });
        return promise;
    }

    /**
     * Toggle the do not substitute status of a player
     * 
     * @param {Player} player 
     * @returns {Promise<Team>} 
     * @memberof TeamService
     */
    togglePlayerDoNotSubstitute(player: Player): Promise<Team> {
        // let saved: boolean;
        let promise = new Promise<Team>((resolve, reject) => {

            console.log("Toggle player do not substitute", player);

            this.loadTeam().then(value => {
                if (value !== null) {
                    this.currentTeam = value;

                    // get the index of the item to be deleted 
                    let index: number = this.currentTeam.players.map(function (e) { return e.name; }).indexOf(player.name);
                    player.doNotSubstitute = !player.doNotSubstitute; // toggle                    
                    this.currentTeam.players[index] = player;
                    this.saveTeam(this.currentTeam).then( // store the team
                        () => resolve(this.currentTeam),
                        () => reject()
                    );
                }
            });
        });
        return promise;
    }

    /**
     * Add a player to the team
     * 
     * @param {Player} player 
     * @returns {Promise<Team>} 
     * @memberof TeamService
     */
    addPlayer(player: Player): Promise<Team> {
        // let saved: boolean;
        let promise = new Promise<Team>((resolve, reject) => {

            console.log("Add player to team", player);

            this.loadTeam().then(value => {
                if (value !== null) {
                    this.currentTeam = value;
                    this.currentTeam.players.push(player);
                    this.saveTeam(this.currentTeam).then( // store the team
                        () => resolve(),
                        () => reject()
                    );
                }
            });
        });
        return promise;
    }

    /**
     * Remove a player from the team
     * 
     * @param {Player} player 
     * @returns {Promise<Team>} 
     * @memberof TeamService
     */
    deletePlayer(player: Player): Promise<Team> {
        let promise = new Promise<Team>((resolve, reject) => {

            console.log("Delete player from team", player);

            this.loadTeam().then(value => {
                if (value !== null) {
                    this.currentTeam = value;

                    var index = this.currentTeam.players.indexOf(player); // get the index of the player to be deleted 
                    this.currentTeam.players.splice(index, 1); // remove from array;
                    this.saveTeam(this.currentTeam).then( // store the team
                        () => resolve(),
                        () => reject()
                    );
                }
            });
        });
        return promise;
    }

    public getPresentPlayers(): Promise<Player[]> {
        let promise = new Promise<Player[]>((resolve, reject) => {
            console.log("Get present players");
            this.loadTeam().then(value => {
                if (value !== null) {
                    this.currentTeam = value;
                    resolve(value.players.filter(player => player.isPresent));
                } else {
                    reject();
                }
            });
        });
        return promise;
    }

    public getSubstitutablePlayers(): Promise<Player[]> {
        let promise = new Promise<Player[]>((resolve, reject) => {
            console.log("Get subtitutable players");
            this.loadTeam().then(value => {
                if (value !== null) {
                    this.currentTeam = value;
                    resolve(value.players.filter(player => player.isPresent && !player.doNotSubstitute));
                } else {
                    reject();
                }
            });
        });
        return promise;
    }

    public getNotSubstitutablePlayers(): Promise<Player[]> {
        let promise = new Promise<Player[]>((resolve, reject) => {
            console.log("Get not-subtitutable players");
            this.loadTeam().then(value => {
                if (value !== null) {
                    this.currentTeam = value;
                    resolve(value.players.filter(player => player.isPresent && player.doNotSubstitute));
                } else {
                    reject();
                }
            });
        });
        return promise;
    }

    public getStartingLineup(): Promise<Player[]> {
        let promise = new Promise<Player[]>((resolve, reject) => {
            console.log("Get starting lineup");
            this.loadTeam().then(value => {
                if (value !== null) {
                    this.currentTeam = value;
                    resolve(value.players.filter(player => player.isPresent && player.inStartingFormation));
                } else {
                    reject();
                }
            });
        });
        return promise;
    }
}