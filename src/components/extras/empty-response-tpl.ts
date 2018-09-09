import { Component, Input, OnChanges, SimpleChange } from "@angular/core";
import { MessangingService } from "../../services";

@Component({
  selector: 'extras-empty-response',
  template: `<div class="flex-grid">
                <div>
                  <ion-note>
                    <h1 padding-horizontal text-center>{{ message }}</h1>
                  </ion-note>
                </div>
            </div>`
})
export class EmptyResponseComponent implements OnChanges {

  @Input() subject: string;
  @Input() message = this._setMessage();

  constructor(private readonly _messService: MessangingService) {}

  ngOnChanges({ subject }: {[propKey: string]: SimpleChange}) {
    
    if (subject && subject.currentValue) this._setMessage(subject.currentValue);
    
  }

  private _setMessage(subject= 'items') {

    return subject ? 
              (this.message = this._messService.getMessage(`emptyTpl_${EmptyResponseComponent.name}`, subject))
            : '';

  }

}