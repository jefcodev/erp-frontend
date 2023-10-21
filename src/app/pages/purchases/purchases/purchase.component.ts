import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


//Model
import { Provider } from 'src/app/models/purchases/provider.model';
import { Product } from 'src/app/models/inventory/product.model';

// Service 
import { ProviderService } from 'src/app/services/purchases/provider.service';
import { ProductService } from 'src/app/services/inventory/product.service';
import { PurchaseService } from 'src/app/services/purchases/purchase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styles: [
  ]
})
export class PurchaseComponent implements OnInit {

  public providers: Provider[] = [];
  public products: Product[] = [];


  //Variables
  public selectedProduct: Product;
  public selectedQuantity: number;
  public purchasedProducts: any[] = []; //
  
  
  public iva: number = 5;

  // Variables model
  
  public date_buy: Date;
  public code_buy: string;
  public id_supplier: number;
  public id_product: number;
  public description_product :string;


  /* public id_product: number;  */
  constructor(
    private providerService: ProviderService,
    private productService: ProductService,
    private purchaseService: PurchaseService

  ) { }

  ngOnInit(): void {
    this.cargarProviders();
    this.cargarProducts();

  }
  cargarProviders() {
    this.providerService.cargarProviders()
      .subscribe(providers => {
        this.providers = providers;
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
      const purchasedProduct = {/* 
        id: this.selectedProduct.id,
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


  createPurchase() {

    const purchase ={
       date_buy : this.date_buy,
       code_buy : this.code_buy,
       id_supplier: this.id_supplier,
       products : this.purchasedProducts
    }
    console.log(purchase)
    this.purchaseService.createPurchase(purchase)
      .subscribe(response => {
        console.log('Productos enviados:', response);
        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'Compra creada correctamente',
          showConfirmButton: false,
          timer: 1500
        })
        // Realiza las acciones necesarias después de enviar los productos, como redireccionar o mostrar un mensaje de éxito
      }, error => {
        console.error('Error al enviar los productos:', error);
        // Realiza las acciones necesarias en caso de error, como mostrar un mensaje de error
      });
  }


}

