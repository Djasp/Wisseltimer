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
  templateUrl: 'attendance.html'
})

export class AttendancePage {
  private players: Player[];
  private currentSettings: Settings;
  private allowNextScreen: boolean = false;

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

    this.settingsService.loadSettings().then(value => {
      this.currentSettings = value;
    });

    // load players list
    this.refreshPlayerList();
  }

  /** Get the list of players from the storage  */
  refreshPlayerList(): void {

    this.teamService.loadTeam().then(value => {
      this.players = value.players;

      // check if there are enough players attending
      let availablePlayers: number = this.players.filter(player => player.isPresent).length;
      this.allowNextScreen = (this.currentSettings.fieldPlayers <= availablePlayers)

      console.log("Available players", this.currentSettings.fieldPlayers > availablePlayers, this.currentSettings.fieldPlayers, availablePlayers)

      if (!this.allowNextScreen) {
        let toast = this.toastCtrl.create({
          message: 'Er zijn te weinig spelers om te spelen.',
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }

    });
  }

  /** Toggle player attendance */
  onTogglePlayerAttendance(player: Player): void {

    this.teamService.togglePlayerAttendance(player).then(() => {
      this.refreshPlayerList();
    });
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
