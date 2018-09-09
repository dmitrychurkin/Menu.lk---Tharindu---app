import { Component, Inject } from '@angular/core';
import { Events, IonicPage, Item, NavController, AlertController } from 'ionic-angular';
import { FormUserTemplateData, IAuthUserPayload } from '../../interfaces';
import { AuthService, AlertUIValidatorService, ToastMessangerService } from '../../services';
import { AnimationLifecicleSteps, AppTabsPage } from '../app-tabs/app-tabs';
import { ANGULAR_ANIMATION_OPACITY, APP_EV, FORM_USER_TEMPLATE_DATA_TOKEN, ERROR_CLASS_NAME, FIREBASE_DB_TOKENS, FILE_UPLOAD_MAX_REQ } from '../pages.constants';
import { AngularFirestore } from 'angularfire2/firestore';
import { firestore } from 'firebase/app';


const { USERS } = FIREBASE_DB_TOKENS;
const { SIZE, MIME_TYPE_ARR } = FILE_UPLOAD_MAX_REQ;
const BOX_SHADOW = 'inset 0px 0px 14px 8px rgba(0, 0, 255, .2)';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  animations: [ANGULAR_ANIMATION_OPACITY()]
})
export class ProfilePage {

  AuthUserData: IAuthUserPayload;
  userSelectedFieldNumber: number;
  avatarLoaded = false;
  signOutClicked = false;
  private _animationDoneHandler: Function;
  private readonly _tabsParentInstance: AppTabsPage = this._navCtrl.parent.viewCtrl.instance;
  private _selectedFieldBtn: HTMLElement;
  private readonly _alertUIValidatorService: AlertUIValidatorService = new AlertUIValidatorService;
 
  private _isActionBtnClicked: boolean;
  private _fileFieldErrorMessage: string;
  private _equalityErrMessage = (subject: string) => `New ${subject} must be differ from old one`

  constructor(
    @Inject(FORM_USER_TEMPLATE_DATA_TOKEN) readonly userTemplateData: FormUserTemplateData,
    private readonly _alertCtrl: AlertController,
    private readonly _navCtrl: NavController,
    private readonly _events: Events,
    private readonly _afDb: AngularFirestore,
    private readonly _toastMessService: ToastMessangerService,
    readonly authService: AuthService) {

    authService.user$.subscribe((authUserData: IAuthUserPayload) => this.AuthUserData = authUserData);
    
  }

  onSignOut() {
    if (this.signOutClicked) return;
    this.signOutClicked = true;
    this._tabsParentInstance.animationSteps = AnimationLifecicleSteps.SIGN_OUT;
  }

  resetTabs() {
    return this._navCtrl.parent.select(0);
  }

  ionViewDidLoad() {
    this._animationDoneHandler = (done: true) => {
      if (done) {
        this.resetTabs().then(() => {
          const User = this.authService.userInstance;
          return User.isAnonymous ? User.delete() : this.authService.signOut();
        });
      }
    };

    this._events.subscribe(APP_EV.TABS_SIGN_IN_ANIMATION_DONE, this._animationDoneHandler);
  }

  ionViewWillUnload() {
    this._events.unsubscribe(APP_EV.TABS_SIGN_IN_ANIMATION_DONE, this._animationDoneHandler);
    delete this._selectedFieldBtn;
  }

  ionViewWillLeave() {
    this._uiHelper(this._selectedFieldBtn, this.userSelectedFieldNumber);
  }

