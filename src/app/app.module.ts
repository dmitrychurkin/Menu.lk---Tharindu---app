import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { NativeAudio } from '@ionic-native/native-audio';

import { MyApp } from './app.component';
import { ApiProvider, ShoppingCart, StorageProvider, AuthProvider }  from '../providers';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

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
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    NativeAudio,
    ApiProvider,
    ShoppingCart,
    StorageProvider,
    AngularFireDatabase,
    AuthProvider
  ]
})
export class AppModule {}
