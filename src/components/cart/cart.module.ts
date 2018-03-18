import { NgModule } from "@angular/core";
import { CartComponent } from "./cart.component";
import { IonicModule } from "ionic-angular";

@NgModule({
  declarations: [ CartComponent ],
  imports: [ IonicModule ],
  exports: [ CartComponent, IonicModule ]
})
export class CartModule {}