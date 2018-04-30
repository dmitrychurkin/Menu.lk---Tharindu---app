import { AnimationBuilder, animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, Tabs, ToastController } from 'ionic-angular';
import { asap } from 'rxjs/Scheduler/asap';
import { Subscription } from 'rxjs/Subscription';
import { ISignInMeta, LoginWidgetComponent } from '../../components/login-widget/login-widget.component';
import { AuthProvider } from '../../providers';
import { APP_HOME_PAGE, APP_PROFILE_PAGE, APP_SEARCH_PAGE } from '../pages.constants';
import AppTabsAnimations from './app-tabs.animation';

/**
 * Generated class for the AppTabsPage tabs.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
// enum UserState { UNKNOWN = 0, NOT_SIGNED = -1, REQUEST_SENT = 1, SIGNED = 2 };

export enum AnimationLifecicleSteps { 
  SHOW_PRELOADER, 
  ENTER_LOGIN_TRANSITION, 
  LOGIN_ENTERED,
  REMOVE_PRELOADER_IF_SIGNED,
  SIGN_IN_REQUEST_SENT_TRANSITION, 
  SIGN_IN_REQUEST_SENT,
  PRELOADER_REMOVED,
  SIGN_OUT
};

@IonicPage()
@Component({
  selector: 'page-app-tabs',
  templateUrl: 'app-tabs.html',
  animations: [
    trigger('prepareToRemove', [
      state('7', style({ opacity: 0 })),
      transition('6 => 7', animate('.5s ease-out'))
    ])
    /*trigger('animateLogin', [
      //state('void', style({ transform: 'translateX(100%)' })),
      //state('0', style({ transform: 'translateX(0)', position: 'absolute', top: 0, left: '50%', zIndex: -1 })),
// Init State
      transition('void => -1', [
        style({ transform: 'translateX(100%)' }), 
        // animate('1s cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)' }))
        animationBuilder({ transform: 'translateX(0)' })
      ]),
      transition('0 => void, 1 => void', [
        style({ transform: 'translateX(0)', position: 'absolute', top: 0, left: '50%', zIndex: -1 }),
        // animate('1s cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(-500%)', opacity: 0 }))
        animationBuilder({ transform: 'translateX(-500%)', opacity: 0 })
      ]),
// Request Sent
      transition('-1 => void', [
        style({ transform: 'translateX(0)' }),
        // animate('1s cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(100%)' }))
        animationBuilder({ transform: 'translateX(100%)' })
      ]),

      transition('void => 1', [
        style({ transform: 'translateX(-500%)', opacity: 0, position: 'absolute', top: 0, left: '50%', zIndex: -1 }),
        // animate('1s cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
        animationBuilder({ transform: 'translateX(0)', opacity: 1 })
      ])
    ])*/
  ]
})
export class AppTabsPage implements AfterViewChecked {

  @ViewChild(LoginWidgetComponent, { read: ElementRef }) loginWidget: ElementRef;
  @ViewChild('SpinnerContainer') spinner: ElementRef;
  @ViewChild(Tabs) tabs: Tabs;
  
  homeRoot = APP_HOME_PAGE;
  searchRoot = APP_SEARCH_PAGE;
  profileRoot = APP_PROFILE_PAGE;

  animationSteps = AnimationLifecicleSteps.SHOW_PRELOADER;
  isAnimating = false;

  componentAnimations: AppTabsAnimations;
  private _sub: Subscription;
  private _flag: number;

  constructor(public authProvider: AuthProvider, 
              public toastCtrl: ToastController,
              animationBuilder: AnimationBuilder) {
    this.componentAnimations = new AppTabsAnimations(animationBuilder);
  }

  ngAfterViewChecked() {
    if (this.isAnimating) {
      return;
    }
    switch (this.animationSteps) {
    
      case AnimationLifecicleSteps.ENTER_LOGIN_TRANSITION: {
        if (this.spinner && this.loginWidget) {
          this.isAnimating = true;
          this.componentAnimations.removePreloader(this.spinner.nativeElement);
          this.componentAnimations.showLoginWidget(this.loginWidget.nativeElement, () => {
            this.animationSteps = AnimationLifecicleSteps.LOGIN_ENTERED;
            this.isAnimating = false;
          });
        }
        break;
      }
      
      case AnimationLifecicleSteps.SIGN_IN_REQUEST_SENT_TRANSITION: {
        if (this.loginWidget && this.spinner) {
          this.isAnimating = true;
          this.componentAnimations.removeLoginWidget(this.loginWidget.nativeElement);
          this.componentAnimations.showPreloader(this.spinner.nativeElement, () => {
            this.authProvider.signIn(this._flag);
            this.animationSteps = AnimationLifecicleSteps.SIGN_IN_REQUEST_SENT;
            this.isAnimating = false;
          });
        }
        break;
      }

      case AnimationLifecicleSteps.REMOVE_PRELOADER_IF_SIGNED: {
        if (this.spinner) {
          this.isAnimating = true;
          this.componentAnimations.removePreloaderIfSign(this.spinner.nativeElement, () => {
            this.animationSteps = AnimationLifecicleSteps.PRELOADER_REMOVED;
            this.isAnimating = false;
          });
        }
        break;
      }

      /*case AnimationLifecicleSteps.SIGN_OUT: {
        if (this.tabs) {
          this.isAnimating = true;
          asap.schedule(() => {
            console.log(this.tabs);
            this.animationSteps = AnimationLifecicleSteps.SHOW_PRELOADER;
            this.authProvider
                  .afAuth
                  .auth
                  .signOut()
                  .then(() => this.isAnimating = false);
          }, 600);
        }
        break;
      }*/
    }
  }
  prepareToRemoveDone({ toState }: any) {
    if (toState == 7) {
      this.animationSteps = AnimationLifecicleSteps.SHOW_PRELOADER;
      this.authProvider
          .afAuth
          .auth
          .signOut();
    }
    
  }

  signInHandler({ flag }: ISignInMeta) {
    this.animationSteps = AnimationLifecicleSteps.SIGN_IN_REQUEST_SENT_TRANSITION;
    this._flag = flag;
  }

  ionViewDidLoad() {
    console.log('TABS PAGE ionViewDidLoad!');
    this._sub = this.authProvider.user.subscribe((user: any) => {
      console.log("AppTabsPage user => ", user);
      asap.schedule(() => {
        this.animationSteps = user ? AnimationLifecicleSteps.REMOVE_PRELOADER_IF_SIGNED : AnimationLifecicleSteps.ENTER_LOGIN_TRANSITION;
      }, this.animationSteps == AnimationLifecicleSteps.SHOW_PRELOADER ? 2000 : 0);
    }, () => {
      this.toastCtrl.create({ message: 'Error occured, try again', duration: 3000, showCloseButton: true }).present();
      this.animationSteps = AnimationLifecicleSteps.ENTER_LOGIN_TRANSITION;
    });
  }

//debug only
  /*ionViewDidEnter() {
    setTimeout(() => {
      console.log('Going to hide app-tabs!');
      this.isUserSigned = false;
      setTimeout(() => {
        console.log('Going to show app-tabs!');
        this.isUserSigned = true;
      },3000);
    }, 8000);
  }*/
//
  // ionViewWillLeave() {
  //   console.log('TABS PAGE ViewWillLeave!');
   
  // }

  ionViewWillUnload() {
    this._sub.unsubscribe();
  }

}

