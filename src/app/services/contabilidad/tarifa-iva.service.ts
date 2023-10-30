import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
//import { FormTarifaIVA } from '../../interfaces/compra/tarifa_iva/form-tarifa_iva.interface';
import { LoadTarifaIVA } from '../../interfaces/contabilidad/tarifa-iva/load-tarifa-iva.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { TarifaIVA } from '../../models/contabilidad/tarifa-iva.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class TarifaIVAService {

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

  loadTarifasIVA() {
    const url = `${base_url}/tarifas-iva`;
    return this.hhtp.get<LoadTarifaIVA>(url, this.headers);
  }

  loadTarifaIVAById(id_tarifa_iva: any) {
    const url = `${base_url}/tarifas-iva/id/${id_tarifa_iva}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, tarifa_iva: TarifaIVA }) => resp.tarifa_iva)
      )
  }

  createTarifaIVA(formData: any) {
    const url = `${base_url}/tarifas-iva`;
    return this.hhtp.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, tarifa_iva: TarifaIVA[] }) => resp.tarifa_iva)
      )
  }

  updateTarifaIVA(tarifa_iva: TarifaIVA) {
    const url = `${base_url}/tarifas-iva/${tarifa_iva.id_tarifa_iva}`;
    return this.hhtp.put(url, tarifa_iva, this.headers);
  }

  deleteTarifaIVA(id_tarifa_iva: any) { //OJO: any
    const url = `${base_url}/tarifas-iva/${id_tarifa_iva}`;
    return this.hhtp.delete(url, this.headers);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  // Validación de token 
  validarToken(): Observable<boolean> {
    const token = localStorage.getItem('token') || '';
    return this.hhtp.get(`${base_url}/login/renew`, {
      headers: {
        'x-token': token
      }

    }).pipe(
      tap((resp: any) => {
        /*  console.log(resp);//OJO
        const {nombre, apellido,email,estado ,rol_id, img, uid} = resp.usuario;
        this.usuario = new Usuario(uid,nombre, apellido, email, rol_id,img,estado,''); */
        //this.usuario.imprimirUsuario();
        localStorage.setItem('token', resp.token);
      }),
      map(resp => true),
      catchError(error => of(false))
    )
  }

  // Validación de token Fin //OJO
  login(formData: any) {
    const fomrLogin: LoginForm = formData;
    return this.hhtp.post(`${base_url}/login`, fomrLogin)
      .pipe(
        tap((resp: any) => {
          localStorage.setItem('token', resp.token)
        })
      )
  }

}




