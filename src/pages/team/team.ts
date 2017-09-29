import { TeamService } from './../../app/shared/services/team.service';
import { Player } from './../../app/shared/models/player.model';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

@Component({
    selector: 'page-team',
    templateUrl: 'team.html'
})

export class TeamPage {
    private selectedItem: any;
    players: Player[]; // array with players

    constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, private teamService: TeamService
    ) {

        this.selectedItem = navParams.get('item');
    }

    ionViewWillEnter() {
        // load players list
        this.refreshPlayerList();
    }
    /**
     * Get the list of players from the storage
     * 
     * @memberof TeamPage
     */
    refreshPlayerList(): void {

        this.teamService.getAllPlayers().subscribe((data: Player[]) => {
            this.players = data;
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
                        this.teamService.deletePlayer(player);
                        // this.refreshPlayerList();
                    }
                }
            ]
        });
        confirm.present(); // show dialog
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
                        this.teamService.addPlayer(new Player(data.name));
                        // this.refreshPlayerList();
                    }
                }
            ]
        });
        alert.present();
    }

    itemTapped(event, item) {
        // That's right, we're pushing to ourselves!
        this.navCtrl.push(TeamPage, {
            item: item
        });
    }

}
