import { NgModule } from "@angular/core";
import { ImageLoaderComponent } from "./image-loader.component";
import { ImageLoader } from "../../providers";
import { IonicModule } from "ionic-angular";

@NgModule({
  declarations: [ ImageLoaderComponent ],
  imports: [ IonicModule ],
  exports: [ ImageLoaderComponent ],
  providers: [ ImageLoader ]
})
export class ImageLoaderModule {}