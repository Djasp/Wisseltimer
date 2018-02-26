import { SettingsService } from './../../app/shared/services/settings.service';
import { Settings } from './../../app/shared/models/settings.model';
import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage implements OnInit {
  selectedItem: any;
  settingsFormGroup: FormGroup;

  constructor(public navCtrl: NavController, private alertCtrl: AlertController, private settingsService: SettingsService,
    public toastCtrl: ToastController) {
  }

  ngOnInit() {
    //initialize the form 
    this.settingsFormGroup = new FormGroup({
      minutesPerHalf: new FormControl("", Validators.required),
      fieldPlayers: new FormControl("", Validators.required),
      fullGame: new FormControl("0", Validators.required)
    });
  }

  ionViewWillEnter() {
    // load the settings as a promise from the storage
    // and apply the values to the form
    this.settingsService.loadSettings().then(settings => {
      console.log("Promised settings", settings)

      this.settingsFormGroup.setValue({
        minutesPerHalf: settings.minutesPerHalf,
        fieldPlayers: settings.fieldPlayers,
        fullGame: settings.fullGame
      });
    });
  }

  /**
   * Saves the form to storage 
   * 
   * @memberof SettingsPage
   */
  saveForm() {

    let settings = new Settings(); // create new settings object
    settings.minutesPerHalf = parseFloat(this.settingsFormGroup.value.minutesPerHalf); //TODO: Make minutes ints
    settings.fieldPlayers = parseInt(this.settingsFormGroup.value.fieldPlayers);
    settings.fullGame = (this.settingsFormGroup.value.fullGame == 'true'); // parse as boolean

    this.settingsService.saveSettings(settings).then(() => {
      this.presentOk()
    });
  }

  /**
   * Show alert when settings form is invalid 
   * 
   * @memberof SettingsPage
   */
  presentAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Niet ingevuld',
      subTitle: 'Niet alle velden zijn juist ingevuld',
      buttons: [{
        text: 'Ok',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    alert.present();
  }

  /**
   * Show alert when settings are saved and redirect to homepage
   * 
   * @memberof SettingsPage
   */
  presentOk() {
    let toast = this.toastCtrl.create({
      message: 'Opgeslagen',
      duration: 3000,
      position: 'top'
    });
    toast.present();

    toast.onDidDismiss(() => {
      //  this.navCtrl.setRoot(HomePage); // redirect to homepage after alert dismisses
    });
  }
  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(SettingsPage, {
      item: item
    });
  }
} 