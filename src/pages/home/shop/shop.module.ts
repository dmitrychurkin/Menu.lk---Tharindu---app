import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { CartWidgetModule, ImageLoaderModule } from "../../../components";
import { ShopPage } from "./shop";



@NgModule({
  declarations: [ ShopPage ],
  imports: [ 
    IonicPageModule.forChild(ShopPage), 
    ImageLoaderModule,
    CartWidgetModule ]
})
export class ShopPageModule {} 