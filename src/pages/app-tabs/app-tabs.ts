import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

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

  homeRoot = 'HomePage'
  searchRoot = 'SearchPage'
  profileRoot = 'ProfilePage'


  constructor(public navCtrl: NavController) {}

}
