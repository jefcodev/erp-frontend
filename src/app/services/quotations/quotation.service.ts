import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map } from 'rxjs';

//Model
import { Quotation } from 'src/app/models/quotations/quotation.model';

// API
import { environment } from 'src/environments/environment';

// Variable para la API 
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  constructor(private  http: HttpClient) { }


  get token(): string {
    return localStorage.getItem('token');
  }
  
  get headers(){
    return {
       headers :{
        'x-token' : this.token
       }
    }
  }

  cargarQuotations(){
    //inventory/units
    const url=`${base_url}/quotation`;
    return this.http.get(url, this.headers)
    .pipe(
      map((resp :{ok:boolean, quotations: Quotation[]}
      ) => resp.quotations)
    )
  }

  createPurchase(quotation:any) {
    const url = `${base_url}/quotation`;
    return this.http.post(url, quotation, this.headers);
  }

}
