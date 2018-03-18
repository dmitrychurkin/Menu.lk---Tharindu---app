import { NgModule } from "@angular/core";
import { ShopPage } from "./shop";
import { IonicPageModule } from "ionic-angular";
import { ImageLoaderModule, HeaderModule } from "../../../components";



@NgModule({
  declarations: [ ShopPage ],
  imports: [ 
    IonicPageModule.forChild(ShopPage), 
    ImageLoaderModule,
    HeaderModule ]
})
export class ShopPageModule {} 