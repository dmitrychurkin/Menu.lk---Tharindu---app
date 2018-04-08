
import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input, AfterViewInit, ViewChild, ElementRef, Renderer2 } from "@angular/core";
import { ImageLoader } from "../../providers";
import { Ion, Content } from "ionic-angular";

const RENDER_BUFFER_DEFAULT = 400;

@Component({
  selector: 'img-loader',
  template: `<div class="image-container" [class.font-hidden]="isIconHidden">
              <div class="mock-image-container">
                <div class="mock">
                   <ion-icon name="images"></ion-icon> 
                </div>
              </div>
              <img [src]="imgSrc || ''" #img>
            </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ImageLoaderComponent implements AfterViewInit {
  @ViewChild('img') img: ElementRef;

  @Input('icon-hidden') isIconHidden?: boolean;
  @Input() target: HTMLElement | Ion;
  @Input() renderedBuffer = RENDER_BUFFER_DEFAULT;
  @Input() height?: number;
  @Input() width?: number;
  @Input('src') imgSrc?: string;
  @Input() id?: string;

  constructor(
    private _imageLoader: ImageLoader,
    private _renderer2: Renderer2,
    private _elRef: ElementRef
  ) {}

  ngAfterViewInit() {
    
    const imgElement = this.img.nativeElement;
    const imageContainer = this._renderer2.parentNode(imgElement);
    const { target, _elRef: rootContainer, renderedBuffer, id } = this;
    
    this._setInitHeight(imageContainer, this.height);
    const IMAGE = new Img({
      imgElement, 
      imageContainer, 
      viewTarget: target instanceof HTMLElement ? target : target.getNativeElement(),
      renderedBuffer,
      rootContainer,
      imageContainerHeight: this.height,
      imageContainerWidth: this.width,
      id
    });
    
    const newImg = this._imageLoader.checkDuplicateImage(IMAGE);
    console.log("IMAGES => ", this._imageLoader._images);
    if (newImg instanceof Img) {
      if (newImg.hasViewed) {
        this._imageLoader.render(IMAGE);
      }
    }else {
      this._imageLoader._images.push(IMAGE);
    }
    this._imageLoader.updateImgs();
  }
  private _setInitHeight(imageContainer, height) {
    if (height) {
      this._renderer2.setStyle(this._elRef.nativeElement, 'height', `${height}px`);
      this._renderer2.setStyle(imageContainer, 'height', `${height}px`);
    }
  }
}

export class Img {

  isCanRender = false;
  hasViewed = false;
  imgElement: HTMLImageElement;
  imageContainer: HTMLElement;
  rootContainer: ElementRef;
  viewTarget: HTMLElement;
  renderBuffer: number;
  imageContainerHeight: number;
  imageContainerWidth: number;
  id = '';

  constructor({ 
    imgElement, 
    imageContainer, 
    viewTarget, 
    renderedBuffer,  
    rootContainer,
    imageContainerHeight,
    imageContainerWidth,
    id }: IImgSettings) {

    this.imgElement = imgElement;
    this.imageContainer = imageContainer;
    this.viewTarget = viewTarget;
    this.renderBuffer = renderedBuffer;
    this.rootContainer = rootContainer;
    this.imageContainerHeight = imageContainerHeight;
    this.imageContainerWidth = imageContainerWidth;
    this.id = id;
  }
}
interface IImgSettings {
  id: string;
  imgElement: HTMLImageElement;
  imageContainer: HTMLElement;
  rootContainer: ElementRef;
  viewTarget: HTMLElement;
  imageContainerHeight?: number;
  imageContainerWidth?: number;
  renderedBuffer?: number;
}