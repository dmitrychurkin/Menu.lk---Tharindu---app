import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginWidgetModule } from '../../components';
import { AppTabsPage } from './app-tabs';

@NgModule({
  declarations: [
    AppTabsPage,
  ],
  imports: [
    IonicPageModule.forChild(AppTabsPage),
    LoginWidgetModule
  ]
})
export class AppTabsPageModule {}
