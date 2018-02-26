import { Settings } from './../models/settings.model';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class SettingsService {
    private currentSettings: Settings = new Settings();
    constructor(private storage: Storage) {
    }

    /**
     * Load the settings from the database 
     * 
     * @returns {Settings} 
     * @memberof SettingsService
     */
    loadSettings(): Promise<Settings> {
        // create new promise 
        let promise = new Promise<Settings>((resolve, reject) => {
            // get settings object from storage 
            this.storage.get("settings")
                .then(value => {
                    if (value != null) {
                        this.currentSettings = new Settings(value);
                        console.log("Loaded settings", this.currentSettings);
                    }
                    resolve(this.currentSettings);
                });
        });
        return promise;
    }

    /**
     * Save the settings to the database
     * 
     * @param {Settings} settings 
     * @memberof SettingsService
     */
    saveSettings(settings: Settings): Promise<any> {
        // let saved: boolean;
        let promise = new Promise<Settings>((resolve, reject) => {
            console.log("Save settings", settings);

            // remove any matrix and game 
            this.storage.remove("matrix");
            this.storage.remove("game");

            // save the settings object to the storage
            this.storage.set("settings", settings).then(
                () => resolve(),
                () => reject()
            );
        });
        return promise;
    }
}