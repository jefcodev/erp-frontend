import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, delay, map, Observable, of, tap, using } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CargarUsuario } from '../interfaces/cargar-usuarios.iterfcae';
import { LoginForm } from '../interfaces/login-form.iterface';


// Interface
import { UserForm } from '../interfaces/user-form.interface';

// Modelo
import { Usuario } from '../models/usuario.model';
import { Role } from '../models/role.model';
import { Rol } from '../models/rol.model';
import { RolForm } from '../interfaces/rol-form.iterface';


// Variable API
const base_url = environment.base_url;


@Injectable({
  providedIn: 'root'
})
export class UserService {

public usuario: Usuario;
public rol: Role;


  constructor(private hhtp: HttpClient,
              private router: Router) {}

get token(): string {
  return localStorage.getItem('token');
}

get headers(){
  return {
      headers :{
      'x-token' : this.token
      }
  } }


get uid(): number{

  return this.usuario.id || 0;
}


get role(): number {
 return this.usuario.rol_id;
}



// Crear llamado a la API
  crearUsuario(formData: UserForm) {
    const url = `${base_url}/usuarios`;
    return this.hhtp.post(url, formData, this.headers)
              .pipe(
                map((resp:{ ok:boolean, usuarios: Usuario[]}) => resp.usuarios)
              )
  }

 actualizarPerfil( data :{nombre:string, apellido:string, email:string, rol_id:number}){
  data = {
    ...data,
    rol_id: this.usuario.rol_id
  }
  const url = `${base_url}/usuarios/${this.uid}`;
    return this.hhtp.put(url, data, this.headers)
   
 }


  cargarUsuarioById(id: string){
    const url = `${base_url}/usuarios/${id}`;
    return this.hhtp.get(url,  this.headers)
              .pipe(
                map((resp:{ ok:boolean, usuario: Usuario}) => resp.usuario)
              )
  }

  updateUsuario(usuario: Usuario) {
    const url = `${base_url}/usuarios/${usuario.id}`;
    return this.hhtp.put(url, usuario, this.headers);
  }
  
  deleteUsuario(_id: any) {
    const url = `${base_url}/usuarios/${_id}`;
    return this.hhtp.delete(url,this.headers);
  }

  /* cargarRol(): Observable<Role> {
    const url = `${base_url}/usuarios/role`; // Reemplaza base_url con la URL correcta
    return this.hhtp.get<RolForm>(url);
  } */
/* 
  cargarRol(){
    const url = `${base_url}/usuarios/role`;
    return this.hhtp.get<RolForm>(url,this.headers)
    .pipe(
      map((resp:{ ok:boolean, rol: Role}) => resp.rol)
    )
  } */


  cargarUsuarios(desde: number = 0){
    const url = `${base_url}/usuarios?desde=${desde}`;
    return this.hhtp.get<CargarUsuario>(url,this.headers)
      .pipe(
        
        map( resp =>{
          const usuarios = resp.usuarios.map(
            user => new Usuario (user.nombre,user.apellido,user.email,user.rol_id, user.img,user.id,user.estado)
            );

            console.log(usuarios);

          return {
            total: resp.total,
            usuarios
          };
        })
      )
  }


  guardarLocalStorage(token: string , menu :any){
    localStorage.setItem('token', token);
    localStorage.setItem('menu', JSON.stringify(menu));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('menu');
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
      map((resp: any) => {
        // console.log(resp);
      const {nombre, apellido,email,estado ,img='',rol_id, id} = resp.usuario;
      this.usuario = new Usuario(nombre,apellido,email,rol_id,img,id,estado);
      // console.log(this.usuario.id)
      this.guardarLocalStorage(resp.token, resp.menu);

        return true;
      }),
      
      catchError(error => of(false))
    )
  }
  // Validación de token Fin 


  login(formData: any) {
    const fomrLogin: LoginForm = formData;
    return this.hhtp.post(`${base_url}/login`, fomrLogin)
      .pipe(
        tap((resp: any) => {
          this.guardarLocalStorage(resp.token, resp.menu);
        })
      )
  }

}

