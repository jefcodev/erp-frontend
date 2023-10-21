import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//model
import { Product } from 'src/app/models/inventory/product.model';
import { Categorie } from 'src/app/models/inventory/categorie.model';
import { Unit } from 'src/app/models/inventory/unit.model';
import { Iva } from 'src/app/models/purchases/iva.model';

//Service
import { ProductService } from 'src/app/services/inventory/product.service';
import { CategorieService } from 'src/app/services/inventory/categorie.service';
import { UnitService } from 'src/app/services/inventory/unit.service';
import { IvaService } from 'src/app/services/purchases/iva.service';


import Swal from 'sweetalert2';



@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styles: [
  ]
})

export class ProductComponent implements OnInit {

  //Modelos 
  public categories: Categorie[] = [];
  public units: Unit[] = [];
  public ivas: Iva[] = [];


  public productForm: FormGroup;
  public price: number;
  public newPrice: number;

  //Guardar los precios
  public prices: { value: number }[] = [];

  // Modelo products
  public id_categorias: number;
  public id_unidad: number;
  public id_ice: number;
  public codigo: string;
  public descripcion: string;
  public especificaciones: string;
  public ficha: string;
  public stock_minimo: number;
  public stock: number;
  public iva: boolean;
  public estado: boolean;
  public stock_maximo: number;




  constructor(
    private productService: ProductService,
    private categorieService: CategorieService,
    private unitService: UnitService,
    private ivaService: IvaService,
    private router: Router,
    private fb: FormBuilder) { }

  ngOnInit(): void {

    this.cargarCategories();
    this.cargarIvas();
    this.cargarUnits();

  }

  addPrice() {
    if (this.newPrice) {
      this.prices.push({ value: this.newPrice });
      this.newPrice = null;
    }
  }

  removePrice(index: number) {
    this.prices.splice(index, 1);
  }



  createProduct() {
    const product = {
       id_categorias:this.id_categorias,
       id_unidad:this.id_unidad,
       id_ice:this.id_ice,
       codigo:this.codigo,
       descripcion:this.descripcion,
       especificaciones:this.especificaciones,
       ficha:this.ficha,
       stock_minimo:this.stock_minimo,
       stock:this.stock,
       iva: this.iva,
       stock_maximo:this.stock_maximo,
       precios: this.prices.map(price => price.value)
    };
    console.log(product);

    this.productService.createProduct(product)
      .subscribe(
        response => {
          console.log(response);
          Swal.fire({
            icon: 'success',
            title: 'Creado',
            text: 'Producto creado correctamente',
            showConfirmButton: false,
            timer: 1500
          })
          // Realiza las acciones necesarias después de crear el producto
        },
        error => {
          console.error(error);
          // Realiza las acciones necesarias en caso de error
        }
      );
  }



  cargarCategories() {
    this.categorieService.cargarCategories()
      .subscribe(categories => {
        this.categories = categories;
        console.log(categories)
      });
  }

  cargarUnits() {
    this.unitService.cargarUnits()
      .subscribe(units => {
        this.units = units;
      });
  }

  cargarIvas() {
    this.ivaService.cargarIva()
      .subscribe(ivas => {
        this.ivas = ivas;
        console.log(ivas)
      });
  }



}
