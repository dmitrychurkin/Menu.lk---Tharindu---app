import { Injectable, Renderer2 } from '@angular/core';
import { Content, Platform } from 'ionic-angular';
import { Img } from '../components';

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
  private _renderer2: Renderer2;

  constructor(
    private _plt: Platform
  ) {}

  configure(content: Content, renderer2: Renderer2): this {
    
    this._content = content;
    this._renderer2 = renderer2;
    
    this._resetArray();
    return this;
  }

  updateImgs() {
    const ilen = this._images.length;
    if (!this._content || ilen == 0) {
      return;
    }
    
    let { scrollTop, contentHeight, directionY } = this._content;
    if (!contentHeight) {
      contentHeight = this.fallbackVPHeight;
    }

    for (let i = 0; i < ilen; i++) {
      if (!this._images[i]) continue;

      const { viewTarget, renderBuffer } = this._images[i];
      
      const { bottom, top } = this._plt.getElementBoundingClientRect(viewTarget);
      
      switch (directionY) {
        case 'down': {
          const viewArea = contentHeight + renderBuffer;
          if (top < viewArea && bottom > 0) {
            
            this._images[i].isCanRender = true;
            
            this.renderImage(this._images[i]);

            continue;
          }
          
          break;
        }

        case 'up': {

          if (bottom > (0 - renderBuffer) && top < contentHeight) {
            
            this._images[i].isCanRender = true;

            this.renderImage(this._images[i]);
            continue;
          }

          break;
        }
      }

      this._images[i].isCanRender = false;
    }

  }
  checkDuplicateImage(img: Img) {
    for (let i = 0; i < this._images.length; i++) {
      const currentSavedImg = this._images[i];
      if (img.id && currentSavedImg.id && currentSavedImg.id === img.id) {
        const { isCanRender, hasViewed } = this._images[i];
        img.isCanRender = isCanRender;
        img.hasViewed = hasViewed;
        this._images[i] = img;
        return this._images[i];
      }
    }
  }
  renderImage(img: Img) {
    const { hasViewed, isCanRender } = img;
    if (!isCanRender || hasViewed) return;
    this.render(img);
    img.hasViewed = true;
  }
  render(img: Img) {
    const { imgElement, imageContainer, rootContainer, imageContainerHeight } = img;
    const { offsetHeight } = imgElement;

    const containerHeight =  imageContainerHeight || offsetHeight;
    this._renderer2.addClass(imgElement, 'image');
    this._renderer2.addClass(imageContainer, 'ready');
    this._renderer2.setStyle(imgElement, 'height', `${containerHeight}px`);
    if (containerHeight) {
      this._renderer2.setStyle(imageContainer, 'height', `${containerHeight}px`);
      this._renderer2.setStyle(rootContainer.nativeElement, 'height', `${containerHeight}px`);
    }
  }
  get fallbackVPHeight() {
    const pltHeight = this._plt.height();
    const pltWidth = this._plt.width();
    if ( this._plt.isPortrait() ) {
      return Math.max(pltHeight, pltWidth);
    }
    return Math.min(pltHeight, pltWidth);
  }
  private _resetArray() {
    this._images.length = 0;
  }
}
