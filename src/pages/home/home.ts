import { Component, Injector } from '@angular/core';
import { IonicPage, Toggle } from 'ionic-angular';
import { IRestaurants } from '../../interfaces';
import { IFetcherArgs, ShoppingCartService } from '../../services';
import { PageBaseClass } from '../page-base.class';
import { FIREBASE_DB_TOKENS } from '../pages.constants';


const { RESTAURANTS, CATERING } = FIREBASE_DB_TOKENS;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage extends PageBaseClass<SegmentOptions, IRestaurants> {

  currentSegmentValue: SegmentOptions = RESTAURANTS;
  catering = CATERING;
  restaurants = this.currentSegmentValue;

  sortingFn = (reversedFlag = true) => ({ rating: ratingA }: IRestaurants, { rating: ratingB }: IRestaurants) => reversedFlag ? (ratingA - ratingB) : (ratingB - ratingA);

  constructor(readonly shoppingCardService: ShoppingCartService, injector: Injector) {
    super(injector);
  }

  get CONFIG(): IFetcherArgs<IRestaurants> {

    return {
      mode: 'slice',
      collection: RESTAURANTS
    };

  };

  toggleSort({ value }: Toggle) {

    this.dataStore.itemCollection.sort(this.sortingFn(!value));

  }

}

type SegmentOptions = 'restaurants' | 'catering';