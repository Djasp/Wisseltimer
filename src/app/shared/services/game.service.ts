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