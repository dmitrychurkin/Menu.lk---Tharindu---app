import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppTabsPage } from './app-tabs';

@NgModule({
  declarations: [
    AppTabsPage,
  ],
  imports: [
    IonicPageModule.forChild(AppTabsPage),
  ]
})
export class AppTabsPageModule {}
