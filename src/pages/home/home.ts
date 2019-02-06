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

  // private DATE_MIN_VALUE: string = "1970-01-01 00:00:00";
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
  private currentPitch: Player[] = [];
  private currentBench: Player[] = [];
  private currentTeam: Team;
  private allowStart: boolean = false;
  private presentPlayers: Player[] = [];
  private currentSettings: Settings;
  private substitutes: Substitute[] = [];
  private INTERVAL: number = 1000;

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
      this.remainingGameTime = moment.unix(0).add(this.currentSettings.minutesPerHalf, "minutes"); 
      this.currentGameTime = moment.unix(0);
 
      // get or create matrix
      if (this.formationDone) {

        this.matrixService.loadMatrix(
          this.presentPlayers,
          this.currentSettings.fieldPlayers,
          this.currentSettings.minutesPerHalf

        ).subscribe((data: Matrix) => {
          
          console.log("subscribe");

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

          // console.log("Matrix", this.currentMatrix.matrix);
          // console.log("Timeblocks", this.currentMatrix.timeBlocks);
          // console.log("Substitutes", this.substitutes);
        });
      }
    });
  }

  /**
   * Get the players that are now supposed to be on the field
   * 
   * @returns {Observable<Player[]>} 
   * @memberof HomePage
   */
  public getCurrentPitch(): Observable<Player[]> {
    
    console.log("getting current pitch for index", this.currentIndex);

    return Observable.of(this._getCurrentPitchForGivenIndex(this.currentIndex));
  }

  /**
   * Get the players that are now supposed to be on the bench
   *
      * @returns {Observable<Player[]>}
   * @memberof HomePage
   */
  public getCurrentBench(): Observable<Player[]> {
   // let playersOnTheBench: Player[] = [];
   console.log("getting current bench for index", this.currentIndex);
   
    let playersOnThePitch = this._getCurrentPitchForGivenIndex(this.currentIndex); // get all players now on pitch  

    let playersAvailable = this.currentTeam.players.filter(p => p.isPresent); // get all players that are present 
    let bench = playersAvailable.filter(item => playersOnThePitch.indexOf(item) < 0); // players that are present and are not on the pitch, must be on the bench. 

    // bench.forEach(element => {
    //   playersOnTheBench.push(element);
    // });

    return Observable.of(bench);
  }

  /**
   * Get the roster of Substitutes
   *
   * @returns {Observable<Substitute[]>}
   * @memberof HomePage
   */
  public getSubstitutes(): Observable<Substitute[]> {
    let substitutes: Substitute[] = [];

    console.log("Start substitutes", this.currentMatrix.timeBlocks);
    let q: number = this._getCurrentPitchForGivenIndex(0).length; //this.currentMatrix.timeBlocks.length - 1;
    let sp: number = this.currentTeam.players.filter(p => p.isPresent && !p.doNotSubstitute).length;
    
    //console.log(q, sp);

    for (let i: number = 1; i < sp; i++) {
      let current: Player[] = this._getCurrentPitchForGivenIndex(i); // get all players now on the pitch in this block
      let previous: Player[] = this._getCurrentPitchForGivenIndex(i - 1); // get all players previously on pitch 

      // if(i === 1) {
      //   console.log("getSubstitutes()", i, current, previous);
      // }

      for (let x: number = 0; x <= q; x++) {
        if (current[x] != previous[x]) {
          // store the substitute. Because the timeblocks represent the END of the block, we store the previous block.
          // (the end of the previous is the beginning of the current)          
          substitutes.push(new Substitute(current[x].name, previous[x].name, this.currentMatrix.timeBlocks[i - 1], i));
        }
      }
    }
    console.log("Get Substitutes", substitutes);
    return Observable.of(substitutes);
  }

  /**
   * Get the players on the field, including players that must not be substituted.
   *
   * @private
   * @param {number} givenIndex
   * @returns {Player[]}
   * @memberof HomePage
   */
  private _getCurrentPitchForGivenIndex(givenIndex: number): Player[] {
    let playersNamesOnTheFieldFromMatrix: string[] = this.currentMatrix.matrix.map(function (value) { return value[givenIndex]; });
    let playersOnTheField: Player[] = [];
    let notSubstitutablePlayers: Player[] = this.currentTeam.players.filter(p => p.isPresent && p.doNotSubstitute);

    // loop through the playername from the matrix and collect the 
    // player objects from the current team array and push it to the 
    // array that contains the players on the field
    playersNamesOnTheFieldFromMatrix.forEach(name => {     
      let player = this.currentTeam.players.filter(p => p.isPresent && !p.doNotSubstitute).find(p => p.name === name); 
      if(typeof player !== "undefined") {
        playersOnTheField.push(player);
      }
    });

    notSubstitutablePlayers.forEach(element => {
      playersOnTheField.push(element);
    });

    return playersOnTheField;
  }

  /** Go to the attendance page */
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
    this.timer = TimerObservable.create(1000, this.INTERVAL); // after 1 second (1000 milliseconds), fire every x milliseconds (default 1000)

    this.timerSubscription = this.timer.subscribe(
      t => {
        this.saveCounter += 1;

        console.log("tick");

        if (this.currentGame.gameTimeInUnixTimeStamp == null) {
          console.log("Reset gameTime");
          this.currentGame.gameTimeInUnixTimeStamp = 0; // just duration
          this.currentIndex = 0;
        }

        // enable background mode for mobile devices 
         //  this.backgroundMode.enable();

        /* CALCULATE TIMES */

        // add new interval to gameTime. Remember, currentGameTime is measured from the unix epoch. 
        this.currentGameTime = this.currentGameTime.add(this.INTERVAL, 'milliseconds');

        // set newtime as unix in object 
        this.currentGame.gameTimeInUnixTimeStamp = this.currentGameTime.unix();

        // determine the remaining time
        this.remainingGameTime = moment.unix(0).add(this.currentSettings.minutesPerHalf, "minutes")
        this.remainingGameTime = this.remainingGameTime.subtract( this.currentGameTime.unix(),"seconds"); // then subtract the time alreay played
      
        if (this.remainingGameTime.isBefore(moment.unix(0))) {
          console.log("Fix this.remainingGameTime");
          this.remainingGameTime = moment.unix(0);
        }

        console.log("new time",this.currentGameTime.format(), this.remainingGameTime.format());

        console.log("current timeblocks",this.currentMatrix.timeBlocks);

        // Determine the current timeblock.
        // For each block in the matrix, we add the number of seconds assigned to that block
        // If the current gametime is after that block, we up the index. 
        for (let i = 0; i < this.currentMatrix.timeBlocks.length; i++) {
          let m: moment.Moment = moment.unix(0);
          
          let x = m.add(this.currentMatrix.timeBlocks[i], "seconds");

          console.log("determine the current timeblock",x.format(), this.currentGameTime.format(),x.isAfter(this.currentGameTime));

          if (x.isAfter(this.currentGameTime)) {
            this.currentIndex = i;
            break;
          }
        }
        console.log("Current index", this.currentIndex);    

        // every two seconds, save the game
        if (this.saveCounter == 2) {
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
}