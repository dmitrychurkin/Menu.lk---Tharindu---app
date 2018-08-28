import { animate, AnimationBuilder, state, style, transition, trigger } from '@angular/animations';
import { AfterViewChecked, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CollectionReference, DocumentChangeAction } from 'angularfire2/firestore';
import { Events, IonicPage, Tabs } from 'ionic-angular';
import { distinctUntilChanged, pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { User } from 'firebase';
import { DataStoreForCurrentOrders } from '../../app/app.module';
import { ISignInMeta, LoginWidgetComponent } from '../../components';
import { IQuickOrder } from '../../interfaces';
import { AuthService, IPWDSignInFlowHandlers, OrdersNotificatorService, Providers, RootDataReceiverService, ToastMessangerService } from '../../services';
import { StateDataStoreEntity } from '../data-state-store.class';
import { APP_EV, APP_HOME_PAGE, APP_PROFILE_PAGE, APP_SEARCH_PAGE, OrderStatus } from '../pages.constants';
import AppTabsAnimations from './app-tabs.animation';

export enum AnimationLifecicleSteps {
  SHOW_PRELOADER = 0,
  ENTER_LOGIN_TRANSITION = 1,
  LOGIN_ENTERED = 2,
  REMOVE_PRELOADER_IF_SIGNED = 3,
  SIGN_IN_REQUEST_SENT_TRANSITION = 4,
  SIGN_IN_REQUEST_SENT = 5,
  PRELOADER_REMOVED = 6,
  SIGN_OUT = 7,
  NEW_USER_TRANSITION = 8,
  NEW_USER = 9,
  NEW_USER_REMOVE = 10
};

@IonicPage()
@Component({
  selector: 'page-app-tabs',
  templateUrl: 'app-tabs.html',
  animations: [
    trigger('prepareToRemove', [
      state('7', style({ opacity: 0 })),
      state('10', style({ transform: 'translateX(100%)' })),
      transition('6 => 7, 9 => 10', animate('.5s ease-out'))
    ])
  ]
})
export class AppTabsPage implements AfterViewChecked {

  @ViewChild(LoginWidgetComponent, { read: ElementRef }) loginWidget: ElementRef;
  @ViewChild('SpinnerContainer') spinner: ElementRef;
  @ViewChild(Tabs) tabs: Tabs;
  @ViewChild('NewUserWidget', { read: ElementRef }) newUserWidget: ElementRef;

  homeRoot = APP_HOME_PAGE;
  searchRoot = APP_SEARCH_PAGE;
  profileRoot = APP_PROFILE_PAGE;

  animationSteps = AnimationLifecicleSteps.SHOW_PRELOADER;
  isAnimating = false;

  componentAnimations: AppTabsAnimations;
  private _sub: Subscription;
  private _flag: number;

  constructor(readonly authProvider: AuthService,
    readonly toastMessanger: ToastMessangerService,
    readonly events: Events,
    @Inject(DataStoreForCurrentOrders) private readonly _dataStorageCurrentOrders: StateDataStoreEntity<IQuickOrder>,
    private readonly _rootDataReceiverService: RootDataReceiverService<IQuickOrder>,
    private readonly _ordersNotificatorService: OrdersNotificatorService,
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
            let PWD_handlers: IPWDSignInFlowHandlers;
            if (this._flag == Providers.PWD) {
              PWD_handlers = {
                onCancel: _ => this.animationSteps = AnimationLifecicleSteps.ENTER_LOGIN_TRANSITION,
                onSuccess: _ => {}
              };
            }
            this.authProvider.signIn(this._flag, PWD_handlers);
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

      case AnimationLifecicleSteps.NEW_USER_TRANSITION: {

        if (this.spinner && this.newUserWidget) {
          this.isAnimating = true;
          this.componentAnimations.removePreloader(this.spinner.nativeElement);
          this.componentAnimations.showNewUserWidget(this.newUserWidget.nativeElement, () => {
            this.animationSteps = AnimationLifecicleSteps.NEW_USER;
            this.isAnimating = false;
          })
        }
        break;
      }

    }
  }
  prepareToRemoveDone({ toState }: any) {

    switch (toState) {
      case AnimationLifecicleSteps.SIGN_OUT:
        return this.events.publish(APP_EV.TABS_SIGN_IN_ANIMATION_DONE, true);

      case AnimationLifecicleSteps.NEW_USER_REMOVE:
        return this.animationSteps = AnimationLifecicleSteps.PRELOADER_REMOVED;
    }
    
  }
  startApp() {
    this.animationSteps = AnimationLifecicleSteps.NEW_USER_REMOVE;
  }

  signInHandler({ flag }: ISignInMeta) {
    this.animationSteps = AnimationLifecicleSteps.SIGN_IN_REQUEST_SENT_TRANSITION;
    this._flag = flag;
  }

  ionViewDidLoad() {

    this._sub = this.authProvider
      .user$
      .pipe(
        pluck('userData'),
        distinctUntilChanged((p: User, q: User) => p && q ? p.uid === q.uid : p === q)
      )
      .subscribe({
        next: (user: User) => {

          if (user) {

            const { uid, isAnonymous } = user;
            this._rootDataReceiverService.emitFetch({
              collection: 'orders',
              mode: 'list',
              resourceObject: this._dataStorageCurrentOrders,
              queryFn: (ref: CollectionReference) => ref.where('uid', '==', uid).where('orderStatus', '<', OrderStatus.DONE),
              onQueryComplete: (data: DocumentChangeAction<IQuickOrder>[], resourceObject: StateDataStoreEntity<IQuickOrder>, isInit: boolean) => this._ordersNotificatorService.onOrderData(data, resourceObject, isInit)
            });

            this.animationSteps = isAnonymous || this.authProvider.isNewUser ? AnimationLifecicleSteps.NEW_USER_TRANSITION : AnimationLifecicleSteps.REMOVE_PRELOADER_IF_SIGNED;

            return;

          }

          this.animationSteps = AnimationLifecicleSteps.ENTER_LOGIN_TRANSITION;

        },
        error: _ => {
          this.toastMessanger.showToast({ message: 'Error occured, try again', showCloseButton: true });
          this.animationSteps = AnimationLifecicleSteps.ENTER_LOGIN_TRANSITION;
        }
      });
  }

  ionViewWillUnload() {
    this._sub.unsubscribe();
  }

}

