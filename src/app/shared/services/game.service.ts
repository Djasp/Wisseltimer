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
import * as _ from 'underscore';

@Injectable()
export class GameService {
    private currentGame: Game;
    private currentSettings: Settings;
    private currentTeam: Team;
    public currentIndex: number = 0;
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

    /**
     * 
     * 
     * @returns {Promise<Matrix>} 
     * @memberof GameService
     */
    public getMatrix(): Promise<Matrix> {
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
                        console.log("Created matrix", matrix);
                    }
                    resolve(matrix);
                });
        });
        return promise;
    }

    public clearMatrix(): Promise<void> {
        let promise = new Promise<void>((resolve, reject) => {
            this.storage.remove("gameMatrix")
                .then(
                () => resolve(),
                () => reject()
                );
        });
        return promise;
    }

    public resetMatrix(): Promise<Matrix> {
        let matrix: Matrix = this.createMatrix();

        let promise = new Promise<Matrix>((resolve, reject) => {
            this.storage.set("gameMatrix", matrix).then(() =>
                resolve(matrix)
            );
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

        let matrix: Matrix = new Matrix; // containter object 
        let matrixMatrix = [] = []; // the actual multidimensional array 
        let totalTimeInMinutes: number;
        let idx: number = 0;
        let counter: number = 0;

        let players: Player[] = this.currentTeam.players.filter(p => p.isPresent);
        let notSubstitutablePlayers: Player[] = players.filter(p => p.doNotSubstitute);

        const numberOfAvailablePlayers: number = players.length; // 8 / n
        let numberOfPositionsOnTheField: number = this.currentSettings.fieldPlayers; // 6
        numberOfPositionsOnTheField = numberOfPositionsOnTheField - notSubstitutablePlayers.length;
        let numberOfSubstitutablePeople: number = numberOfAvailablePlayers - notSubstitutablePlayers.length;


        // time that is played
        totalTimeInMinutes = this.currentSettings.minutesPerHalf;
        if (this.currentSettings.fullGame) {
            totalTimeInMinutes = totalTimeInMinutes * 2;
        }
        const secondsPerPlayer: number = (totalTimeInMinutes * 60) / numberOfAvailablePlayers;

        // create the timeBlocks array. Each item marks the END of the period where 
        // a player is on the sideline 
        matrix.timeBlocks = [];
        for (let y: number = 1; y <= numberOfAvailablePlayers; y++) {
            let seconds: number = secondsPerPlayer * y;
            matrix.timeBlocks.push(moment("1900-01-01 00:00:00").add(seconds, "seconds"));
        }

        // create the matrix. Fill the field with numbers that are to be  replaced with actual player names 
        matrixMatrix = [];
        for (let i: number = 0; i < numberOfPositionsOnTheField; i++) {
            // create n rows (1 for every substitutable field player)
            let row = [];

            // create p columns (1 for every available player)
            for (let x: number = 0; x < numberOfSubstitutablePeople; x++) {

                // store the player name in the row
                row.push(idx);
                counter++;

                // go to next player after n iterations
                if (counter === numberOfPositionsOnTheField) {
                    counter = 0;
                    idx++;
                }
            }
            matrixMatrix.push(row); // store the row in the matrix
        }

        // now, get the first column from the matrix. In this array are the indexes of the 
        // starting squad. we now have to replace these with the names of the starting players. 
        let starters = [] = matrixMatrix.map(function (value, index) { return value[0]; });

        // create an array with a given size and a value of 'undefined' 
        // so we can iterate it.
        let squad: string[] = Array.apply(null, Array(numberOfSubstitutablePeople)).map(function () { })

        let starterNames: Player[] = players.filter(p => p.inStartingFormation && !p.doNotSubstitute);
        let benchNames: Player[] = players.filter(p => !p.inStartingFormation && !p.doNotSubstitute);

        console.log("Pre", squad, starterNames, benchNames);
        for (let x: number = 0; x < numberOfSubstitutablePeople; x++) {
            let idx: number = starters.indexOf(x);
            console.log(idx);
            if (idx > -1) {
                squad[x] = starterNames[0].name;
                if (starterNames.length > 1) starterNames.shift(); // remove the first element of the array
            } else {
                squad[x] = benchNames[0].name;
                if (benchNames.length > 1) benchNames.shift();
            }
        }
        console.log("Post", squad, starterNames, benchNames);
        // loop through the matrix and replace all digits with names 
        for (let i: number = 0; i < numberOfPositionsOnTheField; i++) {

            for (let x: number = 0; x < numberOfAvailablePlayers; x++) {
                let value = matrixMatrix[i][x];
                if (!isNaN(parseInt(value))) { // only replace digits
                    matrixMatrix[i][x] = squad[value]; // replace the digit in the array with the name on the corresponding index
                }
            }
        }

        matrix.matrix = matrixMatrix;
        console.log("Matrix created", matrix)
        return matrix;
    }

    /**
     * Get the names of the players that are on the field at the given index
     * 
     * @param {Matrix} matrix 
     * @param {number} col 
     * @returns {string[]} 
     * @memberof GameService
     */
    public getCurrentPitch(matrix: Matrix, col: number): string[] {
        let playerNamesOnTheField: string[] = []
        if (matrix !== undefined) {
            playerNamesOnTheField = matrix.matrix.map(function (value, index) { return value[col]; });
            let notSubstitutablePlayers: Player[] = this.currentTeam.players.filter(p => p.isPresent && p.doNotSubstitute);

            notSubstitutablePlayers.forEach(element => {
                playerNamesOnTheField.push(element.name);
            });
        }
        return playerNamesOnTheField;
    }

    public getCurrentBench(matrix: Matrix, col: number): string[] {


        let playerNamesOnTheBench: string[] = [];
        if (matrix !== undefined) {
            let playerNamesOnTheField: string[] = matrix.matrix.map(function (value, index) { return value[col]; });
            let notSubstitutablePlayers: Player[] = this.currentTeam.players.filter(p => p.isPresent && p.doNotSubstitute);
            notSubstitutablePlayers.forEach(element => {
                playerNamesOnTheField.push(element.name);
            });


            let bench = this.currentTeam.players.filter(p => p.isPresent && playerNamesOnTheField.indexOf(p.name) == -1);

            bench.forEach(element => {
                playerNamesOnTheBench.push(element.name);
            });
        }
        return playerNamesOnTheBench;
    }

    /**
     * 
     * 
     * @returns {Promise<Game>} 
     * @memberof GameService
     */
    public markFormationDone(): Promise<Game> {

        let promise = new Promise<Game>((resolve, reject) => {

            this.loadGame().then(value => {
                if (value !== null) {
                    this.currentGame = value;
                    this.currentGame.formationDone = true;
                    this.currentGame.actualFormationDoneTime = moment();
                    this.currentGame.gameTime = null;
                    this.currentGame.gamePaused = false;
                    this.currentGame.gameStarted = false;
                    this.resetMatrix().then(() => {
                        this.saveGame(this.currentGame).then( // store the game
                            () => resolve(this.currentGame),
                            () => reject()
                        )
                    });
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