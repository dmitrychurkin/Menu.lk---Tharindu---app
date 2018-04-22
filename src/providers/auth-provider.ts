import { Injectable } from "@angular/core";
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from 'firebase/app';
import { NavController } from "ionic-angular";
import { APP_LOGIN_PAGE } from "../pages/pages.constants";

enum Providers { GOOGLE, PWD, ANONYMUS };

@Injectable()
export class AuthProvider {

  user = this.afAuth.authState;
  isLoginPageNeedShow = false;

  constructor(public afAuth: AngularFireAuth) {}

  // get rootNavCtrl() {
  //   return this.appCtrl.getRootNav();
  // }
  
  signIn(flag: number) {
    this.isLoginPageNeedShow = false;
    switch (flag) {
      case Providers.GOOGLE: {
        return this.afAuth
                  .auth
                  .signInWithRedirect( new firebase.auth.GoogleAuthProvider );
      }
      case Providers.ANONYMUS: {
        return this.afAuth
                  .auth
                  .signInAnonymously();
      }
    }
  }
  
  goToLoginPage(nav: NavController): Promise<any> {
    this.isLoginPageNeedShow = true;
    return nav.push(APP_LOGIN_PAGE);
  }
  goBack(nav: NavController): Promise<any> {
    return nav.canGoBack() ? nav.pop() : nav.goToRoot({animate: true});
  }
}