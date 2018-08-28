import { ErrorHandler, NgModule, InjectionToken } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule, AngularFirestore } from 'angularfire2/firestore';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { 
  AuthService, 
  ShoppingCartService, 
  OrdersNotificatorService, 
  RootDataReceiverService, 
  NetworkService,
  ToastMessangerService, 
  OrdersManagerService} from '../services';
import { MyApp } from './app.component';
import { Network } from '@ionic-native/network';
import { StateDataStoreEntity } from '../pages/data-state-store.class';
import { BATCH_SIZE, FORM_USER_TEMPLATE_DATA_TOKEN, FORM_USER_TEMPLATE_DATA } from '../pages/pages.constants';
import { IQuickOrder } from '../interfaces';


export const DataStoreForCurrentOrders = new InjectionToken<StateDataStoreEntity<IQuickOrder>>('current_orders');
const firebaseConfig = {
  apiKey: "AIzaSyDnyJhYizozTXovtuKzUCOrV5gL5mRDUIo",
  authDomain: "menu-lk.firebaseapp.com",
  databaseURL: "https://menu-lk.firebaseio.com",
  projectId: "menu-lk",
  storageBucket: "menu-lk.appspot.com",
  messagingSenderId: "544716606293"
};

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  
  providers: [
    StatusBar,
    SplashScreen,
    ScreenOrientation,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Network,
    NetworkService,
    ShoppingCartService,
    AngularFirestore,
    AuthService,
    OrdersNotificatorService,
    RootDataReceiverService,
    ToastMessangerService,
    { provide: DataStoreForCurrentOrders, useFactory: () => new StateDataStoreEntity({ identificator: 'current_orders', batchSize: BATCH_SIZE }), multi: false },
    { provide: FORM_USER_TEMPLATE_DATA_TOKEN, useValue: FORM_USER_TEMPLATE_DATA, multi: false },
    OrdersManagerService
  ]
})
export class AppModule {}
