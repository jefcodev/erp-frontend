import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
import { FormCliente } from '../../interfaces/venta/cliente/form-cliente.interface';
import { LoadCliente } from '../../interfaces/venta/cliente/load-cliente.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { Cliente } from '../../models/venta/cliente.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

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

  loadClientes(desde: number = 0, limit: number = 10) {
    const url = `${base_url}/clientes?desde=${desde}&limit=${limit}`;
    return this.hhtp.get<LoadCliente>(url, this.headers);
  }

  loadClienteById(id_cliente: any) {
    console.log("cargarClienteById")
    console.log(id_cliente)
    //const url = `${base_url}/clientes/${id_cliente}`;
    const url = `${base_url}/clientes/id/${id_cliente}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, cliente: Cliente }) => resp.cliente)
      )
  }

  loadClienteByIdentificacion(identificacion: any) {
    console.log("\n\n-> (service) loadClienteByIdentificacion(identificacion: any) {")
    console.log('identidentificacion: ', identificacion)
    const url = `${base_url}/clientes/identificacion/${identificacion}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, cliente: Cliente }) => resp.cliente)
      )
  }

  createCliente(formData: FormCliente) {
    const url = `${base_url}/clientes`;
    console.log(url)
    return this.hhtp.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, cliente: Cliente[] }) => resp.cliente)
      )
  }

  updateCliente(cliente: Cliente) {
    console.log("cliente.id_cliente")
    console.log(cliente.id_cliente)
    //const url = `${base_url}/clientes/3`;
    const url = `${base_url}/clientes/${cliente.id_cliente}`;
    console.log("Service - URL")
    console.log(url)
    return this.hhtp.put(url, cliente, this.headers);
  }

  deleteCliente(id_cliente: any) { //OJO: any
    const url = `${base_url}/clientes/${id_cliente}`;
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




