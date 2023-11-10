
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

//Model
import { Apu } from 'src/app/models/apus/apu.model';

// API
import { environment } from 'src/environments/environment';

// Variable para la API 
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ApuService {

  constructor(private  http: HttpClient) { }




  
  get token(): string {
    return localStorage.getItem('token');
  }
  
  get headers(){
    return {
       headers :{
        'x-token' : this.token
       }
    }
  }

  cargarApus(){
    //apu
    const url=`${base_url}/apu`;
    return this.http.get(url, this.headers)
    .pipe(
      map((resp :{ok:boolean, apus: Apu[]}
      ) => resp.apus)
    )
  };


  createApu(apu: Apu) {
    const url = `${base_url}/apu`;
    return this.http.post(url, apu, this.headers);
  }
  
}


