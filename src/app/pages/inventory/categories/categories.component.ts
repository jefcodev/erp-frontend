import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, NgModel, Validators } from '@angular/forms';
//Model

import { Categorie } from 'src/app/models/inventory/categorie.model';

//Service

import { CategorieService } from 'src/app/services/inventory/categorie.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styles: [
  ]
})
export class CategoriesComponent implements OnInit {
  
  public categories: Categorie[] = [];
  public categorie:any;

  public  estadoActivo: boolean;
  public formSubmitted = false;

  public cargando: boolean = true;

  public categorieForm = this.fb.group({
    name: ['',[Validators.required, Validators.minLength(4)]]
  },{
    Validators
  });

  constructor(
    private categorieService: CategorieService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.cargarCategories();
  }



  crearCategoria(){
    this.formSubmitted = true;
    console.log(this.categorieForm.value)
    
    // realizar posteo

    this.categorieService.createCategorie(this.categorieForm.value)
    .subscribe(res =>{
      Swal.fire({
        icon: 'success',
        title: 'Creado',
        text: 'Categoría creada correctamente',
        showConfirmButton: false,
        timer: 1500
      })
    }, (err)=>{
      // Si sucede un error
      Swal.fire('Error', err.error.msg, 'error');

    });
   this.recargarComponente();

  }

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/inventory/categories']);
    });
  }

  cargarCategories() {
    this.cargando = true;
      this.categorieService.cargarCategories()
        .subscribe(categories => {
          this.categories = categories;
          console.log(categories)
          this.cargando = false;
        });
    }

}
