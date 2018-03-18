import { NgModule } from "@angular/core";
import { HeaderComponent } from "./header.component";
import { CartModule } from "../cart/cart.module"

@NgModule({
  declarations: [ HeaderComponent ],
  imports: [ CartModule ],
  exports: [ HeaderComponent ]
})
export class HeaderModule {}