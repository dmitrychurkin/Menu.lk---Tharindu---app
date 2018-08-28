import { animate, AnimationBuilder, style } from "@angular/animations";
import { Subscription } from 'rxjs';
import { empty } from 'rxjs/observable/empty';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { timer } from 'rxjs/observable/timer';
import { switchMap, tap } from "rxjs/operators";


export default class {

  protected constructor(private readonly _animationBuilder: AnimationBuilder) {}

  protected _baseAnimationBuilder(element: any, { from, to, timingProps }: IAnimationProps, onDoneFn?: () => void, onStartFn?: () => void) {
   
    const player = this._animationBuilder.build([
      style( from || '*' ),
      this._animationHelper( to, timingProps )
    ]).create(element);

    player.onStart( () => {
      typeof onStartFn === 'function' && onStartFn();
    } );

    player.onDone( () => {
      typeof onDoneFn === 'function' && onDoneFn();
      player.destroy();
    } );

    player.play();

  }

  private _animationHelper(cssProps: { [key: string]: string | number }, animationProps= '1s cubic-bezier(0.4, 0, 0.2, 1)') {
    
    return animate(animationProps, style( cssProps ));

  }

}


export class Animator {

  isLocked = false;
  animate(...elemProps: Array<IAnimatorElementProps>) {

    for (const { elemSelector, transition= '1s', styles= { opacity: 0 }, delay: d= 0, duration= 1000, onBeforeTransition, onTransitionDone } of elemProps) {
      
      const elems = Array.from(document.querySelectorAll(elemSelector.toLowerCase().trim())) as HTMLElement[];
    
      let subscription: Subscription = of(null)

      .pipe( switchMap(() => {
         
          if (typeof onBeforeTransition === 'function' && !onBeforeTransition(elems)) {
    
            return empty();

          }

          this.isLocked = true;

          return timer(d)
          .pipe( switchMap(_ => from<HTMLElement>(elems)

              .pipe(
                  
                switchMap<HTMLElement, number>((el: HTMLElement) => {
            
                  el.style.transition = transition;
                  for (const cssProp in styles) {
      
                    el.style[cssProp] = styles[cssProp];
              
                  }
      
                  return timer(duration).pipe( tap(() => {

                    this.isLocked = false;
                    elems.forEach((el: HTMLElement) => el.style.transition = '');
                  
                  }) );
      
                })
      
              )
            ) 
          )
          
        })
      ).subscribe({ 
          next() {

            typeof onTransitionDone === 'function' && onTransitionDone(elems);

          },
          error() {},
          complete() {

            subscription && subscription.unsubscribe();
            subscription = undefined;

          }
       });

    }

  }

}


export interface IAnimationProps {
  from: { [name: string]: any };
  to: { [name: string]: any };
  timingProps?: string;
}

type StyleObj = { [i: string]: number | string };

export interface IAnimatorElementProps {
  readonly elemSelector: string;
  readonly transition?: string;
  readonly duration?: number;
  readonly delay?: number;
  readonly onBeforeTransition?: (a?: HTMLElement[]) => boolean;
  readonly onTransitionDone?: (a?: HTMLElement[]) => void;
  readonly styles?: StyleObj;
}