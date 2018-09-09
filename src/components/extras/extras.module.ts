import { NgModule } from "@angular/core";
import { EmptyResponseComponent } from "./empty-response-tpl";
import { IonicModule } from "ionic-angular";
import { OfflineTemplateComponent } from "./offline-tpl";

@NgModule({
  imports: [ IonicModule ],
  exports: [ EmptyResponseComponent, OfflineTemplateComponent ],
  declarations: [ EmptyResponseComponent, OfflineTemplateComponent ]
})
export class ExtrasModule {}