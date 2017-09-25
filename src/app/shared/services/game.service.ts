import { Matrix } from './../models/matrix.model';
import { Player } from './../models/player.model';
import { Settings } from './../models/settings.model';
import { SettingsService } from './settings.service';
import { TeamService } from './team.service';
import { Game } from './../models/game.model';
import { Team } from './../models/team.model';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import moment from 'moment';

@Injectable()
export class GameService {
    private currentGame: Game;
    private currentSettings: Settings;
    private currentTeam: Team;
    private currentIndex: number;
    private timeBlocks = [] = [];
    private matrix: Matrix;

    constructor(private storage: Storage, private teamService: TeamService, private settingsService: SettingsService) {

        // load settings
        this.settingsService.loadSettings().then(value => {
            this.currentSettings = value;
        });

        // load team 
        this.teamService.loadTeam().then(value => {
            this.currentTeam = value;
        })

        // load game and matrix 
        this.loadGame().then(value => {
            console.log(this.currentGame); // current game is now loaded

            if (this.currentGame.formationDone) {
                this.getMatrix().then(value => {
                    this.matrix = value;
                });
            }
        });

    }

    public getPresentPlayers(): Player[] {
        return this.currentTeam.players.filter(player => player.isPresent);
    }

    public getSubstitutablePlayers(): Player[] {
        return this.getPresentPlayers().filter(player => !player.doNotSubstitute);
    }

    public getNotSubstitutablePlayers(): Player[] {
        return this.getPresentPlayers().filter(player => player.doNotSubstitute);
    }

    public getStartingLineup(): Player[] {
        return this.getPresentPlayers().filter(player => player.isPresent && player.inStartingFormation);
    }

    private getMatrix(): Promise<Matrix> {
        let matrix: Matrix;
        let promise = new Promise<Matrix>((resolve, reject) => {
            // get settings object from storage 
            this.storage.get("gameMatrix")
                .then(value => {
                    if (value != null) {
                        matrix = value;
                        console.log("Loaded matrix", matrix);
                    }
                    else {
                        matrix = this.createMatrix();
                        this.storage.set("gameMatrix", matrix);
                    }
                    resolve(matrix);
                });
        });
        return promise;
    }

    /**
     * Creates the Matrix object
     * 
     * @private
     * @returns {Matrix} 
     * @memberof GameService
     */
    private createMatrix(): Matrix {

        let players: Player[] = this.getSubstitutablePlayers();
        let startingLineUp: Player[] = this.getPresentPlayers();
        let matrix: Matrix = new Matrix; // containter object 
        let matrixMatrix = [] = []; // the actual multidimensional array 

        let totalTimeInMinutes: number;

        console.log("Creating matrix");
        // console.log("Creating matrix", this.availablePlayers, this.nonSubstitutablePlayers, players);

        let n: number = players.length; // 8
        let p: number = this.currentSettings.fieldPlayers; // 6

        let idx: number = 0;
        let counter: number = 0;

        // time that is played
        totalTimeInMinutes = this.currentSettings.minutesPerHalf;
        if (this.currentSettings.fullGame) {
            totalTimeInMinutes = totalTimeInMinutes * 2;
        }
        const secondsPerPlayer: number = (totalTimeInMinutes * 60) / n;

        // create the timeBlocks array
        for (let y: number = 1; y <= n; y++) {
            let seconds: number = secondsPerPlayer * y;
            let mm: moment.Moment = moment("1900-01-01 00:00:00");
            mm.add(seconds, "seconds");
            matrix.timeBlocks.push(mm);
        }

        // create the matrix
        p = p - this.getNotSubstitutablePlayers().length;

        let squad: string[] = [];

        for (let i: number = 0; i < p; i++) {
            // create n rows (1 for every field player)
            let row = [];

            // create p columns (1 for every available player)
            for (let x: number = 0; x < n; x++) {

                // store the player name in the row
                row.push(players[idx].name);
                counter++;

                // go to next player after p iterations
                if (counter === p) {
                    counter = 0;
                    idx++;
                }
            }
            matrixMatrix.push(row); // store the row in the matrix
        }

        matrix.matrix = matrixMatrix;
        console.log("Matrix created", matrix)
        return matrix;
    }

    /**
     * 
     * 
     * @returns {Promise<Game>} 
     * @memberof GameService
     */
    markFormationDone(): Promise<Game> {

        let promise = new Promise<Game>((resolve, reject) => {

            this.loadGame().then(value => {
                if (value !== null) {
                    this.currentGame = value;
                    this.currentGame.formationDone = true;
                    this.currentGame.actualFormationDoneTime = moment();
                    this.currentGame.gameTime = null;
                    this.currentGame.gamePaused = false;
                    this.currentGame.gameStarted = false;

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