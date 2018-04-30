import { NgModule } from "@angular/core";
import { LoginWidgetComponent } from "./login-widget.component";
import { IonicModule } from "ionic-angular";

@NgModule({
  declarations: [ LoginWidgetComponent ],
  imports: [ IonicModule ],
  exports: [ LoginWidgetComponent ]
})
export class LoginWidgetModule {}