import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MenuPage } from './menu';
import { CartWidgetModule, ImageLoaderModule } from '../../components';

@NgModule({
  declarations: [
    MenuPage,
  ],
  imports: [
    IonicPageModule.forChild(MenuPage),
    CartWidgetModule,
    ImageLoaderModule
  ],
})
export class MenuPageModule {}
