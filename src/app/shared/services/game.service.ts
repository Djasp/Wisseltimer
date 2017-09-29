import { Game } from './../models/game.model';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

@Injectable()
export class GameService {
    private currentGame: Game;
    private GAME = "game";

    constructor(private storage: Storage) { }

    loadGame(): Observable<Game> {

        return Observable.fromPromise(this.storage.get(this.GAME).then(value => {
            if (value != null) {
                this.currentGame = value;
                console.log("Loaded game from storage", value, this.currentGame);
            } else {
                this.currentGame = new Game();
                this.saveGame(this.currentGame);
                console.log("Created new game", this.currentGame);
            }
            return this.currentGame;
        }));
    }

    // /**
    //  * Get the names of the players that are on the field at the given index
    //  * 
    //  * @param {Matrix} matrix 
    //  * @param {number} col 
    //  * @returns {string[]} 
    //  * @memberof GameService
    //  */
    // public getCurrentPitch(matrix: Matrix, players: Player[], col: number) {
    //     let playerNamesOnTheField: string[] = []
    //     if (matrix !== undefined) {
    //         playerNamesOnTheField = matrix.matrix.map(function (value, index) { return value[col]; });
    //         let notSubstitutablePlayers: Player[] = players.filter(p => p.isPresent && p.doNotSubstitute);

    //         notSubstitutablePlayers.forEach(element => {
    //             playerNamesOnTheField.push(element.name);
    //         });
    //     }
    //     return Observable.of(playerNamesOnTheField);
    // }

    // public getCurrentBench(matrix: Matrix, players: Player[], col: number): string[] {

    //     let playerNamesOnTheBench: string[] = [];
    //     if (matrix !== undefined) {
    //         let playerNamesOnTheField: string[] = matrix.matrix.map(function (value, index) { return value[col]; });
    //         let notSubstitutablePlayers: Player[] = players.filter(p => p.isPresent && p.doNotSubstitute);
    //         notSubstitutablePlayers.forEach(element => {
    //             playerNamesOnTheField.push(element.name);
    //         });


    //         let bench = players.filter(p => p.isPresent && playerNamesOnTheField.indexOf(p.name) == -1);

    //         bench.forEach(element => {
    //             playerNamesOnTheBench.push(element.name);
    //         });
    //     }
    //     return playerNamesOnTheBench;
    // }


    /**
     * Mark the formation as done. The trainer has decided on the starting squad
     * 
     * @memberof GameService
     */
    public markFormationDone(): void {

        if (this.currentGame != undefined) {
            this.currentGame.formationDone = true;
            this.currentGame.actualFormationDoneTime = moment();
            this.currentGame.actualGameStartedTime = null;
            this.currentGame.gameTime = null;
            this.currentGame.gamePaused = false;
            this.currentGame.gameStarted = false;

            // hack. Remove the matrix when present in storage. 
            // ideally this would be a method call to the matrixService
            // but this will do for now
            this.storage.remove("matrix");

            // save this game 
            this.saveGame(this.currentGame);
        }
    }

    /**
     * Save the game to the database
     * 
     * @param {Game} game 
     * @memberof GameService
     */
    saveGame(game: Game): void {
        console.log("Save game", game);
        // save the settings object to the storage
        this.storage.set(this.GAME, game);
    }
}