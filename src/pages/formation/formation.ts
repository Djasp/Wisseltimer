import { FixedPage } from './../fixed/fixed';
import { Player } from './../../app/shared/player.model';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'page-formation',
    templateUrl: 'formation.html'
})

export class FormationPage {
    private players: Player[];
    selectedItem: any;
    private allowNextScreen: boolean = false;

    constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage,public toastCtrl: ToastController) {
        this.selectedItem = navParams.get('item');
    }

    /**  fires every time a page becomes the active view */
    ionViewWillEnter() {
        // load players list
        this.refreshPlayerList();
    }

    /** Get the list of players that are available from the storage  */
    refreshPlayerList(): void {
        let fieldPlayers: number;
        let startingPlayers: number;
        // get gameobject to determine the minimum number of players
        this.storage.get("game").then((value) => {
            fieldPlayers = value.fieldPlayers; // number of players on the field
        });

        this.storage.get("players").then((value) => {
            // filter the present players
            this.players = value.filter(player => player.isPresent);
            startingPlayers = this.players.filter(player => player.isPresent && player.inStartingFormation).length;
            
         
            this.allowNextScreen = (startingPlayers == fieldPlayers);

            console.log("allow", this.allowNextScreen);

            if (startingPlayers > fieldPlayers) {
                // Warn when play can not start         
                let toast = this.toastCtrl.create({
                    message: 'Er staan te veel spelers in de basis.',
                    duration: 3000,
                    position: 'top'
                });
                toast.present();
            }
        });
    }

    onToggle(player: Player): void {
        console.log("Player", player);
        var index = this.players.indexOf(player); // get the index of the item to be deleted 
        player.inStartingFormation = !player.inStartingFormation; // toggle
        this.players[index] = player;
        this.storage.set("players", this.players).then(
            () => this.refreshPlayerList(),
            () => console.log("Task Errored!")
        );
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