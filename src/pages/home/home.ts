import { Player } from './../../app/shared/player.model';
import { Game } from './../../app/shared/game.model';
import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private game: Game;
  private availablePlayers: Player[] = [];
  private fieldPlayers: number;
  private substituteTimePerPlayer: moment.Moment;
  private totalTimeInMinutes: number;
  private whatWePlay: string = "helft";
  private matrix = [] = [];
  private timeBlocks = [] = []

  constructor(public navCtrl: NavController, private storage: Storage) {


  }

  /**  fires every time a page becomes the active view */
  ionViewWillEnter() {

    // check for settings, initialize default values when not present
    this.storage.get("game").then((value) => {

      if (value == null) {
        // create object with default values 
        console.log("Default Game object created");
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

      console.log("game", value);
    });

    // get players
    this.storage.get("players").then((value) => {
      if (value !== null) {
        let tmp: Player[] = [];
        tmp = value;

        // filter the available players
        this.availablePlayers = tmp.filter(player => player.isPresent && !player.doNotSubstitute);
        if (this.availablePlayers.length == 0) {
          // TODO: Warn user there are no players ready 
        }
      } else {
        // TODO: Warn user there are no players stored
      }

      if (this.availablePlayers.length >= this.fieldPlayers) {

        console.log("Can start")
        this.createMatrix();
      }
    });
  }
  /**  Create multidimensional array that holds the matrix of players */
  createMatrix(): void {

    // randomize player list
    let players: Player[] = this.availablePlayers.sort(function (a, b) { return 0.5 - Math.random() });

    let n: number = players.length; // 8
    let p: number = this.game.fieldPlayers; // 5
    let idx: number = 0;
    let counter: number = 0;
    const secondsPerPlayer: number = (this.totalTimeInMinutes * 60) / n;
    this.matrix = []; // clear array 
    this.timeBlocks = []; // clear array

      // create the timeBlocks array 
    for (let y: number = 1; y <= n; y++) {      
      let seconds: number = secondsPerPlayer * y;
      let mm: moment.Moment = moment("1900-01-01 00:00:00");
      mm.add(seconds, "seconds");
      this.timeBlocks.push(mm.format("mm:ss"));

    }
     
    // create the matrix
    for (let i:number = 0; i < p; i++) {
           // create n rows (1 for every field player)
           let row = [];

           // create p columns (1 for every available player)
           for (let x:number = 0; x < n; x++) {

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

  getStartOpstelling(): any {


      let column = [];
      for (var i = 0; i < this.matrix.length; i++) {
        column.push(this.matrix[i][0]);
      }
      return column;
   
}


  playTimePerPlayer(): string {
    var playTime = this.totalTimeInMinutes / (this.availablePlayers.length * this.fieldPlayers);
    var mm = moment("1900-01-01 00:00:00");
    mm.add(playTime * 60, "seconds");
    return mm.format("mm:ss");
  }

  //             

  //             return 
  //         }

  // storage.get("game").then((value) => {

  // /*
  // cope.setGame = "helft";
  //         if (game.fullGame === "yes") {
  //             $scope.setGame = "wedstrijd";
  //         }

  //         // get all present players and store them in a variable
  //         $scope.availablePlayers = $filter("filter")(game.players, { present: "1" });
  //         // console.log("availablePlayers", $scope.availablePlayers);

  //         // calculate the playing time per player
  //         $scope.playTimePerPlayer = function () {
  //             var playTime = $scope.totalTime() / $scope.availablePlayers.length * game.fieldPlayers;
  //             var mm = new moment("1900-01-01 00:00:00");

  //             mm.add(playTime * 60, "seconds");

  //             return mm.format("mm:ss");
  //         }

  //         // calculate the substitute time per player
  //         $scope.substituteTimePerPlayer = function () {
  //             var t = $scope.totalTime() - ($scope.totalTime() / $scope.availablePlayers.length * game.fieldPlayers);
  //             var mm = new moment("1900-01-01 00:00:00");

  //             mm.add(t * 60, "seconds");

  //         // get gameobject from storage
  //         va
  //             return mm.format("mm:ss");
  //         }

  //         // calculate the total time used for calculations
  //         $scope.totalTime = function () {
  //             var totalTime = game.minutesPerHalf;
  //             if (game.fullGame === "yes") {
  //                 totalTime = game.minutesPerHalf * 2;
  //             }
  //             return totalTime;
  //         }

  //         // (re)init the arrats
  //         $scope.matrix = [];
  //         $scope.timeBlocks = [];

  //         /**
  //          * Schedule the players
  //          */
  //     $scope.schedule = function () {

  //       console.log("Schedule");
  //       $scope.matrix = [];// reset
  //       $scope.timeBlocks = []; // reset

  //       // create multidimensional array that holds the matrix of players 
  //       var players = $scope.availablePlayers.sort(function (a, b) { return 0.5 - Math.random() }); // randomize list TODO: Create button to randomize

  //       var n = players.length; // 8
  //       var p = game.fieldPlayers; // 5
  //       var idx = 0;
  //       var counter = 0;




  //     var timer;

  // */    




}