  onUpdate(what: 'email' | 'password' | 'profile') {

    if (this._isActionBtnClicked) return;
    this._uiHelper(this._selectedFieldBtn, this.userSelectedFieldNumber);
    this._isActionBtnClicked = true;
    const capitalize = what.charAt(0).toUpperCase() + what.slice(1);

    let type, minLength, maxLength, pattern, required, promiseResolveFn;
    const fileLoadPromise = new Promise((res: (data: string | null) => void) => promiseResolveFn = res);
    if (what !== 'password') {

      const templateObject = this.userTemplateData.find((templateData: any) => {

        switch (what) {
          case 'email':
            return templateData.type === what;
          case 'profile':
            return templateData.type === 'text';
        }

      });

      if (templateObject) {

        ({ type, validators: { minlength: minLength, maxlength: maxLength, pattern, required } } = templateObject);

      }

    }

    const changeCredentialFlowHandler = (errorMessage?: string, errorClassName?: string) => {
      
      const profileNameCustomValidator = (profile_name: string) => {

        if (typeof profile_name === 'string' && profile_name) {

          return profile_name.length >= +minLength ? false : this._alertUIValidatorService.uiErrorFlowHelper(document.getElementById('profile_name') as HTMLInputElement, `Name must contain minimum ${minLength} characters`);

        }
        
        return false;
         
      };

      const inputs = what === 'profile' ?
        [
          { 
            type, 
            placeholder: 'Profile name',
            name: 'profile_name',
            id: 'profile_name'
          },
          {
            type: 'file',
            placeholder: 'Select File',
            name: 'profile_photo',
            id: 'profile_photo'
          }
        ]
        :
        [
          {
            type: what,
            placeholder: capitalize,
            name: what,
            id: what
          },
          {
            type: 'password',
            placeholder: what === 'password' ? 'New Password' : 'Password',
            name: 'new_password',
            id: 'new_password'
          }
        ];
        
      const alertInstance = this._alertCtrl.create({
        title: `Changing ${what}`,
        subTitle: `Please enter Your new ${what}${what === 'profile' ? ' name': ''}`,
        cssClass: errorClassName,
        message: errorMessage,
        enableBackdropDismiss: false,
        inputs,
        buttons: [
          {
            text: 'cancel',
            role: 'cancel',
            handler: _ => { delete this._isActionBtnClicked; delete this._fileFieldErrorMessage }
          },
          {
            text: 'change',
            handler: ({ email, password, new_password, profile_name }: any) => {
             
              const { isUserInputInvalid } = this._alertUIValidatorService;
              const runValidatorsArray = [
                isUserInputInvalid.apply(this._alertUIValidatorService, 
                  what === 'email' ? 
                      [ this.AuthUserData.userData.email, email, this._equalityErrMessage(what) ] 
                    : what === 'profile' ?
                      [ this.AuthUserData.userData.displayName, profile_name, this._equalityErrMessage('profile name') ]
                    : []),

                ...(what === 'profile' ? [ profileNameCustomValidator(profile_name), this._fileFieldErrorMessage && this._alertUIValidatorService.uiErrorFlowHelper(document.getElementById('profile_photo') as HTMLInputElement, this._fileFieldErrorMessage) ] : [] ) 
              ];

              if (runValidatorsArray.some((validationResult: boolean) => !!validationResult)) {
                
                return false;

              }

              (function (this: ProfilePage) {

                switch (what) {
                  case 'email':
                    return this.authService.updateUserEmail(email, new_password);
                  case 'password':
                    return this.authService.updateUserPassword(password, new_password);
                  case 'profile': {
                    promiseResolveFn(null);
                    return Promise.all([ 
                      profile_name.length > 0 ? this.authService.updateUserProfile(profile_name) : Promise.resolve(null),
                      fileLoadPromise.then((userPhotoURL: string | null) => {
                       
                        if (userPhotoURL) {

                          return this._afDb.doc(`${USERS}/${this.AuthUserData.userData.uid}`)
                                            .update({ userPhotoURL });
                        }

                        return null;

                      })
                    ])
                  }
                }

              }.call(this))
                .then((userProfileOutput?: null[] | undefined) => {

                  delete this._isActionBtnClicked;
                  delete this._fileFieldErrorMessage;
                  const message = what === 'profile' && Array.isArray(userProfileOutput) && userProfileOutput.every(res => res === null) ? 
                                          `In order to update profile You must specify new name or include avatar photo` 
                                        : `Your ${what.toUpperCase()} has been successfully updated`;
                  this._toastMessService.showToast({ message });
                  
                })
                .catch((err: Error) => changeCredentialFlowHandler(err.message, ERROR_CLASS_NAME));

            }
          }
        ]
      });

      alertInstance.present()
        .then(_ => {

          const fileField = document.getElementById('profile_photo') as HTMLInputElement;
          const nameField = document.getElementById('profile_name') as HTMLInputElement;
          
          if (fileField) {

            fileField.onblur = ({ target }: any) => typeof this._fileFieldErrorMessage === 'undefined' && this._alertUIValidatorService.setOk(target);
            fileField.onchange = (event: any) => {
                      
              let reader = new FileReader();
              const { files } = event.target;
              reader.onload = (readerEvent: any) => {
                  console.log('reader.onload ', readerEvent, files);
                  delete this._fileFieldErrorMessage;
                  this._alertUIValidatorService.clearPreviousErrors();

                  this._fileFieldErrorMessage = '';
                  const { size, type } = files[0];
                  if (SIZE < size) {
                    
                    this._fileFieldErrorMessage = `File size must be less than ${SIZE / 1000} Kb. Current size is ${(size / 1000).toFixed(0)} Kb`;

                  }
                  

                  if (MIME_TYPE_ARR.indexOf(type) == -1) { 
                    
                    this._fileFieldErrorMessage += '<br>Incorrect file type, must to be JPG or PNG!';

                  }

                  if (this._fileFieldErrorMessage) {

                    return this._alertUIValidatorService.uiErrorFlowHelper(fileField, this._fileFieldErrorMessage);

                  }

                  const imageData = (readerEvent.target as any).result;
                  this._alertUIValidatorService.setOk(fileField);
                  return promiseResolveFn(imageData);

              };
          
              files[0] && reader.readAsDataURL(files[0]);
              
            };

          }

          const { setInputsConfig } = this._alertUIValidatorService;
          
          setInputsConfig.call(this._alertUIValidatorService, 
            alertInstance, 
            ...(function () {

              const passwordValidators = { required: true };

              switch (what) {

                case 'profile':
                  return [{ id: 'profile_name', validators: {  maxLength, equality$: 'eq' } }];
                case 'password':
                case 'email':
                  return [{ id: what, validators: { ...passwordValidators, ...(what === 'email' ? { required, pattern, minLength, maxLength, equality$: 'eq' } : {}) } },
                          { id: 'new_password', validators: { ...passwordValidators, ...(what === 'password' ? { minLength: 6 } : {}) } }];
              
              }

            }())
          );

          if (nameField) {

            nameField.onblur = ({ target }: any) => !profileNameCustomValidator(target.value) && this._alertUIValidatorService.setOk(nameField);

          }

        })
    };
    
    changeCredentialFlowHandler();


  }

