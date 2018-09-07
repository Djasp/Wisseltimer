import { Player } from './../models/player.model';
import { Team } from './../models/team.model';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

@Injectable()
export class TeamService {
    TEAM = "team";
    currentTeam: Team;

    constructor(public storage: Storage) { }

    /**
     * Load the team from the database 
     * 
     * @returns {Team} 
     * @memberof TeamService
     */

    loadTeam(): Observable<Team> {

        return Observable.fromPromise(this.storage.get(this.TEAM).then(value => {
            if (value != null) {
                this.currentTeam = value;
                console.log("Loaded team", this.currentTeam);
            } else {
                this.currentTeam = new Team();
                this.saveTeam(this.currentTeam);
                console.log("Created team", this.currentTeam);
            }
            return this.currentTeam;
        }));
    }

    /**
     * Save the team to the database
     * 
     * @param {Team} team 
     * @memberof TeamService
     */
    saveTeam(team: Team): void {
        console.log("Save team", team);
        this.storage.set(this.TEAM, team)
    }

    /**
     * Toggle the attendance of a player
     * 
     * @param {Player} player 
     * @returns {Promise<Team>} 
     * @memberof TeamService
     */
    togglePlayerAttendance(player: Player): void {
        console.log("Toggle player present", player);

        let index: number = this.currentTeam.players.map(function (e) { return e.name; }).indexOf(player.name);
        player.isPresent = !player.isPresent; // toggle                    
        this.currentTeam.players[index] = player;
        this.saveTeam(this.currentTeam);

    }

    /**
     * Toggle the starting formation of a player
     * 
     * @param {Player} player 
     * @returns {Promise<Team>} 
     * @memberof TeamService
     */
    togglePlayerInStartingFormation(player: Player): void {
        console.log("Toggle player in starting formation", player);

        let index: number = this.currentTeam.players.map(function (e) { return e.name; }).indexOf(player.name);
        player.inStartingFormation = !player.inStartingFormation; // toggle                    
        this.currentTeam.players[index] = player;
        this.saveTeam(this.currentTeam);
    }

    /**
     * Toggle the do not substitute status of a player
     * 
     * @param {Player} player 
     * @memberof TeamService
     */
    togglePlayerDoNotSubstitute(player: Player): void {
        console.log("Toggle player do not substitute", player);

        let index: number = this.currentTeam.players.map(function (e) { return e.name; }).indexOf(player.name);
        player.doNotSubstitute = !player.doNotSubstitute; // toggle                    
        this.currentTeam.players[index] = player;
        this.saveTeam(this.currentTeam);
    }

    /**
     * Add a player to the team
     * 
     * @param {Player} player 
     * @returns {Promise<Team>} 
     * @memberof TeamService
     */
    addPlayer(player: Player): void {
        // let saved: boolean;
        console.log("Add player to team", player, this.currentTeam);
        
        this.currentTeam.players.push(player);
        this.saveTeam(this.currentTeam);

    }

    /**
     * Remove a player from the team
     * 
     * @param {Player} player 
     * @returns {Promise<Team>} 
     * @memberof TeamService
     */
    deletePlayer(player: Player): void {
        console.log("Delete player from team", player, this.currentTeam);

        var index = this.currentTeam.players.indexOf(player); // get the index of the player to be deleted 
        this.currentTeam.players.splice(index, 1); // remove from array;
        this.saveTeam(this.currentTeam);
    }

    public getAllPlayers(): Observable<Player[]> {
        console.log("Get all players");
        // return Observable.of(this.currentTeam.players);

        return this.loadTeam().map((data: Team) => {
            return data.players;
        });
    }

    public getPresentPlayers(): Observable<Player[]> {
        //  return Observable.of(this.currentTeam.players.filter(player => player.isPresent));

        return this.loadTeam().map((data: Team) => {
            console.log("Get present players", data);

            if (data.players == undefined) return null;
            return data.players.filter(player => player.isPresent);
        });
    }

    public getSubstitutablePlayers(): Observable<Player[]> {
        console.log("Get subtitutable players");
        // return Observable.of(this.currentTeam.players.filter(player => player.isPresent && !player.doNotSubstitute));

        return this.loadTeam().map((data: Team) => {
            if (data.players == undefined) return null;
            return data.players.filter(player => player.isPresent && !player.doNotSubstitute);
        });
    }

    public getNotSubstitutablePlayers(): Observable<Player[]> {
        console.log("Get not-subtitutable players");
        // return Observable.of(this.currentTeam.players.filter(player => player.isPresent && player.doNotSubstitute));

        return this.loadTeam().map((data: Team) => {
            if (data.players == undefined) return null;
            return data.players.filter(player => player.isPresent && player.doNotSubstitute);
        });
    }

    public getStartingLineup(): Observable<Player[]> {
        console.log("Get starting lineup");
        // return Observable.of(this.currentTeam.players.filter(player => player.isPresent && player.inStartingFormation));

        return this.loadTeam().map((data: Team) => {
            if (data.players == undefined) return null;
            return data.players.filter(player => player.isPresent && player.inStartingFormation);
        });
    }
}