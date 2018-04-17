import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  userStatus: Promise<any>;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public authProvider: AuthProvider) {}

  onSignOut() {
      this.authProvider
        .afAuth
        .auth
        .signOut()
        .then((res: any) => {
          console.log('RESULT AFTER SIGN OUT => ', res);
          this.authProvider.goToLoginPage(this.navCtrl);
        });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
