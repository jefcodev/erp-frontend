import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';


// Interfaces
import { FormProveedor } from '../../interfaces/compra/proveedor/form-proveedor.interface';
import { LoadProveedor } from '../../interfaces/compra/proveedor/load-proveedor.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { Proveedor } from '../../models/compra/proveedor.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

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

  loadProveedores() {
    const url = `${base_url}/proveedores`;
    return this.hhtp.get<LoadProveedor>(url, this.headers);
  }

  loadProveedorById(id_proveedor: any) {
    console.log("cargarProveedorById")
    console.log(id_proveedor)
    //const url = `${base_url}/proveedores/${id_proveedor}`;
    const url = `${base_url}/proveedores/id/${id_proveedor}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, proveedor: Proveedor }) => resp.proveedor)
      )
  }
  loadProveedorByIdentificacion(identificacion: any) {
    console.log("\n\n-> (service) loadProveedorByIdentificacion(identificacion: any) {")
    console.log('identidentificacion: ', identificacion)
    const url = `${base_url}/proveedores/identificacion/${identificacion}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, proveedor: Proveedor }) => resp.proveedor)
      )
  }

  createProveedor(formData: FormProveedor) {
    console.log('\n\n▶ (service) createProveedor(formData: FormProveedor) {');
    console.log('formData: ', formData);
    const url = `${base_url}/proveedores`;
    console.log(url)
    return this.hhtp.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, proveedor: Proveedor[] }) => resp.proveedor)
      )
    }
    
    updateProveedor(proveedor: Proveedor) {
    console.log('\n\n▶ (service) updateProveedor(proveedor: Proveedor) {');
    console.log("proveedor.id_proveedor: ", proveedor.id_proveedor)
    const url = `${base_url}/proveedores/${proveedor.id_proveedor}`;
    console.log("Service - URL")
    console.log(url)
    return this.hhtp.put(url, proveedor, this.headers);
  }

  deleteProveedor(id_proveedor: any) { //OJO: any
    const url = `${base_url}/proveedores/${id_proveedor}`;
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




