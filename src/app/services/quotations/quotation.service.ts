import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map } from 'rxjs';

//Model
import { Proforma } from 'src/app/models/quotations/quotation.model';
import { Venta } from 'src/app/models/venta/venta.model';

// API
import { environment } from 'src/environments/environment';

// Variable para la API 
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  constructor(private http: HttpClient) { }


  get token(): string {
    return localStorage.getItem('token');
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }

  cargarQuotations() {
    //inventory/units
    const url = `${base_url}/quotation`;
    return this.http.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, quotations: Proforma[] }
        ) => resp.quotations)
      )
  }

  createProfroma(proforma: Proforma) {
    const url = `${base_url}/quotation`;
    return this.http.post(url, proforma, this.headers);
  }
  
  updateProfroma(proforma: Proforma) {
    const url = `${base_url}/quotation`;
    return this.http.put(url, proforma, this.headers);
  }

  
  createProformaFactura(venta: Venta) {
    const url = `${base_url}/quotation/factura`;
    return this.http.post(url, venta, this.headers);
  }
  



  cargarProformaId(id_proforma: number){
    const url = `${base_url}/quotation/${id_proforma}`;
    return this.http.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, proformaId: Proforma[] }) => resp.proformaId)
      )

  }

}
