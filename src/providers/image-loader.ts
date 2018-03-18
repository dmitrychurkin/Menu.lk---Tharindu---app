import { QueryList, ElementRef, Injectable, Renderer2 } from '@angular/core';
import { Content, Platform } from 'ionic-angular';
import { Img } from '../components';
import { IMG_DATA_FIELD_TOKEN } from '../pages/pages.constants';

/*
 .image {
    transition: 1s;
    opacity: 0;
  }
  .image-container.ready {
    color: rgba(0, 0, 0, 0);
    .image {
      opacity: 1;
    }
  }
*/
@Injectable()
export class ImageLoader {

  _images: Img[] = [];
  _content: Content;
  _resultSet: any[] | null = null;

  private _renderer2: Renderer2;

  constructor(
    private _plt: Platform,
    // private _renderer2: Renderer2
  ) {
    console.log("Call from ImageLoaderProvider => ", this);
  }
  get isImagesReady(): (value?: true | PromiseLike<true>) => void {
    let resolverFn = null;
    new Promise((resolve: any) => resolverFn = resolve)
            .then(() => this.updateImgs());
    return resolverFn;
  }
  updateImgs() {
    const ilen = this._images.length;
    if (!this._content || ilen == 0) {
      return;
    }
    
    const { scrollTop, contentHeight, directionY } = this._content;
    console.log("Debug => ", this._plt, this._images);
    for (let i = 0; i < ilen; i++) {
      if (!this._images[i]) continue;
      const { viewTarget, imgElement, renderBuffer, requestBuffer } = this._images[i];
      
      const { bottom, top } = this._plt.getElementBoundingClientRect(viewTarget);
      switch (directionY) {
        case 'down': {
          const viewArea = contentHeight + renderBuffer;
          const requestArea = viewArea + requestBuffer;
          if (top < requestArea && top > viewArea) {
            
            this._images[i].isCanRequest = true;
            this._images[i].isCanRender = false;

            this._requestImage(this._images[i], i);
            continue;
          }
          if (top < viewArea && bottom > 0) {
            
            this._images[i].isCanRequest = this._images[i].isCanRender = true;
            
            this._requestImage(this._images[i], i);
            continue;
          }
          
          break;
        }

        case 'up': {
          if (bottom < (0 - renderBuffer) && bottom > ( 0 - renderBuffer - requestBuffer )) {
            
            this._images[i].isCanRequest = true;
            this._images[i].isCanRender = false;
            
            this._requestImage(this._images[i], i);
            continue;
          }
          if (bottom > (0 - renderBuffer) && top < contentHeight) {
            
            this._images[i].isCanRequest = this._images[i].isCanRender = true;

            this._requestImage(this._images[i], i);
            continue;
          }

          break;
        }
      }

      this._images[i].isCanRequest = this._images[i].isCanRender = false;
    }
  }
  configure(content: Content, renderer2: Renderer2, resultSet?: any[]): this {
    console.log("From ImageLoader.configure => ", resultSet);
    this._content = content;
    this._renderer2 = renderer2;
    this._resultSet = resultSet;
    this._resetArray();
    return this;
  }

  private _requestImage(img: Img, index: number) {
    console.log("ImageLoader._requestImage => index ", index, this._resultSet);
    let { imgElement, imageContainer, isCanRequest, imgSrc= this._resultSet[index][IMG_DATA_FIELD_TOKEN] } = img;
    if (!isCanRequest) return;

    if (typeof img._unregListLoad === 'undefined' && typeof img._unregListError === 'undefined') {

      img._unregListLoad = this._plt.registerListener(imgElement, 'load', () => {
        img.hasLoaded = true;
        this._renderImage(img, index);
      }, { passive: true });

      img._unregListError = this._plt.registerListener(imgElement, 'error', () => {
        img.hasError = true;
        this._renderImage(img, index);
      }, { passive: true });

      imgElement.src = imgSrc;

    }else {
      this._renderImage(img, index);
    }
    
  }

  private _renderImage(img: Img, index: number) {
    const { imgElement, imageContainer, isCanRender, hasLoaded, hasError, rootContainer, imageContainerHeight } = img;
    const { offsetHeight } = imgElement;

    if (!isCanRender) return;
    const containerHeight =  imageContainerHeight || offsetHeight;
    const fn = () => {
      if (containerHeight) {
        this._renderer2.setStyle(imageContainer, 'height', `${containerHeight}px`);
        this._renderer2.setStyle(rootContainer.nativeElement, 'height', `${containerHeight}px`);
      }
      this._clearImg(img, index);
    };
    if (hasLoaded) {
      this._renderer2.addClass(imgElement, 'image');
      this._renderer2.addClass(imageContainer, 'ready');
      this._renderer2.setStyle(imgElement, 'height', `${containerHeight}px`);
      fn();
    }
    if (hasError) {
      this._renderer2.addClass(imageContainer, 'error');
      fn();
    }
    
  }

  private _clearImg(img: Img, index: number) {
      img._unregListLoad && img._unregListLoad();
      img._unregListError && img._unregListError();
      // this._images.splice(index, 1);
      delete this._images[index];
  }
  private _resetArray() {
    this._images.length = 0;
  }
  /*loadImages(images: Array<string> | undefined, imgsContainers: QueryList<ElementRef>) {
    if (!Array.isArray(images)) return;
    let loader = 
    ({ nativeElement: imgContainer }: ElementRef, index: number) => {
        let image = new Image();
        if (!imgContainer) return;
        image.onload = () => {
            imgContainer.appendChild(image);
            imgContainer.style.height = `${image.offsetHeight}px`;
            imgContainer.classList.add('ready');
        };
        image.onerror = () => {
          imgContainer.classList.add('error');
        };
        image.src = images[index];
        image.className = 'image';
  
    };
    
    let subscription = imgsContainers.changes.subscribe((imgsContReady: any) => {
      if (images.length == imgsContReady.length) {
        imgsContainers.forEach( loader );
      }
      subscription.unsubscribe();
    });

  }*/
  
}
