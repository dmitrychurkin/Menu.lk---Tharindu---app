import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ItemPage } from "./item";
import { HeaderModule } from "../../../../components";

@NgModule({
  declarations: [ ItemPage ],
  imports: [ IonicPageModule.forChild(ItemPage), HeaderModule ]
})
export class ItemPageModule {}