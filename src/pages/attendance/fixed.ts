import { GameService } from './../../app/shared/services/game.service';
import { Settings } from './../../app/shared/models/settings.model';
import { SettingsService } from './../../app/shared/services/settings.service';
import { TeamService } from './../../app/shared/services/team.service';
import { HomePage } from './../home/home';
import { Player } from './../../app/shared/models/player.model';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import moment from 'moment';

@Component({
    selector: 'page-fixed',
    templateUrl: 'fixed.html'
})

export class FixedPage {
    private startingPlayers: Player[];

    selectedItem: any;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        private settingsService: SettingsService,
        private gameService: GameService,
        private teamService: TeamService,
        public toastCtrl: ToastController) {
        this.selectedItem = navParams.get('item');
    }

    /**  fires every time a page becomes the active view */
    ionViewWillEnter() {
        // load players list
        this.refreshPlayerList();
    }

    /**
     * Load the players that are in the starting formation 
     * 
     * @memberof FixedPage
     */
    refreshPlayerList(): void {
        this.teamService.getStartingLineup().subscribe((data: Player[]) => {
            this.startingPlayers = data;//.filter(player => player.isPresent && player.inStartingFormation);
        });
    }

    /**
     * Mark player substitutable or not
     * 
     * @param {Player} player 
     * @memberof FixedPage
      */
    onTogglePlayerDoNotSubstitute(player: Player): void {
        this.teamService.togglePlayerDoNotSubstitute(player);
    }

    /**
     * Mark the formation done for the game and redirect to the homepage
     * 
     * @memberof FixedPage
     */
    goToHome() {
        this.gameService.markFormationDone();
        this.navCtrl.setRoot(HomePage)
    }

    itemTapped(event, item) {
        // That's right, we're pushing to ourselves!
        this.navCtrl.push(FixedPage, {
            item: item
        });
    }
}