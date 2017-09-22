import { FormationPage } from './../formation/formation';
import { Player } from './../../app/shared/player.model';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular';

@Component({
  selector: 'page-attendance',
  templateUrl: 'attendance.html'
})
  
export class AttendancePage {
  private players: Player[];
  selectedItem: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, public toastCtrl: ToastController) {
    this.selectedItem = navParams.get('item');
  }
  /**  fires every time a page becomes the active view */
  ionViewWillEnter() {
    // load players list
    this.refreshPlayerList();
  }

  /** Get the list of players from the storage  */
  refreshPlayerList(): void {    
    let fieldPlayers: number;

    // get gameobject to determine the minimum number of players
    this.storage.get("game").then((value) => {
      fieldPlayers = value.fieldPlayers; // number of players on the field
    });

    // get all players
    this.storage.get("players").then((value) => {

     this.players = value;
      console.log("Players", this.players);

      // check if there are enough players to start 
      let availablePlayers: number = this.players.filter(player => player.isPresent).length;
      if (availablePlayers < fieldPlayers) {
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

  /** Mark player present */
  onSelect(player: Player): void {
    console.log("Player", player);
    var index = this.players.indexOf(player); // get the index of the item to be deleted 
    player.isPresent = !player.isPresent; // toggle

    this.players[index] = player;
    
    this.storage.set("players", this.players).then(
      () => this.refreshPlayerList(),
      () => console.log("Task Errored!") 
    );
  }

  /** Go to the next page */
  goToFormation() {
    this.navCtrl.push(FormationPage);
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(AttendancePage, {
      item: item
    });
  }
}
