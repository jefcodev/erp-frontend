import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
//import { FormFactura } from 'src/app/interfaces/compra/factura/form-factura.interface';
import { LoadFactura } from 'src/app/interfaces/compra/factura/load-factura.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { Factura } from 'src/app/models/compra/factura.model';
//import { DetalleFactura } from 'src/app/models/compra/detalle-factura.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FacturaService {

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

  loadFacturas() {
    const url = `${base_url}/facturas`;
    return this.hhtp.get<LoadFactura>(url, this.headers);
  }

  loadFacturaById(id_factura_compra: any) {
    const url = `${base_url}/facturas/${id_factura_compra}`;
    return this.hhtp.get(url, this.headers).pipe(
      map((resp: { ok: boolean, factura: Factura, saldo: number }) => {
        return { factura: resp.factura, saldo: resp.saldo };
      })
    );
  }

  createFactura(formData: any) {
    const url = `${base_url}/facturas`;
    console.log("> ▶️ formData: ", formData)
    return this.hhtp.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, factura: Factura[] }) => resp.factura)
      )
  }

  updateFactura(factura: Factura) {
    const url = `${base_url}/facturas/${factura.id_factura_compra}`;
    return this.hhtp.put(url, factura, this.headers);
  }

  deleteFactura(id_factura_compra: any) { //OJO: any
    const url = `${base_url}/facturas/${id_factura_compra}`;
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




