import { Settings } from './../../app/shared/models/settings.model';
import { SettingsService } from './../../app/shared/services/settings.service';
import { TeamService } from './../../app/shared/services/team.service';
import { FixedPage } from './../attendance/fixed';
import { Player } from './../../app/shared/models/player.model';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'page-formation',
    templateUrl: 'formation.html',
})

export class FormationPage {
    private availablePlayers: Player[];
    private startingPlayersCount: number;
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
        this.refreshPlayerList();
    }

    /**
    * Get the list of players from the storage
    * 
    * @memberof TeamPage
    */
    refreshPlayerList(): void {

        this.teamService.getPresentPlayers().subscribe((data: Player[]) => {
            this.availablePlayers = data;
        });
    }

    /**
     * Toggle starting formation for player
     * 
     * @param {Player} player 
     * @memberof FormationPage
     */
    onToggleStartingFormation(player: Player): void {
        this.teamService.togglePlayerInStartingFormation(player);
    }
    /** Go to the next page */
    goToFixed() {

        this.settingsService.loadSettings().then(value => {
            this.startingPlayersCount = this.availablePlayers.filter(p => p.inStartingFormation && p.isPresent).length;
            console.log(value.fieldPlayers, this.startingPlayersCount);
            if (value.fieldPlayers > this.startingPlayersCount) {

                let toast = this.toastCtrl.create({
                    message: 'Er staan te weinig spelers in de basis.',
                    duration: 2000,
                    position: 'top'
                });
                toast.present();
            } else if (value.fieldPlayers < this.startingPlayersCount) {

                let toast = this.toastCtrl.create({
                    message: 'Er staan te veel spelers in de basis.',
                    duration: 2000,
                    position: 'top'
                });
                toast.present();
            } else {
                this.navCtrl.push(FixedPage);
            }
        });
    }

    itemTapped(event, item) {
        // That's right, we're pushing to ourselves!
        this.navCtrl.push(FormationPage, {
            item: item
        });
    }
}