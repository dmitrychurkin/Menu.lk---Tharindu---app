import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { CartWidgetModule } from "../../../../components";
import { ItemPage } from "./item";

@NgModule({
  declarations: [ ItemPage ],
  imports: [ IonicPageModule.forChild(ItemPage), CartWidgetModule ]
})
export class ItemPageModule {}