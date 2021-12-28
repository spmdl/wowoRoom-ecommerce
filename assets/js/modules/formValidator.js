export default class Validator {
  constructor() {
    this._validationFalseNum = 4;
  }

  getValidationFalseNum() {
    return this._validationFalseNum;
  }

  processFormData(form) {
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

  // 切換錯誤提示
  invisibleError(e) {
    const customerDom = document.getElementById(`${e.target.id}-message`);
    const retValidation = this._customerDataValidation(e.target.id, e.target.value);
    const retInvisible = customerDom.getAttribute("class").includes('invisible');
    if (retValidation && !retInvisible) {
      // 驗證有過、現在有錯誤提示
      customerDom.classList.add('invisible');
      this._validationFalseNum -= 1;
    } else if (!retValidation && retInvisible) {
      // 驗證沒過、現在沒有錯誤提示
      customerDom.classList.remove('invisible');
      this._validationFalseNum += 1;
    }
    if (this._validationFalseNum === 0) {
      submitBtn.removeAttribute('disabled');
    }
  }

  // 驗證判斷式
  _customerDataValidation(customerName, customerData) {
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
