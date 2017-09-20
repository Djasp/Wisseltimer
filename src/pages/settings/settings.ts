import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage { 
   constructor(public navCtrl: NavController, private storage: Storage) {

      storage.set("fieldPlayers", 5);

      storage.get('fieldPlayers').then((val) => {
        console.log('Your fieldPlayers is', val);
      });
  }

}
