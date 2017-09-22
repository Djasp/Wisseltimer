import { SimpleTimer } from './simple-timer';
import { FixedPage } from './../pages/fixed/fixed';
import { FormationPage } from './../pages/formation/formation';
import { SettingsPage } from './../pages/settings/settings';
import { TeamPage } from './../pages/team/team';
import { AttendancePage } from './../pages/attendance/attendance';


import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { Wisseltimer } from './app.component';
import { HomePage } from '../pages/home/home';

import { SortByPipe } from './sortby.pipe';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    Wisseltimer,
    HomePage,
    AttendancePage,
    TeamPage,
    SettingsPage,
    FormationPage,
    FixedPage,
    SortByPipe
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(Wisseltimer),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    Wisseltimer,
    HomePage,
    AttendancePage,
    TeamPage,
    SettingsPage,
    FormationPage,
    FixedPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    SimpleTimer,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {

  constructor() {
    console.log( "AppModule constructor." );
  }
}
