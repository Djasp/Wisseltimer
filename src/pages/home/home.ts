import { BackgroundMode } from '@ionic-native/background-mode';
import { Settings } from './../../app/shared/models/settings.model';
import { MatrixService } from './../../app/shared/services/matrix.service';
import { Matrix } from './../../app/shared/models/matrix.model';
import { Team } from './../../app/shared/models/team.model';
import { GameService } from './../../app/shared/services/game.service';
import { TeamService } from './../../app/shared/services/team.service';
import { SettingsService } from './../../app/shared/services/settings.service';
import { Substitute } from './../../app/shared/models/substitute.model';
import { AttendancePage } from './../attendance/attendance';
import { Player } from './../../app/shared/models/player.model';
import { Game } from './../../app/shared/models/game.model';
import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
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
  private DATE_MIN_VALUE: string = "1970-01-01 00:00:00";
  private selectedItem: any;
  private formationDone: boolean = false;
  private timer: Observable<number>;
  private currentGameTime: moment.Moment;
  private remainingGameTime: moment.Moment;
  private saveCounter: number = 0;
  private timerSubscription: Subscription;
  private currentIndex: number = 0;
  private currentGame: Game;
  private currentMatrix: Matrix;
  private currentPitch: string[] = [];
  private currentBench: string[] = [];
  private currentTeam: Team;
  private allowStart: boolean = false;
  private presentPlayers: Player[] = [];
  private currentSettings: Settings;
  private substitutes: Substitute[] = [];
  private INTERVAL: number = 100;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController, private alertCtrl: AlertController,
    private teamService: TeamService,
    private gameService: GameService,
    private settingsService: SettingsService,
    private backgroundMode: BackgroundMode,
    private matrixService: MatrixService) {
    this.selectedItem = navParams.get('item');
  }

  /**  fires every time a page becomes the active view */
  ionViewWillEnter() {

    this.updateRoster();
  }
  ionViewWillLeave() {

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

      this.currentGameTime = moment(this.DATE_MIN_VALUE);
      this.remainingGameTime = moment(this.DATE_MIN_VALUE).add(this.currentSettings.minutesPerHalf, "minutes");

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
          this.getCurrentBench().subscribe((data) => {
            this.currentBench = data;
          });

          // get entire roster of substitues
          this.getSubstitutes().subscribe((data) => {
            this.substitutes = data;
          });

          console.log("Matrix", this.currentMatrix.matrix);
          console.log("Timeblockx", this.currentMatrix.timeBlocks);
          console.log("Substitues", this.substitutes);
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
    return Observable.of(this._getCurrentPitch(this.currentIndex));
  }

  private getCurrentBench(): Observable<string[]> {
    let playerNamesOnTheBench: string[] = [];
    let current = this._getCurrentPitch(this.currentIndex); // get all players now on pitch  

    let bench = this.currentTeam.players.filter(p => p.isPresent && current.indexOf(p.name) == -1);

    bench.forEach(element => {
      playerNamesOnTheBench.push(element.name);
    });

    return Observable.of(playerNamesOnTheBench);
  }

  private getSubstitutes(): Observable<Substitute[]> {
    let substitutes: Substitute[] = [];
    console.log("Start substitutes", this.currentMatrix.timeBlocks);
    let q: number = this._getCurrentPitch(0).length; //this.currentMatrix.timeBlocks.length - 1;

    let sp: number = this.currentTeam.players.filter(p => p.isPresent && !p.doNotSubstitute).length;
    console.log(q, sp);
    for (let i: number = 1; i < sp; i++) {
      let current: string[] = this._getCurrentPitch(i); // get all players now on the pitch in this block
      let previous: string[] = this._getCurrentPitch(i - 1); // get all players previously on pitch 
      console.log("QQQQ", i, current, previous);

      for (let x: number = 0; x <= q; x++) {
        if (current[x] != previous[x]) {
          // store the substitute. Because the timeblocks represent the END of the block, we store the previous block.
          // (the end of the previous is the beginning of the current)          
          substitutes.push(new Substitute(current[x], previous[x], this.currentMatrix.timeBlocks[i - 1], i));
        }
      }
    }
    console.log("Substitutes", substitutes);
    return Observable.of(substitutes);
  }

  private _getCurrentPitch(col: number): string[] {
    let playerNamesOnTheField: string[] = this.currentMatrix.matrix.map(function (value, index) { return value[col]; });
    let notSubstitablePlayers: Player[] = this.currentTeam.players.filter(p => p.isPresent && p.doNotSubstitute);

    notSubstitablePlayers.forEach(element => {
      playerNamesOnTheField.push(element.name);
    });

    return playerNamesOnTheField;
  }

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

            console.log("(re)starting game", this.currentGame.gameStarted)
            if (!this.currentGame.gameStarted) {
              // if the game was not already started, set the properties 
              // that mark the game as started. 
              this.currentGame.gameStarted = true;
              this.currentGame.gamePaused = false;
              this.currentGame.actualGameStartedTimeInUnixTimeStamp = moment().unix(); // now
              this.currentGame.gameTimeInUnixTimeStamp = 0;
              this.currentGame.formationDone = true;
              this.currentIndex = 0;

              // save to storage
              this.gameService.saveGame(this.currentGame);

            }
            // (re)start the interval

            // set current gametime 
            this.currentGameTime = moment.unix(this.currentGame.gameTimeInUnixTimeStamp);

            this.currentGame.gamePaused = false;
            this.startTimer();

          }
        }
      ]
    });
    alert.present();
  }

  private startTimer() {

    console.log("startTimer");
    this.timer = TimerObservable.create(1, this.INTERVAL);

    this.timerSubscription = this.timer.subscribe(
      t => {
        this.saveCounter += 1;

        if (this.currentGame.gameTimeInUnixTimeStamp == null) {
          console.log("Reset gameTime");
          this.currentGame.gameTimeInUnixTimeStamp = 0; // just duration
          this.currentIndex = 0;
        }

        // enable background mode for mobile devices 
        //   this.backgroundMode.enable();

        /* CALCULATE TIMES */

        // add new interval to gameTime
        this.currentGameTime = this.currentGameTime.add(this.INTERVAL, 'milliseconds');

        // this.currentGameTime = newTime;

        // set newtime as unix in object 
        console.log("new time", this.currentGameTime.format("mm:ss"));
        this.currentGame.gameTimeInUnixTimeStamp = this.currentGameTime.unix();

        this.remainingGameTime = this.remainingGameTime.subtract(this.INTERVAL, 'milliseconds');

        if (this.remainingGameTime.isBefore(moment(this.DATE_MIN_VALUE))) {
          this.remainingGameTime = moment(this.DATE_MIN_VALUE);
        }

        // determine the current timeblock
        for (let i = 0; i < this.currentMatrix.timeBlocks.length; i++) {
          let m: moment.Moment = moment(this.DATE_MIN_VALUE).add(this.currentMatrix.timeBlocks[i], "seconds");
          if (m.isAfter(this.currentGameTime)) {
            this.currentIndex = i;
            break;
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
      this.backgroundMode.disable();

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
      title: 'Wedstrijd beëindigen?',

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
            this.currentGame.gameTimeInUnixTimeStamp = null;
            this.currentGame.actualGameStartedTimeInUnixTimeStamp = null;
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


  // /**
  //  * Get all players that are not on the field for a given matrix column.
  //  * @private
  //  * @param {number} col 
  //  * @returns {string[]} 
  //  * @memberof HomePage
  //  */
  // private getCurrentBench(col: number): string[] {
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