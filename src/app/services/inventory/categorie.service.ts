
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map } from 'rxjs';

//Modelo

import { Categorie } from 'src/app/models/inventory/categorie.model';

import { CategorieForm } from 'src/app/interfaces/inventory/categorie.iterface';
// API
import { environment } from 'src/environments/environment';

// Variable para la API 
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CategorieService {

  constructor( private  http: HttpClient) { 

  }

  
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

  cargarCategories(){
    //inventory/categories
    const url=`${base_url}/inventory/categories`;
    return this.http.get(url, this.headers)
    .pipe(
      map((resp :{ok:boolean, categories: Categorie[]}
      ) => resp.categories)
    )
  }

  createCategorie(formData: CategorieForm) {
    return this.http.post(`${base_url}/inventory/categories`, formData, this.headers);
  }
  
}
