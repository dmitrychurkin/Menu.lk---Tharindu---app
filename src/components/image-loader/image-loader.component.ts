
import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input, AfterViewInit, ViewChild, ElementRef, Renderer2 } from "@angular/core";
import { ImageLoader } from "../../providers";
import { Ion } from "ionic-angular";

const REQUEST_BUFFER_DEFAULT = 1400;
const RENDER_BUFFER_DEFAULT = 400;

@Component({
  selector: 'img-loader',
  template: `<div class="image-container" [class.font-hidden]="isIconHidden">
              <div class="mock-image-container">
                <div class="mock">
                   <ion-icon name="images"></ion-icon> 
                </div>
              </div>
              <img #img>
            </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ImageLoaderComponent implements AfterViewInit {
  @ViewChild('img') img: ElementRef;

  @Input('icon-hidden') isIconHidden?: boolean;
  @Input() target: HTMLElement | Ion;
  @Input() requestBuffer = REQUEST_BUFFER_DEFAULT;
  @Input() renderedBuffer = RENDER_BUFFER_DEFAULT;
  @Input() height?: number;
  @Input() width?: number;
  @Input('src') imgSrc?: string;

  constructor(
    private _imageLoader: ImageLoader,
    private _renderer2: Renderer2,
    private _elRef: ElementRef
  ) {}

  ngAfterViewInit() {
    
    const imgElement = this.img.nativeElement;
    const imageContainer = this._renderer2.parentNode(imgElement);
    const { target, _elRef: rootContainer, renderedBuffer, requestBuffer, imgSrc } = this;
    
    this._setInitHeight(imageContainer, this.height);
    this._imageLoader._images.push(new Img({
      imgElement, 
      imageContainer, 
      viewTarget: target instanceof HTMLElement ? target : target.getNativeElement(),
      renderedBuffer,
      requestBuffer,
      imgSrc,
      rootContainer,
      imageContainerHeight: this.height,
      imageContainerWidth: this.width
    }));
  }
  private _setInitHeight(imageContainer, height) {
    if (height) {
      this._renderer2.setStyle(this._elRef.nativeElement, 'height', `${height}px`);
      this._renderer2.setStyle(imageContainer, 'height', `${height}px`);
    }
  }
  ngAfterContentInit() {
    //this._parentElem$ = this._elementRef$.nativeElement.parentElement;

    //this._img = this._elementRef$.nativeElement.firstChild;
    /*this._unreg = this._plt$.registerListener(this._img, 'load', () => {
      this._hasLoaded = true;
      this._rend2$.addClass(this._parentElem$, 'ready');
      this.update();
    }, { passive: true });

    this._unreg$ = this._plt$.registerListener(this._img, 'error', (e) => {
      console.log(e);
      this._hasLoaded = false;
      this._rend2$.addClass(this._parentElem$, 'error');
      this.update();
    }, { passive: true });*/
    //this._rend2$.listen(this._img, 'load', () => this._rend2$.addClass(this._parentElem$, 'ready'));
    // this._rend2$.listen(this._img, 'error', (e) => {
    //   console.log(e);
    //   this._rend2$.addClass(this._parentElem$, 'error');
    // });
    
  }

}

export class Img {
  isCanRequest = false;
  isCanRender = false;
  hasLoaded = false;
  hasError = false;
  imgElement: HTMLImageElement;
  imageContainer: HTMLElement;
  rootContainer: ElementRef;
  viewTarget: HTMLElement;
  requestBuffer: number;
  renderBuffer: number;
  imgSrc: string;
  imageContainerHeight: number;
  imageContainerWidth: number;
  _unregListLoad: Function;
  _unregListError: Function;

  constructor({ 
    imgElement, 
    imageContainer, 
    viewTarget, requestBuffer, 
    renderedBuffer, 
    imgSrc, 
    rootContainer,
    imageContainerHeight,
    imageContainerWidth }: IImgSettings) {

    this.imgElement = imgElement;
    this.imageContainer = imageContainer;
    this.viewTarget = viewTarget;
    this.requestBuffer = requestBuffer;
    this.renderBuffer = renderedBuffer;
    this.rootContainer = rootContainer;
    this.imageContainerHeight = imageContainerHeight;
    this.imageContainerWidth = imageContainerWidth;
  }
}
interface IImgSettings {
  imgElement: HTMLImageElement;
  imageContainer: HTMLElement;
  rootContainer: ElementRef;
  viewTarget: HTMLElement;
  imgSrc?: string;
  imageContainerHeight?: number;
  imageContainerWidth?: number;
  requestBuffer?: number;
  renderedBuffer?: number;
}