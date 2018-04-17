import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';
import { AuthProvider } from '../../providers';
import { User } from 'firebase/app';
// import { Subscription } from 'rxjs/Subscription';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  buttons = [
    {
      txtColor: '#736868',
      btnColor: '#f4f4f4',
      name: 'google',
      ico: 'logo-google',
      upcase: true
    },
    {
      txtColor: '#f4f4f4',
      btnColor: '#f53d3d',
      name: 'email',
      ico: 'mail',
      upcase: false
    },
    {
      txtColor: '#222',
      btnColor: '#fec900',
      name: 'try the app without login',
      custom: true,
      upcase: true
    }
  ];
  // isPageNeedShow = this.authProvider.isLoginPageNeedShow;
  // private _sub: Subscription;
  
  constructor(
    navCtrl: NavController, 
    alertCtrl: AlertController,
    public authProvider: AuthProvider) {

      authProvider.user
                  .subscribe((user: User) => {
                    console.log("LOGIN PAGE USER => ", user);
                    if (user) {
                      authProvider.goBack(navCtrl);
                    }
                  }, () => {
                    authProvider.isLoginPageNeedShow = true;
                    alertCtrl.create({ 
                      title: 'Authentication error',
                      subTitle: 'Error occured, please try sign in again',
                      buttons: ['Dismiss']
                    }).present();
                  });
                  /*.then((redirectResult: any) => {
                    console.log("REDIRECT RESULT => ", redirectResult);
                    if (redirectResult.user) {
                      authProvider.goBack(navCtrl);
                    }
                  })
                  .catch(() => {
                    this.authProvider.isLoginPageNeedShow = true;
                    alertCtrl.create({ 
                      title: 'Authentication error',
                      subTitle: 'Error occured, please try sign in again',
                      buttons: ['Dismiss']
                    }).present();
                  });*/
    }
}