  onFieldSelect({ target }: any, button: Item, index: number) {

    const btnElem = target.closest('.js-field-control');

    if (btnElem) {

      if (this._isActionBtnClicked) return;
      this._isActionBtnClicked = true;

      const { classList } = btnElem;
      const templateDataUnit = this.userTemplateData[index];
      const subject = templateDataUnit.mappedDbName.split('user')[1].toUpperCase();
      const _subject1 = subject.toLowerCase();
      const capitalizedSubject = _subject1.charAt(0).toUpperCase() + _subject1.slice(1);
      const { control: id, type, mappedDbName, label } = templateDataUnit;
      const { userData: { uid }, userProfileData } = this.AuthUserData;

      switch (true) {

        case classList.contains('js-edit'): {


          const { minlength: minLength, maxlength: maxLength = 100, pattern } = templateDataUnit.validators;
          const alertInstance = this._alertCtrl.create({
            title: `Edit profile ${capitalizedSubject}`,
            enableBackdropDismiss: false,
            subTitle: `Please enter new profile ${subject}`,
            inputs: [
              {
                type,
                placeholder: label.charAt(0).toUpperCase() + label.slice(1),
                name: mappedDbName,
                value: userProfileData[mappedDbName],
                id
              }
            ],
            buttons: [
              {
                text: 'cancel',
                role: 'cancel',
                handler: _ => delete this._isActionBtnClicked
              },
              {
                text: 'save',
                handler: (data: IAuthUserPayload) => {

                  if (this._alertUIValidatorService.isUserInputInvalid(userProfileData[mappedDbName], data[mappedDbName], this._equalityErrMessage(subject))) {

                    return false;

                  }

                  let isError: boolean;

                  this._afDb.doc(`${USERS}/${uid}`)
                    .update(data)
                    .catch(_ => isError = true)
                    .then(_ => {
                      delete this._isActionBtnClicked;
                      this._toastMessService.showToast({ message: isError ? `Error occured, try again` : `Your ${subject} has been updated` });
                    });

                }
              }
            ]

          });

          alertInstance.present().then(_ =>
            this._alertUIValidatorService.setInputsConfig(alertInstance, { id, validators: { ...templateDataUnit.validators, ...{ minLength, maxLength, pattern, equality$: 'eq' } } })
          );

          break;
        }

        case classList.contains('js-delete'): {

          if (!userProfileData[mappedDbName]) {

            return delete this._isActionBtnClicked;

          };

          this._afDb.doc(`${USERS}/${uid}`)
            .update({ [mappedDbName]: firestore.FieldValue.delete() })
            .then(() => {

              this._alertCtrl.create({
                title: `${capitalizedSubject} deleted!`,
                subTitle: `Your ${subject} has been deleted`,
                buttons: ['OK']
              }).present()
                .then(_ => delete this._isActionBtnClicked);

            });

          break;
        }

      }

    } else {

      this._uiHelper(button, index);

    }

  }

  private _uiHelper(button: Item | HTMLElement, index: number) {

    const btn = button && (button instanceof HTMLElement ? button : button.getNativeElement());

    if (btn) {

      if (this.userSelectedFieldNumber == index) {

        delete this.userSelectedFieldNumber;

        if (this._selectedFieldBtn) {

          this._selectedFieldBtn.style.boxShadow = '';

        } else {

          btn.style.boxShadow = BOX_SHADOW;

        }

      } else {

        this.userSelectedFieldNumber = index;

        if (this._selectedFieldBtn) {

          this._selectedFieldBtn.style.boxShadow = '';

        }

        btn.style.boxShadow = BOX_SHADOW;
      }

      this._selectedFieldBtn = btn;

    }

  }

}
