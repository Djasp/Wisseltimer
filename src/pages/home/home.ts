import { MatrixService } from './../../app/shared/services/matrix.service';
import { Matrix } from './../../app/shared/models/matrix.model';
import { Team } from './../../app/shared/models/team.model';
import { GameService } from './../../app/shared/services/game.service';
import { TeamService } from './../../app/shared/services/team.service';
import { Settings } from './../../app/shared/models/settings.model';
import { SettingsService } from './../../app/shared/services/settings.service';
import { Substitute } from './../../app/shared/substitute.model';
import { AttendancePage } from './../attendance/attendance';
import { Player } from './../../app/shared/models/player.model';
import { Game } from './../../app/shared/models/game.model';
import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular';
import { Subscription } from "rxjs";
import { Observable } from 'rxjs/Observable';
import { TimerObservable } from "rxjs/observable/TimerObservable";

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  private DATE_MIN_VALUE: string = "1900-01-01 00:00:00";
  private selectedItem: any;
  // public game: Game;
  // private availablePlayers: Player[] = [];
  // private fieldPlayers: number;
  // private substituteTimePerPlayer: moment.Moment;
  // private totalTimeInMinutes: number;
  // private matrix = [] = [];
  // private timeBlocks = [] = []
  // private nonSubstitutablePlayers: Player[] = [];
  // private totalPlayers: number;
  private formationDone: boolean = false;
  // private gameStarted: boolean = false;
  // private actualGameStartedTime: moment.Moment = null;
  private timer: Observable<number>;
  private currentGameTime: moment.Moment = moment(this.DATE_MIN_VALUE);
  private saveCounter: number = 0;
  // private gamePaused: boolean = false;
  private timerSubscription: Subscription;
  private currentIndex: number = 0;
  // private whatWePlay: string = "helft";
  // private currentSettings: Settings;
  private currentGame: Game;
  // private currentTeam: Team;
  private currentMatrix: Matrix;
  // // private actualFormationDoneTime: moment.Moment = null;

  private currentPitch: string[] = [];
  private currentBench: string[] = [];

  private currentTeam: Team;
  private allowStart: boolean = false;
  private presentPlayers: Player[] = [];
  private currentSettings: any;
  // private current

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController, private alertCtrl: AlertController,
    private teamService: TeamService,
    private gameService: GameService,
    private settingsService: SettingsService,
    private matrixService: MatrixService) {
    this.selectedItem = navParams.get('item');
  }



  /**  fires every time a page becomes the active view */
  ionViewWillEnter() {
    this.updateRoster();
  }

  // combine the different observables into one subscription
  updateRoster(): void {
    Observable.combineLatest(
      this.gameService.loadGame(),
      this.teamService.loadTeam(),
      this.settingsService.loadSettings()
    ).subscribe((data: any[]) => {
      this.currentGame = data[0];
      this.currentTeam = data[1];
      this.currentSettings = data[2];

      // set flags
      this.formationDone = this.currentGame.formationDone;
      this.allowStart = (this.currentTeam.players != undefined && this.currentTeam.players.length > 0);
      this.presentPlayers = this.currentTeam.players.filter(p => p.isPresent);

      // get or create matrix
      if (this.formationDone) {

        this.matrixService.loadMatrix(
          this.presentPlayers,
          this.currentSettings.fieldPlayers,
          this.currentSettings.minutesPerHalf
        ).subscribe((data: Matrix) => {
          // get matrix 
          this.currentMatrix = data;

          // get the players that are currently supposed to be on the field 
          this.getCurrentPitch().subscribe((data) => {
            this.currentPitch = data;
          });

          // get the players that are currently supposed to be on the bench
          this.getCurrentPitch().subscribe((data) => {
            this.currentPitch = data;
          });
        });
      }
    });
  }

  /**
   * Get the players that are now supposed to be on the field
   * 
   * @returns {Observable<string[]>} 
   * @memberof HomePage
   */
  public getCurrentPitch(): Observable<string[]> {
    let n: number = this.currentIndex;

    let playerNamesOnTheField: string[] = this.currentMatrix.matrix.map(function (value, index) { return value[n]; });
    let notSubstitablePlayers: Player[] = this.currentTeam.players.filter(p => p.isPresent && p.doNotSubstitute);

    notSubstitablePlayers.forEach(element => {
      playerNamesOnTheField.push(element.name);
    });
    console.log("Gameservice - getCurrentPitch", playerNamesOnTheField, n);

    return Observable.of(playerNamesOnTheField);
  }


  // // check for settings, initialize default values when not present
  // this.storage.get("game").then((value) => {

  //   if (value == null) {
  //     // create object with default values 
  //     console.log("Default Game object created");
  //     this.storage.set("game", new Game());

  //   } else {
  //     // get the game object 
  //     this.game = value;

  //     // assign local variables
  //     this.fieldPlayers = this.settings.fieldPlayers; // number of players 
  //     this.gameStarted = this.game.gameStarted;
  //     this.gamePaused = this.game.gamePaused;
  //     if (this.game.gameTime != null) {
  //       this.gameTime = moment(this.game.gameTime);
  //     }

  //     if (this.gameStarted && this.timerSubscription == null) {
  //       this.startTimer();
  //     }

  //     if (this.game.formationDone) {
  //       // check if formation was done more than 50 minutes ago. If so, reset it. 
  //       if (this.game.actualFormationDoneTime != null && moment(this.game.actualFormationDoneTime).isBefore(moment().subtract(60, 'minutes'))) {
  //         this.formationDone = false;

  //         // also store in gameobject
  //         this.game.formationDone = false;
  //         this.game.actualFormationDoneTime = null;
  //         this.storage.set("game", this.game);

  //       } else {
  //         this.formationDone = this.game.formationDone
  //       }
  //     }
  //     this.totalTimeInMinutes = this.settings.minutesPerHalf; // time that is played
  //     if (this.settings.fullGame) {
  //       this.totalTimeInMinutes = this.settings.minutesPerHalf * 2;
  //       this.whatWePlay = "wedstrijd";
  //     }
  //   }
  //   console.log("Game", value);
  //});

  // // get players
  // this.storage.get("players").then((value) => {

  //   console.log("Value", value);

  //   if (value !== null) {
  //     let tmp: Player[] = [];
  //     tmp = value;

  //     // filter the available players
  //     this.availablePlayers = tmp.filter(player => player.isPresent && !player.doNotSubstitute);

  //     // filter the non substitutable players 
  //     this.nonSubstitutablePlayers = tmp.filter(player => player.isPresent && player.doNotSubstitute);

  //   } else {
  //     // now, for debugging, we add some fake players       
  //     this.availablePlayers.push(new Player("Cas"));
  //     this.availablePlayers.push(new Player("Daan"));
  //     this.availablePlayers.push(new Player("Davi"));
  //     this.availablePlayers.push(new Player("Luuk"));
  //     this.availablePlayers.push(new Player("Nikey"));
  //     this.availablePlayers.push(new Player("Mouhand"));
  //     this.availablePlayers.push(new Player("Nikki"));
  //     this.availablePlayers.push(new Player("Maes"));
  //     this.availablePlayers.push(new Player("Seb"));

  //     this.storage.set("players", this.availablePlayers); // save 
  //   }
  //   // calculate the number of players on the pitch. Must be equal or more than the number of field players      
  //   this.totalPlayers = this.availablePlayers.length + this.nonSubstitutablePlayers.length;

  //   if (this.totalPlayers >= this.fieldPlayers) {

  //     console.log("wtf");
  //     this.createMatrix();

  //   } else {
  //     // Warn when play can not start         
  //     let toast = this.toastCtrl.create({
  //       message: 'Er zijn te weinig spelers om te starten.',
  //       duration: 3000,
  //       position: 'top'
  //     });
  //     toast.present();
  //   }
  // });



  // /**
  //  * 
  //  * 
  //  * @returns {string[]} 
  //  * @memberof HomePage
  //  */
  // public getCurrentPitch(): string[] {
  //   console.log("getCurrentPitch", this.currentMatrix, this.currentTeam.players, this.currentIndex)
  //   if (this.currentMatrix == undefined || this.currentTeam == undefined) {
  //     return null;
  //   }
  //   return this.gameService.getCurrentPitch(this.currentMatrix, this.currentTeam.players, this.currentIndex);
  // }


  // getCurrentBench(): string[] {
  //   console.log("getCurrentBench", this.currentMatrix, this.currentTeam.players, this.currentIndex)
  //   if (this.currentMatrix == undefined || this.currentTeam == undefined) {
  //     return null;
  //   }
  //   return this.gameService.getCurrentBench(this.currentMatrix, this.currentTeam.players, this.currentIndex);
  // }


  /**  Create multidimensional array that holds the matrix of players */
  // private createMatrix(): void {
  // // randomize player list
  // let players: Player[] = this.availablePlayers.sort(function (a, b) { return 0.5 - Math.random() });

  // console.log("Creating matrix", this.availablePlayers, this.nonSubstitutablePlayers, players);

  // let n: number = players.length; // 8
  // let p: number = this.settings.fieldPlayers; // 6
  // let idx: number = 0;
  // let counter: number = 0;
  // const secondsPerPlayer: number = (this.totalTimeInMinutes * 60) / n;
  // this.matrix = []; // clear array 
  // this.timeBlocks = []; // clear array

  // // create the timeBlocks array 
  // for (let y: number = 1; y <= n; y++) {
  //   let seconds: number = secondsPerPlayer * y;
  //   // let mm: moment.Moment = moment("1900-01-01 00:00:00");
  //   // mm.add(seconds, "seconds");
  //   this.timeBlocks.push(seconds);
  // }

  // // create the matrix
  // p = p - this.nonSubstitutablePlayers.length;

  // let squad: string[] = [];

  // for (let i: number = 0; i < p; i++) {
  //   // create n rows (1 for every field player)
  //   let row = [];

  //   // create p columns (1 for every available player)
  //   for (let x: number = 0; x < n; x++) {

  //     // store the player name in the row
  //     row.push(players[idx].name);
  //     counter++;

  //     // go to next player after p iterations
  //     if (counter === p) {
  //       counter = 0;
  //       idx++;
  //     }
  //   }
  //   this.matrix.push(row); // store the row in the matrix
  // }

  // // TODO: check if substitute players are not in the starting squad
  // let substitutes = this.availablePlayers.filter(player => player.isPresent && !player.inStartingFormation);
  // let startingSquad = this.availablePlayers.filter(player => player.isPresent && player.inStartingFormation);

  // console.log("Matrix", this.matrix, this.timeBlocks)
  // }

  getOpstelling(col: number): any {
    // let column = [];
    // for (var i = 0; i < this.matrix.length; i++) {
    //   column.push(this.matrix[i][col]);
    // }
    // return column;
  }

  // getCurrentPitch(): Player[] {

  //   // let players: Player[] = [];
  //   // let substitutes: Substitute[] = [];
  //   // let playernames: string[] = this.getPlayerNamesFromMatrix(this.currentIndex);

  //   // playernames.forEach(player => {
  //   //   players.push(new Player(player));
  //   // });
  //   // this.nonSubstitutablePlayers.forEach(player => {
  //   //   players.push(player);
  //   // });

  //   //return players;

  //   return null;
  // }

  /** Go to the attendate page */
  goToAttendance() {
    this.navCtrl.push(AttendancePage);
  }

  /** Start game */
  startGame(): void {

    let title = this.currentGame.gameStarted ? "Wedstrijd hervatten?" : "Wedstrijd beginnen?";

    let alert = this.alertCtrl.create({
      title: title,

      buttons: [
        {
          text: 'Nee',
          handler: () => {
          }
        },
        {
          text: 'Ja',
          handler: () => {

            if (!this.currentGame.gameStarted) {
              // if the game was not already started, set the properties 
              // that mark the game as started. 
              this.currentGame.gameStarted = true;
              this.currentGame.gamePaused = false;
              this.currentGame.actualGameStartedTime = moment(); // now
              this.currentGame.gameTime = moment("1900-01-01 00:00:00"); // just duration
              this.currentGame.formationDone = true;

              // save to storage
              this.gameService.saveGame(this.currentGame);
              this.currentGameTime = this.currentGame.gameTime;

            }
            // (re)start the interval
            this.currentGame.gamePaused = false;
            this.startTimer();

          }
        }
      ]
    });
    alert.present();
  }

  private startTimer() {
    this.timer = TimerObservable.create(1, 200);

    this.timerSubscription = this.timer.subscribe(
      t => {
        this.saveCounter += 1;
        if (this.currentGame.gameTime == null) {
          console.log("Reset gameTime");
          this.currentGame.gameTime = moment(this.DATE_MIN_VALUE); // just duration
        }
        this.currentGame.gameTime = this.currentGame.gameTime.add(200, 'milliseconds');

        // determine the current timeblock
        for (let i = 0; i < this.currentMatrix.timeBlocks.length; i++) {

          let m = moment(this.DATE_MIN_VALUE);
          m.add(this.currentMatrix.timeBlocks[i], "seconds");
          if (m.isBefore(this.currentGame.gameTime)) {
            this.currentIndex = i;
          }
        }

        console.log("Current index", this.currentIndex);

        // every two seconds, save the game
        if (this.saveCounter == 10) {
          this.gameService.saveGame(this.currentGame);
          this.saveCounter = 0;
        }
      }
    );
  }
  /** unsubscribe from the timer observable */
  private stopTimer() {

    if (this.timerSubscription != null && typeof this.timerSubscription !== "undefined") {
      this.timerSubscription.unsubscribe();
    }
  }

  /** Pause the game */
  pauseGame(): void {

    let alert = this.alertCtrl.create({
      title: 'Wedstrijd pauzeren?',

      buttons: [
        {
          text: 'Nee',
          handler: () => {
          }
        },
        {
          text: 'Ja',
          handler: () => {
            this.currentGame.gamePaused = true;
            this.gameService.saveGame(this.currentGame);
            this.stopTimer()
          }
        }
      ]
    });
    alert.present();
  }

  /**
   * Stop the game
   * @memberof HomePage
   */
  stopGame(): void {

    let alert = this.alertCtrl.create({
      title: 'Wedstrijd beeindigen?',

      buttons: [
        {
          text: 'Nee',
          handler: () => {
          }
        },
        {
          text: 'Ja',
          handler: () => {
            this.currentGame.gamePaused = false;
            this.currentGame.gameStarted = false;
            this.currentGame.gameTime = null;
            this.currentGame.actualGameStartedTime = null;
            this.formationDone = false;
            this.gameService.saveGame(this.currentGame);
            this.stopTimer();

          }
        }
      ]
    });
    alert.present();
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(HomePage, {
      item: item
    });
  }


  /**
   * Returns an array of player names that are on the pitch for the given column
   * 
   * @private
   * @param {number} col 
   * @returns {string[]} 
   * @memberof HomePage
   */
  // private getPlayerNamesFromMatrix(col: number): string[] {
  //   let column = [];
  //   for (let i: number = 0; i < this.matrix.length; i++) {
  //     column.push(this.matrix[i][col]);
  //   }
  //   return column;
  // }

  /**
   * 
   * @private
   * @param {number} col 
   * @returns {Substitute[]} 
   * @memberof HomePage
   */
  // private getSubstitutes(col: number): Substitute[] {
  //   let substitutes: Substitute[] = [];
  //   let current: string[] = this.getPlayerNamesFromMatrix(col); // get all players now on pitch  

  //   let p: number = this.settings.fieldPlayers; // 6 
  //   p = p - this.nonSubstitutablePlayers.length;

  //   if (col > 0) {
  //     let previous: string[] = this.getPlayerNamesFromMatrix(col - 1); // get all players previously on pitch 
  //     // match all players against the previous 
  //     for (let i: number = 0; i < p; i++) {
  //       if (current[i] != previous[i]) {
  //         //TODO: Store time here
  //         substitutes.push(new Substitute(current[i], previous[i], this.timeBlocks[i]));
  //       }
  //     }
  //   }
  //   return substitutes;
  // }

  /**
   * Get all players that are not on the field for a given matrix column.
   * @private
   * @param {number} col 
   * @returns {string[]} 
   * @memberof HomePage
   */
  // private getBench(col: number): string[] {
  //   let bench: string[] = [];
  //   let current: string[] = this.getPlayerNamesFromMatrix(col); // get all players now on pitch  

  //   let p: number = this.settings.fieldPlayers; // 6 
  //   p = p - this.nonSubstitutablePlayers.length;

  //   this.availablePlayers.forEach(player => {
  //     if (current.indexOf(player.name) == -1) {
  //       bench.push(player.name);
  //     }
  //   });

  //   return bench;
  // }
}