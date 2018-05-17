import { Component } from '@angular/core';
import { Events, IonicPage, NavController } from 'ionic-angular';
import { AuthProvider } from '../../providers';
import { AnimationLifecicleSteps, AppTabsPage } from '../app-tabs/app-tabs';
import { APP_EV } from '../pages.constants';
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
  private _animationDoneHandler: Function;
  private _tabsParentInstance: AppTabsPage = this.navCtrl.parent.viewCtrl.instance;

  constructor(
    public navCtrl: NavController, 
    public events: Events,
    public authProvider: AuthProvider) {}

  onSignOut() {
    if (this.signOutClicked) return;
    this.signOutClicked = true;
    this._tabsParentInstance.animationSteps = AnimationLifecicleSteps.SIGN_OUT;
  }

  resertTabs() {
    return this.navCtrl.parent.select(0);
  }

  ionViewDidLoad() {
    this._animationDoneHandler = (done: true) => {
      if (done) {
        this.resertTabs().then(() => {
          const User = this.authProvider.userInstance;
          return User.isAnonymous ? User.delete() : this.authProvider.signOut();
        });
      }
    };

    this.events.subscribe(APP_EV.TABS_SIGN_IN_ANIMATION_DONE, this._animationDoneHandler);
  }

  ionViewWillUnload() {
    this.events.unsubscribe(APP_EV.TABS_SIGN_IN_ANIMATION_DONE, this._animationDoneHandler);
  }
}
