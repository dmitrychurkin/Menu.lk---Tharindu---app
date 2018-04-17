import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireDatabaseModule } from 'angularfire2/database';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { ApiProvider, AuthProvider, ShoppingCart, StorageProvider } from '../providers';
import { MyApp } from './app.component';



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
    ApiProvider,
    ShoppingCart,
    StorageProvider,
    AngularFireDatabase,
    AuthProvider
  ]
})
export class AppModule {}
