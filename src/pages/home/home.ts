import { Game } from './../../app/shared/game.model';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private game: Game;
  
  constructor(public navCtrl: NavController, private storage: Storage) {
    // check for settings, initialize default values when not present

    this.storage.get("game").then((value) => {
      console.log("game", value);
      if (value == null) {
        console.log("Default Game object created");
        storage.set("game", new Game());
      } 
   
    });   

    // storage.get("game").then((value) => {
    
    //   

    
    // });
    


  }

}
