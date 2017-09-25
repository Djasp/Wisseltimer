import { Player } from './../models/player.model';
import { Settings } from './../models/settings.model';
import { SettingsService } from './settings.service';
import { TeamService } from './team.service';
import { Game } from './../models/game.model';
import { Team } from './../models/team.model';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class GameService {
    currentGame: Game;
    currentSettings: Settings;
    currentTeam: Team;

    constructor(private storage: Storage, private teamService: TeamService, private settingsService: SettingsService) {

        // load settings
        this.settingsService.loadSettings().then(value => {
            this.currentSettings = value;
        });

        // load team 
        this.teamService.loadTeam().then(value => {
            this.currentTeam = value;
        })
    }

    getPresentPlayers(): Player[] {
        return this.currentTeam.players.filter(player => player.isPresent);
    }

    getSubstitutablePlayers(): Player[] {
        return this.getPresentPlayers().filter(player => !player.doNotSubstitute);
    }

    getNotSubstitutablePlayers(): Player[] {
        return this.getPresentPlayers().filter(player => player.doNotSubstitute);
    }


    markFormationDone(): Promise<Game> {

        let promise = new Promise<Game>((resolve, reject) => {

            this.loadGame().then(value => {
                if (value !== null) {
                    this.currentGame = value;

                    this.saveGame(this.currentGame).then( // store the game
                        () => resolve(this.currentGame),
                        () => reject()
                    );
                }
            });
        });
        return promise;

    }

    /**
     * Load the game from the database 
     * 
     * @returns {Game} 
     * @memberof GameService
     */
    loadGame(): Promise<Game> {
        // create new promise 
        let promise = new Promise<Game>((resolve, reject) => {
            // get settings object from storage 
            this.storage.get("game")
                .then(value => {
                    if (value != null) {
                        this.currentGame = new Game(value);
                        console.log("Loaded game", this.currentGame);
                    }
                    resolve(this.currentGame);
                });
        });
        return promise;
    }

    /**
     * Save the settings to the database
     * 
     * @param {Game} settings 
     * @memberof GameService
     */
    saveGame(game: Game): Promise<any> {
        // let saved: boolean;
        let promise = new Promise<Game>((resolve, reject) => {
            console.log("Save game", game);
            // save the settings object to the storage
            this.storage.set("game", game).then(
                () => resolve(),
                () => reject()
            );
        });
        return promise;
    }
}