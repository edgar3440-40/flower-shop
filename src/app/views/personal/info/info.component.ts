import {Component, OnInit} from '@angular/core';
import {PaymentType} from "../../../../types/payment.type";
import {FormBuilder, Validators} from "@angular/forms";
import {DeliveryType} from "../../../../types/delivery.type";
import {UserService} from "../../../shared/services/user.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {UserInfoType} from "../../../../types/user-info.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

  deliveryType: DeliveryType = DeliveryType.delivery;
  deliveryTypes =  DeliveryType;
  paymentTypes = PaymentType;

  userInfoForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    phone: [''],
    fatherName:[''],
    paymentType: [PaymentType.cashToCourier],
    // deliveryType: [DeliveryType.delivery],
    email: ['', Validators.required],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: ['']
  });


  constructor(private fb: FormBuilder, private userService: UserService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {

    this.userService.getUserInfo()
      .subscribe((data: UserInfoType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        const userInfo = data as UserInfoType;

        const paramsToUpdate = {
          firstName: userInfo.firstName ? userInfo.firstName : '',
          lastName: userInfo.lastName ? userInfo.lastName : '',
          phone: userInfo.phone ? userInfo.phone : '',
          fatherName: userInfo.fatherName ? userInfo.fatherName : '',
          paymentType: userInfo.paymentType ? userInfo.paymentType : PaymentType.cashToCourier,
          email: userInfo.email ? userInfo.email : '',
          street: userInfo.street ? userInfo.street : '',
          house: userInfo.house ? userInfo.house : '',
          entrance: userInfo.entrance ? userInfo.entrance : '',
          apartment: userInfo.apartment ? userInfo.apartment : ''
        }

        this.userInfoForm.setValue(paramsToUpdate);
        if(userInfo.deliveryType) {
          this.deliveryType = userInfo.deliveryType;
        }
      })
  }


  changeDeliveryType(deliveryType: DeliveryType) {
    // this.userInfoForm.get('deliveryType')?.setValue(deliveryType);
    this.deliveryType = deliveryType;
    this.userInfoForm.markAsDirty();
  }

  updateUserInfo() {

    if(this.userInfoForm.valid) {

      const paramObj: UserInfoType = {
          email: this.userInfoForm.value.email ? this.userInfoForm.value.email : '',
          deliveryType: this.deliveryType,
          paymentType: this.userInfoForm.value.paymentType ? this.userInfoForm.value.paymentType : PaymentType.cashToCourier,

      }

      if(this.userInfoForm.value.firstName) {
        paramObj.firstName = this.userInfoForm.value.firstName
      }
      if(this.userInfoForm.value.lastName) {
        paramObj.lastName = this.userInfoForm.value.lastName
      }
      if(this.userInfoForm.value.fatherName) {
        paramObj.fatherName = this.userInfoForm.value.fatherName
      }
      if(this.userInfoForm.value.phone) {
        paramObj.phone = this.userInfoForm.value.phone
      }
      if(this.userInfoForm.value.street) {
        paramObj.street = this.userInfoForm.value.street
      }
      if(this.userInfoForm.value.house) {
        paramObj.house = this.userInfoForm.value.house
      }
      if(this.userInfoForm.value.house) {
        paramObj.house = this.userInfoForm.value.house
      }
      if(this.userInfoForm.value.apartment) {
        paramObj.apartment = this.userInfoForm.value.apartment
      }

      this.userService.updateUserInfo(paramObj)
        .subscribe({
          next: (data: DefaultResponseType) => {
            if(data.error) {
              this._snackBar.open(data.message);
              throw new Error(data.message);
            }

            this._snackBar.open('Data saved successfully')
            this.userInfoForm.markAsDirty();

          },
          error: (errorResponse : HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message)
            } else {
              this._snackBar.open('Error during the saving');
            }
          }
        })
    }
  }
}
