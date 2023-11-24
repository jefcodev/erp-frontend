import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';


//Model
import { Producto } from 'src/app/models/inventario/producto.model';
import { Apu } from 'src/app/models/apus/apu.model';


//Service
import { ProductoService } from 'src/app/services/inventario/producto.service';
import { ApuService } from 'src/app/services/apus/apu.service';


@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styles: [
  ]
})
export class QuotationComponent implements OnInit {


  public productos: Producto[] = [];
  public apus: Apu[] = [];


  public fechaActual: string;
  public numeroProforma: string = "PROF-0015";



  /* Variables  */

  public subTotalPro: number = 0;
  public totalSinImp: number = 0;
  public subTotalIva: number = 0;
  public subTotal: number = 0;
  public totalDescuento: number = 0;
  public iva: number = 0;
  public totalPro: number = 0;

  /* LLenar datos */

  filasProforma: any[] = [];


  constructor(
    private productoService: ProductoService,
    private apuService: ApuService,
    private datePipe: DatePipe
  ) { }
  ngOnInit(): void {
    this.fechaActual = this.datePipe.transform(new Date(), 'dd/MM/yyyy');

  }

  /* Add & Delete Filas Materiales */
  addFilaProforma() {
    this.filasProforma.push({ item: '', id_item: '', cantidad: null, unidad: '', precio: null, descuento: null, total: null });
    console.log(this.filasProforma);
  }
  deleteFilaProforma(index: number) {
    if (this.filasProforma.length >= 1) {
      this.filasProforma.splice(index, 1);
    }
  }





  mostrarErrorDescuento(item: any): boolean {
    return item.descuento > (item.cantidad * item.precio);
  }


  actualizarDatos(productoSeleccionado: any, indice: number) {
    if (productoSeleccionado) {
      // Si se ha seleccionado un producto, actualiza el campo de "precio" en la fila correspondiente
      this.filasProforma[indice].precio = productoSeleccionado.precio_venta;
    }
  }
  actualizarDatosApu(apuSeleccionado: any, indice: number) {
    if (apuSeleccionado) {
      // Si se ha seleccionado un producto, actualiza el campo de "precio" en la fila correspondiente
      this.filasProforma[indice].precio = apuSeleccionado.total;
    }
  }


  calcularSubTotalPro(indice: number) {
    const fila = this.filasProforma[indice];
    if (fila.cantidad !== null && fila.precio !== null) {
      fila.total = (fila.cantidad * fila.precio) - fila.descuento;
      fila.total = parseFloat(fila.total.toFixed(2));
    }
  }


  calcularTotal() {
    /* Subtotal de los productos */
    this.totalSinImp = this.filasProforma.reduce((total, fila) => {
      return total + (fila.total || 0);
    }, 0);
    this.totalSinImp = parseFloat(this.totalSinImp.toFixed(2));

    /* Calcular el descuento de cada item */
    this.totalDescuento = this.filasProforma.reduce((descuento, fila) => {
      return descuento + (fila.descuento || 0);
    }, 0);
    this.totalDescuento = parseFloat(this.totalDescuento.toFixed(2));

    this.iva = this.totalSinImp * 0.12;
    this.iva = parseFloat(this.iva.toFixed(2));

    this.totalPro = this.iva + this.totalSinImp;
    this.totalPro = parseFloat(this.totalPro.toFixed(2));


  }



  cargarDatos(item: any) {
    if (item.tipo === 'PRODUCTO') {
      this.productoService.loadProductos()
        .subscribe(({ productos }) => {
          this.productos = productos;
        });


    } else if (item.tipo === 'APU') {
      this.apuService.cargarApus().subscribe(apus => {
        this.apus = apus;
      });
    }
  }






}


