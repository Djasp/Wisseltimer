import { Player } from './../../app/shared/player.model';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'page-attendance',
  templateUrl: 'attendance.html'
})
export class AttendancePage {
  private players: Player[];
 
  constructor(public navCtrl: NavController, private storage: Storage, private formbuilder: FormBuilder) {

   

    // load players list
    this.refreshPlayerList();
  }

  /**Get the list of players from the storage  */
  refreshPlayerList(): void {
    this.storage.get("players").then((value) => {
      this.players = value;
    });
  }

  onToggle(player: Player): void {
    console.log("Player", player);
    var index = this.players.indexOf(player); // get the index of the item to be deleted 
    player.doNotSubstitute = !player.doNotSubstitute; // toggle
    this.players[index] = player;
    this.storage.set("players", this.players); // save 
    this.refreshPlayerList();
  }

  onSelect(player: Player): void {
    console.log("Player", player);
    var index = this.players.indexOf(player); // get the index of the item to be deleted 
    player.isPresent = !player.isPresent; // toggle

    this.players[index] = player;
    this.storage.set("players", this.players); // save 
    this.refreshPlayerList();
  }
}
