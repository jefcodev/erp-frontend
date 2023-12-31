import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

import { LoadLibroDiario } from 'src/app/interfaces/contabilidad/libro-diario/load-libro-diario.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class LibroDiarioService {

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

  loadLibroDiario() {
    const url = `${base_url}/contabilidad/libro-diario`;
    return this.hhtp.get<LoadLibroDiario>(url, this.headers);
  }

  loadSumaDebeHaber() {
    const url = `${base_url}/contabilidad/libro-diario/suma`;
    return this.hhtp.get<LoadLibroDiario>(url, this.headers);
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
