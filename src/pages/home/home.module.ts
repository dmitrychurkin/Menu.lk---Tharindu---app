import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CartWidgetModule, ImageLoaderModule } from '../../components';
import { HomePage } from './home';


@NgModule({
  declarations: [
    HomePage
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
    ImageLoaderModule,
    CartWidgetModule
  ]
})
export class HomePageModule {}