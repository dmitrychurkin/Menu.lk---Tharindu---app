import { AfterViewInit, Component, ElementRef, Input, ViewEncapsulation, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from "@angular/core";
import { asap } from "rxjs/Scheduler/asap";

@Component({
  selector: 'img-loader',
  template: `<div class="image-container" [class.ready]="isCanRender" [class.font-hidden]="isIconHidden" [ngStyle]="{ height: height ? height + 'px' : '', width: width ? width + 'px' : '' }">
              <div class="mock-image-container">
                <div class="mock">
                   <ion-icon name="images"></ion-icon> 
                </div>
              </div>
              <img class="image" [style.height.px]="height" (load)="onImageLoaded()" [src]="imgSrc">
            </div>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageLoaderComponent implements OnInit, AfterViewInit {

  @Input('icon-hidden') isIconHidden?: boolean;
  @Input() threshold?: number = 0;
  @Input() width?: number;
  @Input() height?: number;
  @Input('options') ioOptions?: IntersectionObserverInit = {
    root: null,
    rootMargin: '0%',
    threshold: this.threshold
  };

  get imgSrc() {
    return this._isCanSetSrc ? this._cachedSrc : '';
  }

  @Input('src') 
  set imgSrc(src: string) {

    this._cachedSrc = src;

  }

  isCanRender: boolean;
  private _isImageLoaded: boolean;
  private _isCanSetSrc: boolean;
  private _cachedSrc: string;
  private _isImageVisible: boolean;
  private _io: IntersectionObserver;

  constructor(private _imgContainer: ElementRef, private _cdRef: ChangeDetectorRef) {}
  
  ngOnInit() {

    this._cdRef.detach();

  }

  ngAfterViewInit() {

    this._setUpIO();
    this._cdRef.detectChanges();

  }

  onImageLoaded() {  
    
    asap.schedule(() => {

      this._isImageLoaded = true;
      if (this._isImageVisible) {
        
        this._allowImageRender();

      }

    }, 50);

  }

  private _allowImageRender() {
    
    this.isCanRender = true;
    this._removeIO();
    this._cdRef.detectChanges();

  }

  private _setUpIO() {

    if (!this._cachedSrc) {
      return;
    }

    if (typeof IntersectionObserver === 'function') {

      this._removeIO();
      this._io = new IntersectionObserver((entries: IntersectionObserverEntry[]) => 
      entries.forEach(({ isIntersecting }: IntersectionObserverEntry) => {
        
        this._isImageVisible = isIntersecting;

        if (isIntersecting) {

          if (!this._isCanSetSrc) {

            this._isCanSetSrc = true; 
            this._cdRef.detectChanges();
  
          }

          if (this._isImageLoaded) {
          
            this._allowImageRender();

          }

        }

      }), this.ioOptions);

      this._io.observe(this._imgContainer.nativeElement);

    }

  }

  private _removeIO() {

    if (this._io) {
      this._io.disconnect();
      this._io = undefined;
    }

  }

}