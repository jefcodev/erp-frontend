import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
import { FormFormaPago } from '../../interfaces/contabilidad/forma-pago/form-forma-pago.interface';
import { LoadFormaPago } from '../../interfaces/contabilidad/forma-pago/load-forma-pago.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { FormaPago } from '../../models/contabilidad/forma-pago.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FormaPagoService {

  constructor(private hhtp: HttpClient,
    private router: Router) { }

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

  loadFormasPago() {
    console.log("SERVICE - loadFormasPago() {")
    const url = `${base_url}/formas-pago`;
    console.log("EDISOn URL")
    console.log(url)

    return this.hhtp.get<LoadFormaPago>(url,);
  }

  loadFormaPagoById(id_forma_pago: any) {
    console.log("SERVICE - loadFormaPagoById(id_forma_pago: any) {")
    console.log(id_forma_pago)
    const url = `${base_url}/formas-pago/id/${id_forma_pago}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, forma_pago: FormaPago }) => resp.forma_pago)
      )
  }

  loadFormaPagoByCodigo(codigo: any) {
    console.log("\n\n-> (service) loadFormaPagoByCodigo(codigo: any) {")
    console.log('codigo: ', codigo)
    const url = `${base_url}/formas-pago/codigo/${codigo}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, forma_pago: FormaPago }) => resp.forma_pago)
      )
  }

  createFormaPago(formData: FormFormaPago) {
    console.log('\n\n-> (service)  createFormaPago(formData: FormFormaPago) {');
    console.log('formData: ' + formData);
    const url = `${base_url}/formas-pago`;
    console.log("url")
    console.log(url)
    return this.hhtp.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, forma_pago: FormaPago[] }) => resp.forma_pago)
      )
  }

  updateFormaPago(forma_pago: FormaPago) {
    console.log("SERVICE - updateFormaPago(forma_pago: FormaPago) { ")
    console.log(forma_pago.id_forma_pago)
    //const url = `${base_url}/formas-pago/3`;
    const url = `${base_url}/formas-pago/${forma_pago.id_forma_pago}`;
    console.log("Service - URL")
    console.log(url)
    return this.hhtp.put(url, forma_pago, this.headers);
  }

  deleteFormaPago(id_forma_pago: any) { //OJO: any
    console.log("deleteFormaPago(id_forma_pago: any) {")
    console.log(id_forma_pago)
    const url = `${base_url}/formas-pago/${id_forma_pago}`;
    return this.hhtp.delete(url, this.headers);
  }





}




