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
    private players: Player[];

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

        this.teamService.loadTeam().then(value => {
            this.players = value.players.filter(player => player.isPresent && player.inStartingFormation);
        });
    }

    onTogglePlayerDoNotSubstitute(player: Player): void {
        this.teamService.togglePlayerDoNotSubstitute(player).then(() => {
            this.refreshPlayerList();
        });
    }

    /** Mark formation done and to the next page */
    goToHome() {
        // let game: Game;
        // this.storage.get("game").then((value) => {
        //     // get the game object, set properties
        //     game = value;
        //     game.formationDone = true;
        //     game.actualFormationDoneTime = moment(); // now 
        //     game.gameTime = null;
        //     game.gamePaused = false;
        //     game.gameStarted = false;

        //     // save the game object 
        //     this.storage.set("game", game).then(
        //         () => this.navCtrl.setRoot(HomePage),
        //         () => console.log("Task Errored!")
        //     );
        // });
    }

    itemTapped(event, item) {
        // That's right, we're pushing to ourselves!
        this.navCtrl.push(FixedPage, {
            item: item
        });
    }
}