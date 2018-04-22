import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { AuthProvider } from '../../providers';
import { APP_HOME_PAGE, APP_PROFILE_PAGE, APP_SEARCH_PAGE } from '../pages.constants';

/**
 * Generated class for the AppTabsPage tabs.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-app-tabs',
  templateUrl: 'app-tabs.html'
})
export class AppTabsPage {

  homeRoot = APP_HOME_PAGE;
  searchRoot = APP_SEARCH_PAGE;
  profileRoot = APP_PROFILE_PAGE;

  isUserSigned = false;

  constructor(authProvider: AuthProvider, navCtrl: NavController) {
    authProvider.user.subscribe((user: any) => {
      console.log("AppTabsPage user => ", user);
      if (!user) {
        authProvider.goToLoginPage(navCtrl);
      }
      this.isUserSigned = !!user;
    });
  }
}
