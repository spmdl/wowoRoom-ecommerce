export default class Validator {
  constructor() {
    this._validationFalseNum = 4;
  }

  setValidationFalseNum(diffNum) {
    this._validationFalseNum += diffNum;
  }

  getValidationFalseNum() {
    return this._validationFalseNum;
  }

  processFormDataToObj(form) {
    return {
      "name": form.elements.姓名.value,
      "tel": form.elements.電話.value,
      "email": form.elements.Email.value,
      "address": form.elements.寄送地址.value,
      "payment": form.elements.交易方式.value,
    }
  }

  clearForm(formData) {
    formData.reset();
    this._validationFalseNum = 4;
    //  把驗證提示訊息重新顯示
    document.getElementById("customerName-message").classList.remove('invisible');
    document.getElementById("customerPhone-message").classList.remove('invisible');
    document.getElementById("customerEmail-message").classList.remove('invisible');
    document.getElementById("customerAddress-message").classList.remove('invisible');
    document.getElementById("submitBtn").setAttribute("disabled", "");
  }

  // 驗證判斷式
  checkDataValidation(customerName, customerData) {
    const phoneReg = /^(\d{2,3}-?|\(\d{2,3}\))\d{3,4}-?\d{4}|09\d{2}(\d{6}|-\d{3}-\d{3})$/;
    // const emailReg = /^([^.][a-z].?[a-z.]+)@(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/;
    const emailReg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    const validation = {
        'customerName': customerData === "" ? false : true ,
        'customerPhone': !phoneReg.test(customerData) ? false : true ,
        'customerEmail': !emailReg.test(customerData) ? false : true,
        'customerAddress': customerData === "" ? false : true ,
    }
    return validation[customerName];
  }
}
