
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-about',
    templateUrl: 'about.html'
})

export class AboutPage {
    selectedItem: any;
    constructor(public navCtrl: NavController, public navParams: NavParams, ) {
        this.selectedItem = navParams.get('item');
    }
    itemTapped(event, item) {
        // That's right, we're pushing to ourselves!
        this.navCtrl.push(AboutPage, {
            item: item
        });
    }
}