import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
//import { FormDetalleAsiento } from '../../interfaces/contabilidad/detalle-asiento/form-detalle-asiento.interface';
import { LoadDetalleAsiento } from '../../interfaces/contabilidad/detalle-asiento/load-detalle-asiento.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { DetalleAsiento } from '../../models/contabilidad/detalle-asiento.model';
import { DetalleAsientoU } from '../../models/contabilidad/detalle-asiento.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})

export class DetalleAsientoService {

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

  loadDetallesAsientos() {
    const url = `${base_url}/contabilidad/detalles-asientos`;
    return this.hhtp.get<LoadDetalleAsiento>(url, this.headers);
  }

  loadDetallesAsientoById(id_detalle_asiento: any) {
    const url = `${base_url}/contabilidad/detalles-asientos/${id_detalle_asiento}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalles_asientos: DetalleAsiento }) => resp.detalles_asientos)
      )
  }

  loadDetallesAsientoByIdAsiento3(id_asiento: any) {
    const url = `${base_url}/contabilidad/detalles-asientos/asiento/${id_asiento}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalle_asiento: DetalleAsiento, total_debe: number, total_haber: number }) => resp.detalle_asiento)
      )
  }

  loadDetallesAsientoByIdAsiento(id_asiento: any) {
    const url = `${base_url}/contabilidad/detalles-asientos/asiento/${id_asiento}`;
    return this.hhtp.get<LoadDetalleAsiento>(url, this.headers);
  }

  createDetalleAsiento(formData: any) {
    const url = `${base_url}/detalles-asientos`;
    return this.hhtp.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalle_asiento: DetalleAsiento[] }) => resp.detalle_asiento)
      )
  }

  createDetalleAsientoArray(detalles: DetalleAsiento[]) {
    const url = `${base_url}/contabilidad/detalles-asientos`;
    const formData = { detalles }; // Crear un objeto con una propiedad 'detalles' que contenga el arreglo de detalles
    return this.hhtp.post(url, formData, this.headers).pipe(
      map((resp: { ok: boolean; detalle_asiento: DetalleAsiento[] }) => resp.detalle_asiento)
    );
  }

  updateDetalleAsiento(detalle_asiento: DetalleAsientoU) {
    const url = `${base_url}/contabilidad/detalles-asientos/${detalle_asiento.id_detalle_asiento}`;
    return this.hhtp.put(url, detalle_asiento, this.headers);
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




