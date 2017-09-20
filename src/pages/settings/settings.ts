import { Player } from './../../app/shared/player.model';
import { Game } from './../../app/shared/game.model';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
  
export class SettingsPage {
  private settingsForm: FormGroup;
  private alertIsVisible; // flag is alert is already visible
  private pane: string = "players"; // default pane
  private players: Player[] = []; // array with players

  constructor(public navCtrl: NavController, private storage: Storage, private formbuilder: FormBuilder, private alertCtrl: AlertController) {
    
    // initialize form 
    this.settingsForm = this.formbuilder.group({
      minutesPerHalf: ['20', Validators.required],
      fieldPlayers: ['5', Validators.required],
      fullGame: [0, Validators.required]
    });
    this.alertIsVisible = false;

    // subscribe to settings form changes 
    this.settingsForm.valueChanges.subscribe(data => {

      // TODO: Prevent user from continuing when the form is invalid. 
      if (!this.settingsForm.valid && this.alertIsVisible == false) {
        this.presentAlert();
      }

      // get the game object from the storage
      this.storage.get("game").then((value) => {
        let game = new Game(value); // create new game object
        game.minutesPerHalf = parseFloat(data.minutesPerHalf); //TODO: Make minutes ints
        game.fieldPlayers = parseInt(data.fieldPlayers);
        game.fullGame = (data.fullGame == 'true'); // parse as boolean

        // save the game object to the storage
        storage.set("game", game);
      });
    })

    // get game object from storage 
    this.storage.get("game").then((value) => {
      let game = new Game(value); // create new game object
      // assign values from storage to the form 
      this.settingsForm.controls['minutesPerHalf'].setValue(game.minutesPerHalf);
      this.settingsForm.controls['fieldPlayers'].setValue(game.fieldPlayers);
      this.settingsForm.controls['fullGame'].setValue(game.fullGame);
    });

    // load players list
    this.refreshPlayerList();
  }

  /**Get the list of players from the storage  */
  refreshPlayerList(): void {
    this.storage.get("players").then((value) => {
      this.players = value;
    });
  }

  /** Show confirmation dialog and delete the player */
  onDelete(player: Player): void {
    let confirm = this.alertCtrl.create({
      title: 'Verwijderen?',
      message: 'Weet je zeker dat je '+player.name +' wilt verwijderen?',
      buttons: [
        {
          text: 'Nee'        
        },
        {
          text: 'Ja',
          handler: () => {
            var index = this.players.indexOf(player); // get the index of the item to be deleted 
            this.players.splice(index, 1); // remove from array;
            this.storage.set("players", this.players); // save 
            this.refreshPlayerList(); // reload 
          }
        }
      ]
    });
    confirm.present(); // show dialog
  }

  /** Show alert when settings form is invalid */
  presentAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Niet ingevuld',
      subTitle: 'Niet alle velden zijn juist ingevuld',
      buttons: [{
        text: 'Ok',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
          this.alertIsVisible = false;
        }
      }]
    });
    this.alertIsVisible = true;
    alert.present();
  }

  doPromptForPlayerName(): void {
    let alert = this.alertCtrl.create({
      title: 'Nieuwe speler',
      message: 'Voer de naam van de speler in',
      inputs: [
        {
          name: 'name',
          placeholder: 'Naam'
        },
      ],
      buttons: [
        {
          text: 'Annuleer',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Bewaar',
          handler: data => {
            console.log('Saved clicked');

            this.players.push(new Player(data.name));
            this.storage.set("players", this.players); // save 
            this.refreshPlayerList(); // reload 

          }
        }
      ]
    });
    alert.present();
  }
}  
