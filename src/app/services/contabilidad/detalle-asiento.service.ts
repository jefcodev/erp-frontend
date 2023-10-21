import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
import { FormDetalleAsiento } from '../../interfaces/contabilidad/detalle-asiento/form-detalle-asiento.interface';
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

  loadDetalleAsientos() {
    const url = `${base_url}/detalle-asientos`;
    return this.hhtp.get<LoadDetalleAsiento>(url, this.headers);
  }

  loadDetalleAsientoById(id_detalle_asiento: any) {
    console.log("SERVICE - loadDetalleAsientoById(id_detalle_asiento: any) {")
    console.log("id_detalle_asiento")
    console.log(id_detalle_asiento)
    const url = `${base_url}/detalle-asientos/${id_detalle_asiento}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalle_asiento: DetalleAsiento }) => resp.detalle_asiento)
      )
  }

  loadDetalleAsientoByAsiento(id_asiento: any) {
    console.log(id_asiento)
    const url = `${base_url}/detalle-asientos/asiento/${id_asiento}`;
    return this.hhtp.get<LoadDetalleAsiento>(url, this.headers);
  }

  createDetalleAsiento(formData: FormDetalleAsiento) {
    const url = `${base_url}/detalle-asientos`;
    console.log(url)
    console.log("formData")
    console.log(formData)
    console.log("formData.referencia")
    console.log(formData.referencia)

    return this.hhtp.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalle_asiento: DetalleAsiento[] }) => resp.detalle_asiento)
      )
  }


  createDetalleAsiento2(detalles: DetalleAsiento[]) {
    const url = `${base_url}/detalle-asientos`;
    console.log(url);
    console.log("SERVICE createDetalleAsiento2");
    console.log('detalles');
    console.log(detalles);
   
    const formData = { detalles }; // Crear un objeto con una propiedad 'detalles' que contenga el arreglo de detalles
    
    console.log('FORMDATA');
    console.log(formData);
   
    return this.hhtp.post(url, formData, this.headers).pipe(
      map((resp: { ok: boolean; detalle_asiento: DetalleAsiento[] }) => resp.detalle_asiento)
    );
  }

  

  updateDetalleAsiento(detalle_asiento: DetalleAsientoU) {
    console.log("detalle_asiento.id_detalle_asiento")
    console.log(detalle_asiento.id_detalle_asiento)
    //const url = `${base_url}/detalle-asientos/3`;
    const url = `${base_url}/detalle-asientos/${detalle_asiento.id_detalle_asiento}`;
    console.log("Service - URL")
    console.log(url)
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




