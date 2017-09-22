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
}  
