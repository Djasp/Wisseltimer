import { Substitute } from './../../app/shared/substitute.model';
import { Player } from './../../app/shared/player.model';
import { Game } from './../../app/shared/game.model';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular';

import moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private game: Game;
  private availablePlayers: Player[] = [];
  private nonSubstitutablePlayers: Player[] = [];
  private fieldPlayers: number;
 // private substituteTimePerPlayer: moment.Moment;
  private totalTimeInMinutes: number;
  private whatWePlay: string = "helft";
  private matrix = [] = [];
  private timeBlocks = [] = []
  private totalPlayers: number;

  constructor(public navCtrl: NavController, private storage: Storage, public toastCtrl: ToastController) {
  }

  /**  fires every time a page becomes the active view */
  ionViewWillEnter() {

    // check for settings, initialize default values when not present
    this.storage.get("game").then((value) => {

      if (value == null) {
        // create object with default values 
       //  console.log("Default Game object created");
        this.storage.set("game", new Game());
      } else {
        // get the game object 
        this.game = value;

        // assign local variables
        this.fieldPlayers = this.game.fieldPlayers; // number of players 

        this.totalTimeInMinutes = this.game.minutesPerHalf; // time that is played
        if (this.game.fullGame) {
          this.totalTimeInMinutes = this.game.minutesPerHalf * 2;
          this.whatWePlay = "wedstrijd";
        }
      }
      //console.log("game", value);
    });

    // get players
    this.storage.get("players").then((value) => {
      if (value !== null) {
        let tmp: Player[] = [];
        tmp = value;
 
        // filter the available players
        this.availablePlayers = tmp.filter(player => player.isPresent && !player.doNotSubstitute);
       
        // filter the non substitutable players
        this.nonSubstitutablePlayers = tmp.filter(player => player.isPresent && player.doNotSubstitute);
       
      } else {
       
        // now, for debugging, we add some fake players 
        this.availablePlayers.push(new Player("Cas"));
        this.availablePlayers.push(new Player("Daan"));
        this.availablePlayers.push(new Player("Davi"));
        this.availablePlayers.push(new Player("Luuk"));
        this.availablePlayers.push(new Player("Nikey"));
        this.availablePlayers.push(new Player("Mouhand"));
        this.availablePlayers.push(new Player("Nikki"));
        this.availablePlayers.push(new Player("Maes"));
        this.availablePlayers.push(new Player("Seb"));
        this.storage.set("players", this.availablePlayers); // save 
      }

      // calculate the number of players on the pitch. Must be equal or more than the number of field players
      this.totalPlayers = this.availablePlayers.length + this.nonSubstitutablePlayers.length;

      if (this.totalPlayers >= this.fieldPlayers) {

        this.createMatrix();
      } else {
        // Warn when play can not start 
        let toast = this.toastCtrl.create({
          message: 'Er zijn te weinig spelers om te starten.',
          duration: 3000,
          position: 'top'       
        });
        toast.present();
      }
    });
  }
  /**  Create multidimensional array that holds the matrix of players */
  createMatrix(): void {

    // randomize player list
    let players: Player[] = this.availablePlayers.sort(function (a, b) { return 0.5 - Math.random() });

    let n: number = players.length; // 8
    let p: number = this.game.fieldPlayers; // 6

    if (this.nonSubstitutablePlayers.length > 0) {
      p = p - this.nonSubstitutablePlayers.length;
    }

    let idx: number = 0;
    let counter: number = 0;
    const secondsPerPlayer: number = (this.totalTimeInMinutes * 60) / n;
    this.matrix = []; // clear array 
    this.timeBlocks = []; // clear array

    // create the timeBlocks array 
    for (let y: number = 1; y < n; y++) {
      let seconds: number = secondsPerPlayer * y;
      let mm: moment.Moment = moment("1900-01-01 00:00:00");
      mm.add(seconds, "seconds");
      this.timeBlocks.push(mm.format("mm:ss"));

    }

    // create the matrix
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
      this.matrix.push(row); // store the row in the matrix
    }

    console.log("Matrix", this.matrix)
  }

  getOpstelling(col: number): Substitute[] {

    let substitutes: Substitute[] = [];
    let p: number = this.game.fieldPlayers; // 6

    if (this.nonSubstitutablePlayers.length > 0) {
      p = p - this.nonSubstitutablePlayers.length;
    }

    if (col == 0) {
      // get the starting pitch       
      let players = this._getPlayers(0);
      for (let i: number = 0; i < players.length; i++) {
        substitutes.push(new Substitute(players[i], false)); // all players are 'in'
      }

    } else {

      let current: string[] = this._getPlayers(col); // get all players now on pitch 
      let previous: string[] = this._getPlayers(col - 1); // get all players previously on pitch

      // match all players against the previous
      for (let i: number = 0; i < p; i++) {
        if (current[i] != previous[i]) {
          substitutes.push(new Substitute(current[i], false)); // in
          substitutes.push(new Substitute(previous[i], true)); // out
        }
      }
    }
    return substitutes;
  }

  private _getPlayers(col: number): string[] {
    let column = [];
    for (let i: number = 0; i < this.matrix.length; i++) {
      column.push(this.matrix[i][col]);
    }
    return column;
  }

  // playTimePerPlayer(): string {
  //   var playTime = this.totalTimeInMinutes / (this.availablePlayers.length * this.fieldPlayers);
  //   var mm = moment("1900-01-01 00:00:00");
  //   mm.add(playTime * 60, "seconds");
  //   return mm.format("mm:ss");
  // }
}
