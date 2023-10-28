import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
import { FormAsiento } from '../../interfaces/contabilidad/asiento/form-asiento.interface';
import { LoadAsiento } from '../../interfaces/contabilidad/asiento/load-asiento.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { Asiento } from '../../models/contabilidad/asiento.model';
import { DetalleAsiento } from '../../models/contabilidad/detalle-asiento.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class AsientoService {
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

  loadAsientos() {
    const url = `${base_url}/asientos`;
    return this.hhtp.get<LoadAsiento>(url, this.headers);
  }

  loadAsientoById(id_asiento: any) {
    const url = `${base_url}/asientos/${id_asiento}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, asiento: Asiento }) => resp.asiento)
      )
  }

  createAsiento(formData: FormAsiento) {
    const url = `${base_url}/asientos`;
    return this.hhtp.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, asiento: Asiento[] }) => resp.asiento)
      )
  }

  updateAsiento(asiento: Asiento) {
    const url = `${base_url}/asientos/${asiento.id_asiento}`;
    return this.hhtp.put(url, asiento, this.headers);
  }

  deleteAsiento(id_asiento: any) { //OJO: any
    const url = `${base_url}/asientos/${id_asiento}`;
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




