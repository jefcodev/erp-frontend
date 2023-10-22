import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
import { FormFactura } from 'src/app/interfaces/venta/factura/form-factura.interface';
import { LoadFactura } from 'src/app/interfaces/venta/factura/load-factura.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { Factura } from 'src/app/models/venta/factura.model';
import { DetalleFactura } from 'src/app/models/venta/detalle-factura.model';

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
    const url = `${base_url}/facturas-venta`;
    return this.hhtp.get<LoadFactura>(url, this.headers);
  }

  loadFacturaById(id_factura_venta: any) {
    const url = `${base_url}/facturas-venta/${id_factura_venta}`;
    return this.hhtp.get(url, this.headers).pipe(
      map((resp: { ok: boolean, factura: Factura, saldo: number }) => {
        return { factura: resp.factura, saldo: resp.saldo };
      })
    );
  }
  /*
    loadFacturaById2(id_factura_venta: any) {
      //console.log("SERVICE - loadFacturaById(id_factura_venta: any) {")
      //console.log("id_factura_venta")
      //console.log(id_factura_venta)
      const url = `${base_url}/facturas/${id_factura_venta}`;
      return this.hhtp.get(url, this.headers)
        .pipe(
          map((resp: { ok: boolean, factura: Factura}) => resp.factura )
        )
    }*/

  createFactura(formData: FormFactura) {
    const url = `${base_url}/facturas`;
    console.log(url)
    console.log("formData --- EDISON")
    console.log(formData)
    //console.log("formData.fecha")
    //console.log(formData.fecha)
    console.log("formData.id_cliente")
    console.log(formData.id_cliente)
    console.log("formData.id_forma_pago")
    console.log(formData.id_forma_pago)
    console.log("formData.id_asiento")
    console.log(formData.id_asiento)
    console.log("formData.codigo")
    console.log(formData.codigo)
    console.log("formData.fecha_emision")
    console.log(formData.fecha_emision)
    console.log("formData.fecha_vencimiento")
    console.log(formData.fecha_vencimiento)
    console.log("formData.estado_pago")
    console.log(formData.estado_pago)
    console.log("formData.subtotal_sin_impuestos")
    console.log(formData.subtotal_sin_impuestos)
    console.log("formData.total_descuento")
    console.log(formData.total_descuento)
    console.log("formData.iva")
    console.log(formData.iva)
    console.log("formData.valor_total")
    console.log(formData.valor_total)
    console.log("formData.abono")
    console.log(formData.abono)
    // console.log("formData.saldo")
    // console.log(formData.saldo)

    return this.hhtp.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, factura: Factura[] }) => resp.factura)
      )
  }

  updateFactura(factura: Factura) {
    console.log("factura.id_factura_venta")
    console.log(factura.id_factura_venta)
    const url = `${base_url}/facturas/${factura.id_factura_venta}`;
    console.log("Service - URL")
    console.log(url)
    return this.hhtp.put(url, factura, this.headers);
  }

  deleteFactura(id_factura_venta: any) { //OJO: any
    const url = `${base_url}/facturas/${id_factura_venta}`;
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




