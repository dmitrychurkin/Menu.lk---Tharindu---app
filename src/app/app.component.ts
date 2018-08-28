import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Platform } from 'ionic-angular';
import { APP_TABS_PAGE } from '../pages/pages.constants';
import { NetworkService } from '../services';




@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp {
  rootPage = APP_TABS_PAGE;

  constructor(
    platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen,
    networkService: NetworkService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.backgroundColorByHexString('#488aff');
      splashScreen.hide();
      networkService.initializeNetworkProvider();
    });

    /*For Tharindu to add data to his DB
    setTimeout(() => {
      
      const DB = angularFirestore.firestore.batch();

      for (const catering in FIRESTORE_DATA.catering) {
        const ID = angularFirestore.createId();
        const docRef = angularFirestore.collection('catering').doc(ID).ref;
        for (const prop in FIRESTORE_DATA.catering[catering]) {
          if (prop === '_id') {
            delete FIRESTORE_DATA.catering[catering][prop];
            FIRESTORE_DATA.catering[catering].id = ID;
            
            DB.set(docRef, FIRESTORE_DATA.catering[catering]);
          }
        }
      }
      DB.commit().then(() => console.log('Data successfully written'))
                  .catch((err) => console.error('Error occured ', err));
      console.log(FIRESTORE_DATA.catering);
    }, 5000);*/
  }
}