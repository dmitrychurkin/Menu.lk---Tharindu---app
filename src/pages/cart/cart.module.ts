import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CartWidgetModule } from '../../components';
import { CartPage } from './cart';

@NgModule({
  declarations: [
    CartPage,
  ],
  imports: [
    IonicPageModule.forChild(CartPage),
    CartWidgetModule
  ],
})
export class CartPageModule {}
