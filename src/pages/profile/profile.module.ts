import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CartWidgetModule } from '../../components';
import { ProfilePage } from './profile';

@NgModule({
  declarations: [
    ProfilePage
  ],
  imports: [
    IonicPageModule.forChild(ProfilePage),
    CartWidgetModule
  ]
})
export class ProfilePageModule {}
