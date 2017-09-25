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
    templateUrl: 'formation.html'
})

export class FormationPage {
    private availablePlayers: Player[];
    selectedItem: any;
    private currentSettings: Settings;
    private allowNextScreen: boolean = false;

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

    /**
    * Get the list of players from the storage
    * 
    * @memberof TeamPage
    */
    refreshPlayerList(): void {

        this.teamService.loadTeam().then(value => {
            this.availablePlayers = value.players.filter(player => player.isPresent);

            // check if there are enough players for starting
            let startingPlayers: number = this.availablePlayers.filter(player => player.inStartingFormation).length;
            this.allowNextScreen = (this.currentSettings.fieldPlayers <= startingPlayers)

            if (!this.allowNextScreen) {
                let toast = this.toastCtrl.create({
                    message: 'Er staan te weinig spelers in de basis.',
                    duration: 3000,
                    position: 'top'
                });
                toast.present();
            }

        });
    }

    // /** Get the list of players that are available from the storage  */
    // refreshPlayerList(): void {
    //     let fieldPlayers: number;
    //     let startingPlayers: number;
    //     // get gameobject to determine the minimum number of players
    //     this.storage.get("game").then((value) => {
    //         fieldPlayers = value.fieldPlayers; // number of players on the field
    //     });

    //     this.storage.get("players").then((value) => {
    //         // filter the present players
    //         this.players = value.filter(player => player.isPresent);
    //         startingPlayers = this.players.filter(player => player.isPresent && player.inStartingFormation).length;

    //         this.allowNextScreen = (startingPlayers == fieldPlayers);

    //         console.log("allow", this.allowNextScreen);

    //         if (startingPlayers > fieldPlayers) {
    //             // Warn when play can not start         
    //             let toast = this.toastCtrl.create({
    //                 message: 'Er staan te veel spelers in de basis.',
    //                 duration: 3000,
    //                 position: 'top'
    //             });
    //             toast.present();
    //         }
    //     });
    // }

    onToggleStartingFormation(player: Player): void {
        this.teamService.togglePlayerInStartingFormation(player).then(() => {
            this.refreshPlayerList();
        });
        // this.teamService.
        //     console.log("Player", player);
        // var index = this.availablePlayers.indexOf(player); // get the index of the item to be deleted 
        // player.inStartingFormation = !player.inStartingFormation; // toggle
        // this.availablePlayers[index] = player;
        // this.storage.set("players", this.availablePlayers).then(
        //     () => this.refreshPlayerList(),
        //     () => console.log("Task Errored!")
        // );
    }
    /** Go to the next page */
    goToFixed() {
        this.navCtrl.push(FixedPage);
    }

    itemTapped(event, item) {
        // That's right, we're pushing to ourselves!
        this.navCtrl.push(FormationPage, {
            item: item
        });
    }
}