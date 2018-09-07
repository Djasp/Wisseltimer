import { Matrix } from './shared/models/matrix.model';
import { GameService } from './shared/services/game.service';
import { MatrixService } from './shared/services/matrix.service';
import { TeamService } from './shared/services/team.service';
import { SortByPipe } from './shared/pipes/sortby.pipe';
import { AboutPage } from './../pages/about/about';
import { SettingsService } from './shared/services/settings.service';
import { SimpleTimer } from './simple-timer';
import { FixedPage } from './../pages/attendance/fixed';
import { FormationPage } from './../pages/attendance/formation';
import { SettingsPage } from './../pages/settings/settings';
import { TeamPage } from './../pages/team/team';
import { AttendancePage } from './../pages/attendance/attendance';

import { BackgroundMode } from '@ionic-native/background-mode';

import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { Wisseltimer } from './app.component';
import { HomePage } from '../pages/home/home';


import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FavoriteProvider } from './../providers/favorite/favorite';

@NgModule({
  declarations: [
    Wisseltimer,
    HomePage,
    AttendancePage,
    TeamPage,
    SettingsPage,
    FormationPage,
    FixedPage,
    SortByPipe,
    AboutPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(Wisseltimer, {
      backButtonText: 'Terug'
    }),
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
    FixedPage,
    AboutPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    SimpleTimer,
    SettingsService,
    TeamService,
    GameService,
    MatrixService,
    BackgroundMode,
    FavoriteProvider,
    { provide: ErrorHandler, useClass: IonicErrorHandler },

  ]
})
export class AppModule {

  constructor() {
    console.clear();
    console.log("AppModule constructor.");

  }
}
