import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShopItemPage } from './shop-item';
import { CartWidgetModule } from '../../components';

@NgModule({
  declarations: [
    ShopItemPage,
  ],
  imports: [
    IonicPageModule.forChild(ShopItemPage),
    CartWidgetModule
  ],
})
export class MenuPageModule {}