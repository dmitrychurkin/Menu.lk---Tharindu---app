import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PopoverCartMenu } from './popover-cart-menu';

@NgModule({
  declarations: [
    PopoverCartMenu,
  ],
  imports: [
    IonicPageModule.forChild(PopoverCartMenu)
  ]
})
export class PopoverCartMenuModule {}