import { NgModule } from "@angular/core";
import { IonicModule } from "ionic-angular";
import { CartWidgetComponent } from "./cart-widget.component";
import { CartWidgetService } from "./cart-widget.service";

@NgModule({
  declarations: [ CartWidgetComponent ],
  imports: [ IonicModule ],
  exports: [ CartWidgetComponent ],
  providers: [ CartWidgetService ]
})
export class CartWidgetModule {}