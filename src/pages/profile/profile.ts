import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers';
import { AppTabsPage, AnimationLifecicleSteps } from '../app-tabs/app-tabs';
import { asap } from 'rxjs/Scheduler/asap';

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
  signOutClicked = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public authProvider: AuthProvider) {}

  onSignOut() {
    if (this.signOutClicked) return;

    this.signOutClicked = true;
    const appTabsPageInstance: AppTabsPage = this.navCtrl.parent.viewCtrl.instance;
    appTabsPageInstance.animationSteps = AnimationLifecicleSteps.SIGN_OUT;
    asap.schedule(() => this.navCtrl.parent.select(0), 350);
    
      /*this.authProvider
        .afAuth
        .auth
        .signOut()
        .then((res: any) => {
          console.log('RESULT AFTER SIGN OUT => ', this.navCtrl.parent);
          //this.authProvider.goToLoginPage(this.navCtrl);
        });*/

  }

  resertTabs() {
    return this.navCtrl.parent.select(0);
  }

  ionViewWillEnter() {
    console.log('Profile tab been will enter => ', this.navCtrl.parent.viewCtrl.instance);
  }

  ionViewDidLeave() {
    console.log('Profile tab ViewDidLeave => ');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
