import { Component } from "@angular/core";
import { MessangingService } from "../../services";

@Component({
  selector: 'extras-offline',
  template: `<div class="flex-grid">
              <div>
                <ion-note>
                  <h1 padding-horizontal text-center>{{ messService.getMessage('offlineTpl_OfflineTemplateComponent') }}</h1>
                </ion-note>
              </div>
            </div>`
})
export class OfflineTemplateComponent {

  constructor(readonly messService: MessangingService) {}
}