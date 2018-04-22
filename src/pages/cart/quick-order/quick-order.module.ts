import { NgModule } from "@angular/core";
import { QuickOrder } from "./quick-order";
import { IonicPageModule } from "ionic-angular";

@NgModule({
  declarations: [ QuickOrder ],
  imports: [ IonicPageModule.forChild(QuickOrder) ]
})
export class QuickOrderModule {}