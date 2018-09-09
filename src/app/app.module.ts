import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Network } from '@ionic-native/network';
import { IonicStorageModule } from '@ionic/storage';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreModule } from 'angularfire2/firestore';
import { IonicApp, IonicModule } from 'ionic-angular';
import { StateDataStoreEntity } from '../pages/data-state-store.class';
import { BATCH_SIZE, DATA_STORE_CURRENT_ORDERS_TOKEN, FORM_USER_TEMPLATE_DATA, FORM_USER_TEMPLATE_DATA_TOKEN, WINDOW_REF, WINDOW_REF_TOKEN } from '../pages/pages.constants';
import {  AuthService, 
          NetworkService, 
          OrdersManagerService, 
          OrdersNotificatorService, 
          RootDataReceiverService, 
          ShoppingCartService, 
          ToastMessangerService, 
          AppLevelErrorHandler, 
          MessangingService } from '../services';
import { MyApp } from './app.component';


const firebaseConfig = {
  /*apiKey: "AIzaSyDnyJhYizozTXovtuKzUCOrV5gL5mRDUIo",
  authDomain: "menu-lk.firebaseapp.com",
  databaseURL: "https://menu-lk.firebaseio.com",
  projectId: "menu-lk",
  storageBucket: "menu-lk.appspot.com",
  messagingSenderId: "544716606293"*/
  apiKey: "AIzaSyBc6PXR5jSFOYmk-g9YNuDqiXi5-Fr3zh8",
  authDomain: "menulk-1c3a6.firebaseapp.com",
  databaseURL: "https://menulk-1c3a6.firebaseio.com",
  projectId: "menulk-1c3a6",
  storageBucket: "menulk-1c3a6.appspot.com",
  messagingSenderId: "169867882428"
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
    {provide: ErrorHandler, useClass: AppLevelErrorHandler},
    Network,
    NetworkService,
    ShoppingCartService,
    AngularFirestore,
    AuthService,
    OrdersNotificatorService,
    RootDataReceiverService,
    ToastMessangerService,
    { provide: DATA_STORE_CURRENT_ORDERS_TOKEN, useFactory: () => new StateDataStoreEntity({ identificator: 'current_orders', batchSize: BATCH_SIZE }), multi: false },
    { provide: FORM_USER_TEMPLATE_DATA_TOKEN, useFactory: () => FORM_USER_TEMPLATE_DATA, deps: [ MessangingService ],  multi: false },
    { provide: WINDOW_REF_TOKEN, useValue: WINDOW_REF, multi: false },
    OrdersManagerService,
    MessangingService
  ]
})
export class AppModule {}
