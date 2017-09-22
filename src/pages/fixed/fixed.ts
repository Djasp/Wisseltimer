import { Game } from './../../app/shared/game.model';
import { HomePage } from './../home/home';
import { Player } from './../../app/shared/player.model';
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
    private allowNextScreen: boolean = false;

    constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, public toastCtrl: ToastController) {
        this.selectedItem = navParams.get('item');
    }

    /**  fires every time a page becomes the active view */
    ionViewWillEnter() {
        // load players list
        this.refreshPlayerList();
    }

    /** Get the list of players that are available from the storage  */
    refreshPlayerList(): void {
        this.storage.get("players").then((value) => {
            // filter the present players
            this.players = value.filter(player => player.isPresent);
        });
    }

    onToggle(player: Player): void {
        console.log("Player", player);
        var index = this.players.indexOf(player); // get the index of the item to be deleted 
        player.doNotSubstitute = !player.doNotSubstitute; // toggle
        this.players[index] = player;
        this.storage.set("players", this.players).then(
            () => this.refreshPlayerList(),
            () => console.log("Task Errored!")
        );
    }

    /** Mark formation done and to the next page */
    goToHome() {
        let game: Game;
        this.storage.get("game").then((value) => {
            // get the game object, set properties
            game = value;
            game.formationDone = true;
            game.actualFormationDoneTime = moment(); // now 
            game.gameTime = null;
            game.gamePaused = false;
            game.gameStarted = false;

            // save the game object 
            this.storage.set("game", game).then(
                () => this.navCtrl.setRoot(HomePage),
                () => console.log("Task Errored!")
            );
        });
    }

    itemTapped(event, item) {
        // That's right, we're pushing to ourselves!
        this.navCtrl.push(FixedPage, {
            item: item
        });
    }
}