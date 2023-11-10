import { Component, OnInit } from '@angular/core';

import { EventEmitter, Output } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Producto } from '../../../models/inventario/producto.model';
import { ProductoService } from 'src/app/services/inventario/producto.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styles: []
})

export class ProductoComponent implements OnInit {

  @Output() productoCreado = new EventEmitter<any>();

  public productos: Producto[] = [];
  public productoSeleccionado: Producto;
  public formSubmitted = false;
  public ocultarModal: boolean = true;

  productoForm: FormGroup;
  productoFormU: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.productoForm = this.fb.group({
      codigo_principal: ['101', [Validators.required, Validators.minLength(1)]],
      descripcion: ['MARTILLO', [Validators.required, Validators.minLength(1)]],
      stock: [3, [Validators.required, Validators.minLength(1)]],
      stock_minimo: [5, [Validators.required, Validators.minLength(1)]],
      stock_maximo: [10, [Validators.required, Validators.minLength(1)]],
      precio_compra: [2.50, [Validators.required, Validators.minLength(1)]],
    });

    this.productoFormU = this.fb.group({
      codigo_principal: ['', [Validators.required, Validators.minLength(1)]],
      descripcion: ['', [Validators.required, Validators.minLength(1)]],
      stock: [''],
      stock_minimo: [''],
      stock_maximo: [''],
      utilidad: [''],
      descuento: [''],
      precio_compra: [''],
      precio_venta: [''],
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cerrarModal() {
    this.ocultarModal = true;
  }

  abrirModal() {
    this.ocultarModal = false;
    this.activatedRoute.params.subscribe(params => {
      console.log(params)
    })

  }

  cargarProductos() {
    this.productoService.loadProductos()
      .subscribe(({ productos }) => {
        this.productos = productos;
      })
  }

  cargarProductoPorId(id_producto: any) {
    this.productoService.loadProductoById(id_producto)
      .subscribe(producto => {
        const { codigo_principal, descripcion, stock, stock_minimo, stock_maximo, utilidad, descuento, precio_compra, precio_venta } = producto[0];
        this.productoSeleccionado = producto[0];
        this.productoFormU.setValue({ codigo_principal, descripcion, stock, stock_minimo, stock_maximo, utilidad, descuento, precio_compra, precio_venta })
      })
  }

  crearProducto() {
    this.formSubmitted = true;
    console.log(this.productoForm.value)
    if (this.productoForm.invalid) {
      return;
    }
    this.productoService.createProducto(this.productoForm.value)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Producto creado',
          text: 'Producto se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        let errorMessage = 'Se produjo un error al crear el producto.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  actualizarProducto() {
    console.log("Actualizar: actualizarProducto() { ")
    if (this.productoFormU.invalid) {
      return;
    }
    const data = {
      ...this.productoFormU.value,
      id_producto: this.productoSeleccionado.id_producto
    }

    console.log("UNO---updateProducto()")
    console.log(data)

    // realizar posteo
    this.productoService.updateProducto(data)
      .subscribe(res => {
        console.log("DOS---updateProducto()")
        console.log(data)

        Swal.fire({
          icon: 'success',
          title: 'Producto actualizado',
          text: 'Producto se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        //this.router.navigateByUrl(`/dashboard/productos`)
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al actualizar el producto.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  borrarProducto(producto: Producto) {
    console.log("Borrar:   borrarProducto(producto: Producto) {")
    console.log(producto.id_producto)
    Swal.fire({
      title: '¿Borrar Producto?',
      text: `Estas a punto de borrar a ${producto.descripcion}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.productoService.deleteProducto(producto.id_producto)
          .subscribe(resp => {
            this.cargarProductos();
            /*Swal.fire(
              'Producto borrado',
              `${producto.nombre} ha sido borrado correctamente.`,
              'success'              
            );*/
            Swal.fire({
              icon: 'success',
              title: 'Producto borrado',
              text: `${producto.descripcion} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar el producto.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
          );
      }
    });
  }

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/productos']);
    });

  }

  campoNoValido(campo: string, form: FormGroup): boolean {
    if (form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }

  agregarProducto(producto: any) {
    this.productos.push(producto);
  }

}
