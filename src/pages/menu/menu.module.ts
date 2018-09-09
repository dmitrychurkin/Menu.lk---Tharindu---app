import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MenuPage } from './menu';
import { CartWidgetModule, ImageLoaderModule, ExtrasModule } from '../../components';

@NgModule({
  declarations: [
    MenuPage,
  ],
  imports: [
    IonicPageModule.forChild(MenuPage),
    CartWidgetModule,
    ImageLoaderModule,
    ExtrasModule
  ],
})
export class MenuPageModule {}
