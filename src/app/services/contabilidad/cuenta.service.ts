import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
import { FormCuenta } from '../../interfaces/contabilidad/cuenta/form-cuenta.interface';
import { LoadCuenta } from '../../interfaces/contabilidad/cuenta/load-cuenta.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { Cuenta } from '../../models/contabilidad/cuenta.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})

export class CuentaService {

  constructor(private http: HttpClient,
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

  loadCuentas(desde: number = 0, limit: number = 0) {
    const url = `${base_url}/contabilidad/cuentas?desde=${desde}&limit=${limit}`;
    return this.http.get<LoadCuenta>(url, this.headers);
  }

  loadCuentasAll() {
    const url = `${base_url}/contabilidad/cuentas/all`;
    return this.http.get<LoadCuenta>(url, this.headers);
  }

  loadCuentaById(id_cuenta: any) {
    const url = `${base_url}/contabilidad/cuentas/id/${id_cuenta}`;
    return this.http.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, cuenta: Cuenta }) => resp.cuenta)
      )
  }

  loadCuentaByCodigo(codigo: any) {
    const url = `${base_url}/contabilidad/cuentas/codigo/${codigo}`;
    return this.http.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, cuenta: Cuenta }) => resp.cuenta)
      )
  }

  createCuenta(formData: FormCuenta) {
    const url = `${base_url}/contabilidad/cuentas`;
    return this.http.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, cuenta: Cuenta[] }) => resp.cuenta)
      )
  }

  updateCuenta(cuenta: Cuenta) {
    const url = `${base_url}/contabilidad/cuentas/${cuenta.id_cuenta}`;
    return this.http.put(url, cuenta, this.headers);
  }

  deleteCuenta(id_cuenta: any) { //OJO: any
    const url = `${base_url}/contabilidad/cuentas/${id_cuenta}`;
    return this.http.delete(url, this.headers);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  // Validación de token 
  validarToken(): Observable<boolean> {
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${base_url}/login/renew`, {
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
    return this.http.post(`${base_url}/login`, fomrLogin)
      .pipe(
        tap((resp: any) => {
          localStorage.setItem('token', resp.token)
        })
      )
  }

}




