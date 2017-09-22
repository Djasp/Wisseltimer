import { Player } from './../../app/shared/player.model';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { AlertController } from 'ionic-angular';

@Component({
    selector: 'page-team',
    templateUrl: 'team.html'
})

export class TeamPage {
    private selectedItem: any;
    private players: Player[] = []; // array with players

    constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private alertCtrl: AlertController) {
        
        this.selectedItem = navParams.get('item');
        // load players list
        this.refreshPlayerList();
    }

    /**Get the list of players from the storage  */
    refreshPlayerList(): void {
        this.storage.get("players").then((value) => {
            this.players = value;
        });
    }

    /** Show confirmation dialog and delete the player */
    onDelete(player: Player): void {
        let confirm = this.alertCtrl.create({
            title: 'Verwijderen?',
            message: 'Weet je zeker dat je ' + player.name + ' wilt verwijderen?',
            buttons: [
                {
                    text: 'Nee'
                },
                {
                    text: 'Ja',
                    handler: () => {
                        var index = this.players.indexOf(player); // get the index of the item to be deleted 
                        this.players.splice(index, 1); // remove from array;
                        this.storage.set("players", this.players).then(
                            () => this.refreshPlayerList(),
                            () => console.log("Task Errored!")
                        );
                    }
                }
            ]
        });
        confirm.present(); // show dialog
    }

    itemTapped(event, item) {
        // That's right, we're pushing to ourselves!
        this.navCtrl.push(TeamPage, {
            item: item
        });
    }

    /* show prompt for player name when adding a new player */
    doPromptForPlayerName(): void {
        let alert = this.alertCtrl.create({
            title: 'Nieuwe speler',
            message: 'Voer de naam van de speler in',
            inputs: [
                {
                    name: 'name',
                    placeholder: 'Naam'
                },
            ],
            buttons: [
                {
                    text: 'Annuleer',
                    handler: () => {
                    }
                },
                {
                    text: 'Bewaar',
                    handler: data => {
                        this.players.push(new Player(data.name));
                        this.storage.set("players", this.players).then(
                            () => this.refreshPlayerList(),
                            () => console.log("Task Errored!")
                        );
                    }
                }
            ]
        });       
        alert.present();
    }

    doConfirmDeleteTeam(): void {
        let alert = this.alertCtrl.create({
            title: 'Hele team verwijderen?',
            message: 'Weet je zeker dat je het hele team IN EEN KEER wilt verwijderen?',
            buttons: [
                {
                    text: 'Ja',
                    handler: data => {
                        this.storage.remove("players").then(
                            () => this.refreshPlayerList(),
                            () => console.log("Task Errored!")
                        );
                    }
                },
                {
                    text: 'Nee, natuurlijk niet!',
                    handler: () => {

                    }
                }
            ]
        });        
        alert.present();
    }
}
