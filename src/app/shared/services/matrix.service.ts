import { Matrix } from './../models/matrix.model';
import { Player } from './../models/player.model';

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

@Injectable()
export class MatrixService {
    private MATRIX = "matrix";
    private timeBlocks = [] = [];
    private currentMatrix: Matrix;

    constructor(private storage: Storage) {

    }


    loadMatrix(presentPlayers: Player[], numberOfPositionsOnTheField: number, minutesPlaying: number): Observable<Matrix> {
        // if (this.currentMatrix) {
        //     console.log("Current matrix", this.currentMatrix)
        //     return Observable.of(this.currentMatrix);
        // } else {
        return Observable.fromPromise(this.storage.get(this.MATRIX).then(value => {
            if (value != null) {
                this.currentMatrix = value;
                console.log("Loaded matrix from storage", this.currentMatrix);
            } else {
                this.currentMatrix = this.createMatrix(presentPlayers, numberOfPositionsOnTheField, minutesPlaying);
                this.storage.set(this.MATRIX, this.currentMatrix);
                console.log("Created new matrix", this.currentMatrix);
            }
            return this.currentMatrix;
        }));
        // }
    }
    public deleteMatrix(): void {
        this.storage.remove(this.MATRIX);
    }

    public resetMatrix(presentPlayers: Player[], numberOfPositionsOnTheField: number, minutesPlaying: number): Matrix {
        this.currentMatrix = this.createMatrix(presentPlayers, numberOfPositionsOnTheField, minutesPlaying);
        this.storage.set(this.MATRIX, this.currentMatrix);
        return this.currentMatrix;
    }

    /**
     * Creates the Matrix object
     * 
     * @private
     * @returns {Matrix} 
     * @memberof GameService
     */
    private createMatrix(presentPlayers: Player[], numberOfPositionsOnTheField: number, minutesPlaying: number): Matrix {

        let matrix: Matrix = new Matrix; // containter object 
        let matrixMatrix = [] = []; // the actual multidimensional array 
        let idx: number = 0;
        let counter: number = 0;

        let notSubstitutablePlayers: Player[] = presentPlayers.filter(p => p.doNotSubstitute);
        const numberOfAvailablePlayers: number = presentPlayers.length; // 8 / n
        numberOfPositionsOnTheField = numberOfPositionsOnTheField - notSubstitutablePlayers.length;
        let numberOfSubstitutablePeople: number = numberOfAvailablePlayers - notSubstitutablePlayers.length;
        const secondsPerPlayer: number = (minutesPlaying * 60) / numberOfAvailablePlayers;

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

        let starterNames: Player[] = presentPlayers.filter(p => p.inStartingFormation && !p.doNotSubstitute);
        let benchNames: Player[] = presentPlayers.filter(p => !p.inStartingFormation && !p.doNotSubstitute);

        // console.log("Pre", squad, starterNames, benchNames);
        for (let x: number = 0; x < numberOfSubstitutablePeople; x++) {
            let idx: number = starters.indexOf(x);
            //console.log(idx);
            if (idx > -1) {
                squad[x] = starterNames[0].name;
                if (starterNames.length > 1) starterNames.shift(); // remove the first element of the array
            } else {
                squad[x] = benchNames[0].name;
                if (benchNames.length > 1) benchNames.shift();
            }
        }
        // console.log("Post", squad, starterNames, benchNames);
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
        //  console.log("Matrix created", matrix)
        return matrix;
    }
}