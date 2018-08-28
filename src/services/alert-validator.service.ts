import { Alert } from "ionic-angular";


export const DEFAULT_CONFIG: IStyleConfig = { 

  ERROR_CLASS_NAME: 'error', 

  styles: { 

    borderBottom: {
      
      error: '2px solid #f53d3d',
      ok:    '2px solid #32db64'

    }

  } 
  
};


export class AlertUIValidatorService {

  static errorMessageClass = 'error-message';
  static errorContainerElemTag = 'span';

  private _config: IStyleConfig = DEFAULT_CONFIG;
  private _inputAlertFields: Array<HTMLInputElement>;

  constructor(private _alertInstance?: Alert, ...inputAlertFields: Array<IInputsConfig>) {
    
    this._setValidators(inputAlertFields); 
  
  }

  setStyleProps(config= DEFAULT_CONFIG) {

    this._config = config;

  }

  setInputsConfig(alertInstance: Alert, ...inputAlertFields: Array<IInputsConfig>) {

    this._alertInstance = alertInstance;

    this._setValidators(inputAlertFields);

  }

  isUserInputInvalid(initialData?: string, aggregatedData?: string, errorMessage?: string | ((mes: string) => string)/*, checkOnNotEqual= true*/) {

    this.clearPreviousErrors();
  

    let hasError = false;

    for (const input of this._inputAlertFields) {
      // validators: { equality$: Equality } type Equality = 'eq' | 'noteq';

      if (input.checkValidity()) {

        const equalityFlag = (<any>input).equality$;
        if (equalityFlag && (equalityFlag === 'eq' ? initialData === aggregatedData : equalityFlag === 'noteq' ? initialData !== aggregatedData : null)) {

          hasError = this.uiErrorFlowHelper(input, typeof errorMessage === 'function' ? errorMessage(initialData) : errorMessage);

        }

        continue;

      }

      hasError = this.uiErrorFlowHelper(input);

    }
  
    return hasError;
  
  }

  private _setValidators(inputAlertFieldsArray: Array<IInputsConfig>) {

    this._highlightLastBtn();

    this._inputAlertFields = [];

    for (const { id, validators } of inputAlertFieldsArray) {
      
      const element = document.getElementById(id) as HTMLInputElement;

      if (element) {

        this._inputAlertFields.push(element);

        if ( !('disabled' in validators) ) {

          element.onblur = this._blurHandler();
          element.onfocus = this._focusHandler();

          if (validators.autofocus) {
            element.focus();
          }

        }

        for (const validatorPropName in validators) {

          if (validators[validatorPropName]) {

            element[validatorPropName] = validators[validatorPropName];

          }

        }

      }
      
    }

  }

  private _blurHandler() {
      
      return (ev: FocusEvent) => {
  
        const target: HTMLInputElement = ev.target as HTMLInputElement;
  
        if (!target.checkValidity()) {
  
          this.uiErrorFlowHelper(target);
  
        } else {
  
          this.clearPreviousErrors();
  
          this.setOk(target);
          
        }
  
      };
  }

  private _focusHandler() {

    return () => this.clearPreviousErrors();
  
  }

  uiErrorFlowHelper(inputElement: HTMLInputElement, errorMessage?: string) {
    
    const { classList } = this._alertInstance.instance._elementRef.nativeElement;
    const { ERROR_CLASS_NAME } = this._config;
    const { errorContainerElemTag, errorMessageClass } = AlertUIValidatorService;
  
    if (!classList.contains(ERROR_CLASS_NAME)) {

      classList.add(ERROR_CLASS_NAME);

    }

    const errorContainerElem = document.createElement(errorContainerElemTag);
    errorContainerElem.classList.add(errorMessageClass);
    inputElement.parentElement.appendChild(errorContainerElem);
    
    this.setError(inputElement);
    
    errorContainerElem.innerHTML = errorMessage || inputElement.validationMessage;
  
    return true;
  
  }

  clearPreviousErrors() {
  
    Array.from(document.querySelectorAll(`.${AlertUIValidatorService.errorMessageClass}`)).forEach((errorContainer: HTMLSpanElement) => {
      const inputElement = errorContainer.previousElementSibling as HTMLInputElement;

      this._iterateOverStyleProps((prop: string) => inputElement.style[prop] = '');
  
      errorContainer.remove();
  
    });
  
  }

  setOk(inputElement: HTMLInputElement) {

    this._iterateOverStyleProps((propName: string) => inputElement.style[propName] = this._config.styles[propName].ok);

  }

  setError(inputElement: HTMLInputElement) {

    this._iterateOverStyleProps((propName: string) => inputElement.style[propName] = this._config.styles[propName].error);

  }

  private _iterateOverStyleProps(callback: (propName: string) => void) {

    for (const prop in this._config.styles) {

      callback(prop);

    }

  }

  private _highlightLastBtn() {

    if (!this._alertInstance) return;

    const alertButtons = Array.from<HTMLElement>(this._alertInstance.instance._elementRef.nativeElement.querySelector('.alert-button-group').children);
    
    if (alertButtons.length > 1) {

      const lastAlertBtn: HTMLElement = alertButtons.slice(-1)[0];
      lastAlertBtn.style.background = '#488aff';
      lastAlertBtn.style.color = '#fff';

    }

  }

}

interface IStyleConfig {
  readonly ERROR_CLASS_NAME: string;
  readonly styles: {
    readonly [p: string]: {
      error: string;
      ok: string;
    }
  }
}

interface IInputsConfig {
  readonly id: string;
  readonly validators: {
    readonly [i: string]: any;
  }
}

