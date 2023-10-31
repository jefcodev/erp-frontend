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

  loadProveedores2(desde: number = 0) {
    const url = `${base_url}/proveedores?desde=${desde}`;
    return this.http.get<LoadProveedor>(url, this.headers);
  }

  loadProveedores(desde: number = 0, limit: number = 10) {
    const url = `${base_url}/proveedores?desde=${desde}&limit=${limit}`;
    return this.http.get<LoadProveedor>(url, this.headers);
  }

  loadProveedorById(id_proveedor: any) {
    const url = `${base_url}/proveedores/id/${id_proveedor}`;
    return this.http.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, proveedor: Proveedor }) => resp.proveedor)
      )
  }
  loadProveedorByIdentificacion(identificacion: any) {
    const url = `${base_url}/proveedores/identificacion/${identificacion}`;
    return this.http.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, proveedor: Proveedor }) => resp.proveedor)
      )
  }

  createProveedor(formData: FormProveedor) {
    const url = `${base_url}/proveedores`;
    return this.http.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, proveedor: Proveedor[] }) => resp.proveedor)
      )
    }
    
    updateProveedor(proveedor: Proveedor) {
    const url = `${base_url}/proveedores/${proveedor.id_proveedor}`;
    return this.http.put(url, proveedor, this.headers);
  }

  deleteProveedor(id_proveedor: any) { //OJO: any
    const url = `${base_url}/proveedores/${id_proveedor}`;
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




