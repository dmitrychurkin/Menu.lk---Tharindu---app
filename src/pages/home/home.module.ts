import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import { ImageLoaderModule, HeaderModule } from '../../components';


@NgModule({
  declarations: [
    HomePage
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
    ImageLoaderModule,
    HeaderModule
  ]
})
export class HomePageModule {}
