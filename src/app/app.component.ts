import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  currency = "$";

  productsData: any;

  loader = true;
  loaderShowed = true;

  form = this.fb.group({
    product: ["", Validators.required],
    name: ["", Validators.required],
    phone: ["", Validators.required],

  });

mainImageStyle: any;
orderImageStyle: any;
@HostListener("document:mousemove", ["$event"])
onMouseMove(e: MouseEvent) {
  this.mainImageStyle = {transform: "translate(" + ((e.clientX * 0.3) / 8) + "px," + ((e.clientY * 0.3) / 8) + "px)" };
  this.orderImageStyle = {transform: "translate(-" + ((e.clientX * 0.3) / 8) + "px,-" + ((e.clientY * 0.3) / 8) + "px)" };
}

  constructor(private fb: FormBuilder, private http: HttpClient) {

  }

  ngOnInit() {        
    setTimeout(()=> {
      this.loaderShowed = false;
    }, 2000);

    setTimeout(()=> {
      this.loader = false;
    }, 3000);
    
    // запрос на получение данных о печеньях с сервера
    this.http.get("https://testologia.ru/cookies").subscribe(data => this.productsData = data);         //отправили запрос на сайт и сохранили полученные данные в переменную productsData
  }
  
  scrollTo(target: HTMLElement, product?: any) {
    target.scrollIntoView({behavior: "smooth"});
    if (product) {
      this.form.patchValue({product: product.title + ' (' + product.price + ' ' + this.currency + ')'});     // добавка в поле конечной формы Ваше печенье выбранного печенья с его ценой
    }
  }

  switchSugarFree(e: any) {
    this.http.get("https://testologia.ru/cookies" + (e.currentTarget.checked ? '?sugarfree' : ''))
      .subscribe(data => this.productsData = data);
  }

changeCurrency() {
 
    let newCurrency = "$";
    let coefficient = 1;

    if (this.currency === "$") {
        newCurrency = "₽"; // российский рубль
        coefficient = 90;
    }
    else if (this.currency === "₽") {
        newCurrency = "UZS";
        coefficient = 12600; // узбекский сум
    }
    else if (this.currency === "UZS") {
        newCurrency = "€"; // евро
        coefficient = 0.9;
    } else if (this.currency === "€") {
        newCurrency = "CN¥"; // китайский юань
        coefficient = 7.3; // актуальный курс
    }
    else if (this.currency === "CN¥") {
        newCurrency = "£"; // британский фунт стерлингов
        coefficient = 0.78;
    }
    else if (this.currency === "£") {
        newCurrency = "DH"; // дирхам ОАЭ
        coefficient = 3.67;
    }
    this.currency = newCurrency;

    this.productsData.forEach((item: any) => {
      item.price =  +(item.basePrice * coefficient).toFixed(1);
    });
}
confirmOrder() {
  if (this.form.valid) { //если форма валидна, то...
    this.http.post("https://testologia.ru/cookies-order", this.form.value) //отправляем запрос по этому адресу с введенными в форму данными
    .subscribe({
      next: (response: any) => { //если запрос успешен, то выполняется следующее
        alert(response.message); // сообщение с backend
        this.form.reset(); // очистка введенных данных после отправки заказа
      },
      error: (response: any) => { //если запрос не успешен, то выполняется следующее
        alert(response.error.message); // сообщение об ошибке
      }
    }); //обработка ответа от сервера
  }
}

}
