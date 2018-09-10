import { Injectable } from "@angular/core";
import { MessangingService } from "./messaging-registry.service";
import { APP_MENU_PAGE } from "../pages/pages.constants";

@Injectable()
export class AvailabilityService {

  constructor(private readonly _messService: MessangingService) {}

  checkAvailability(workingTime: Array<string> | { open: string; close: string }, date= new Date): { isClosed: boolean, message: string } {

    const { open, close } = this._dataNormalizer(workingTime);

    if (close) {

      const toNumber = (timeStr: string) => +timeStr.split(':').join('');
      const timeConverterFn = (timeStr) => {
  
        const timeParts = timeStr.split(':');
        
        return `${ +timeParts[0] % 12 || 12 }${ +timeParts[1] == 0 ? ' ' : `:${timeParts[1]} ` }${ +timeParts[0] < 12 ? 'AM' : 'PM' }`
  
      };

      const openTimeNum = toNumber(open);
      const closeTimeNum = toNumber(close);
      const currentTimeNum = +`${date.getHours()}${('0' + date.getMinutes()).slice(-2)}`;
      const closedResult = { message: this._messService.getMessage(`closed_${APP_MENU_PAGE}`, timeConverterFn(open)), isClosed: true };
      const openResult = { message: this._messService.getMessage(`open_${APP_MENU_PAGE}`, timeConverterFn(close)), isClosed: false };
  
      if (closeTimeNum < openTimeNum) {
  
        if (currentTimeNum < openTimeNum && currentTimeNum >= closeTimeNum) {
  
          return closedResult;
  
        }
  
        return openResult;
  
      }
  
      
  
      if (currentTimeNum >= openTimeNum && currentTimeNum < closeTimeNum) {
  
        return openResult;
  
      }
  
      return closedResult;
  
    }
  
    return { message: this._messService.getMessage(`open24_7_${APP_MENU_PAGE}`, open), isClosed: false };

  }

  private _dataNormalizer(workingTime: Array<string> | { open: string; close: string }) {

    return Array.isArray(workingTime) ? { open: workingTime[0], close: workingTime[1] } : workingTime;
  
  }

}