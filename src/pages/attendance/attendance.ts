import { Settings } from './../../app/shared/models/settings.model';
import { SettingsService } from './../../app/shared/services/settings.service';
import { TeamService } from './../../app/shared/services/team.service';
import { FormationPage } from './../attendance/formation';
import { Player } from './../../app/shared/models/player.model';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ToastController } from 'ionic-angular';

@Component({
  selector: 'page-attendance',
  templateUrl: 'attendance.html',
  providers: [TeamService]
})

export class AttendancePage {
  private allPlayers: Player[];
  selectedItem: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private settingsService: SettingsService,
    private teamService: TeamService,
    public toastCtrl: ToastController) {

    this.selectedItem = navParams.get('item');
  }
  /**  fires every time a page becomes the active view */
  ionViewWillEnter() {
    // load players list
    this.refreshPlayerList();
  }

  /** Get the list of players from the storage  */
  refreshPlayerList(): void {
    this.teamService.getAllPlayers().subscribe((data: Player[]) => {
      this.allPlayers = data;
      if (this.allPlayers.length == 0) {
        let toast = this.toastCtrl.create({
          message: 'Er zijn geen spelers. Maak een team aan. ',
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }
    });

  }

  /** Toggle player attendance */
  onTogglePlayerAttendance(player: Player): void {
    this.teamService.togglePlayerAttendance(player);
  }

  /** Go to the next page */
  goToFormation() {
    this.settingsService.loadSettings().then(value => {
      if (value.fieldPlayers <= this.allPlayers.filter(player => player.isPresent).length) {
        this.navCtrl.push(FormationPage);
      } else {
        let toast = this.toastCtrl.create({
          message: 'Er zijn te weinig spelers om te spelen.',
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }
    });
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(AttendancePage, {
      item: item
    });
  }
}
