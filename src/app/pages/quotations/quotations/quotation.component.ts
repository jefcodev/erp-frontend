import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';


//Model

import { Client } from 'src/app/models/inventory/client.model';
import { Product } from 'src/app/models/inventory/product.model';


//Service
import { ProductService } from 'src/app/services/inventory/product.service';
import { ClientService } from 'src/app/services/inventory/client.service';
import { QuotationService } from 'src/app/services/quotations/quotation.service';


@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styles: [
  ]
})
export class QuotationComponent implements OnInit {

  public clients: Client []=[];
  public products : Product []=[];
  public fechaActual: string;
  public numeroProforma: string = "PROF-0015";

  //Variables
  public selectedProduct: Product;
  public selectedQuantity: number;
  public purchasedProducts: any[] = []; //
  public iva: number = 5;

  // Variable models

  public date_quo: Date;
  public code_quo: string;
  public id_client: number;
  public id_product: number;
  public description_product :string;


  constructor(
    private productService: ProductService,
    private clientService : ClientService,
    private quotationService : QuotationService,
    private datePipe: DatePipe
  ){}
  ngOnInit(): void {
    this.cargarClients();
    this.cargarProducts();
    this.fechaActual = this.datePipe.transform(new Date(), 'dd/MM/yyyy');

  }

  cargarClients() {
      this.clientService.cargarClients()
        .subscribe(clients => {
          this.clients = clients;
          console.log(clients)
        });
    }
    cargarProducts() {
      this.productService.cargarProducts().subscribe((productsData) => {
        this.products = productsData.products;
        console.log(this.products);
      });
    }


    agregarProducto() {
      if (this.selectedProduct && this.selectedQuantity) {
        const purchasedProduct = {
          /* id: this.selectedProduct.id,
          description_product: this.selectedProduct.name,
          price_product: this.selectedProduct.pur_price,
          iva_product:this.iva,
          amount_product: this.selectedQuantity */
        };
        this.purchasedProducts.push(purchasedProduct);
        // Reiniciar los valores seleccionados
        this.selectedProduct = null;
        this.selectedQuantity = null;
      }
    }

    removePrice(index: number) {
      this.purchasedProducts.splice(index, 1);
    }

    createQuotation() {

      const quotation ={
         date_quo : this.date_quo,
         code_quo : this.code_quo,
         id_client: this.id_client,
         products : this.purchasedProducts
      }
      console.log(quotation)
      this.quotationService.createPurchase(quotation)
        .subscribe(response => {
          console.log('Productos enviados:', response);
          // Realiza las acciones necesarias después de enviar los productos, como redireccionar o mostrar un mensaje de éxito
        }, error => {
          console.error('Error al enviar los productos:', error);
          // Realiza las acciones necesarias en caso de error, como mostrar un mensaje de error
        });
    }
}
