import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';


//Model
import { Producto } from 'src/app/models/inventario/producto.model';
import { Apu } from 'src/app/models/apus/apu.model';


//Service
import { ProductoService } from 'src/app/services/inventario/producto.service';
import { ApuService } from 'src/app/services/apus/apu.service';
import { Proforma } from 'src/app/models/quotations/quotation.model';
import { QuotationService } from 'src/app/services/quotations/quotation.service';
import Swal from 'sweetalert2';
import { Cliente } from 'src/app/models/venta/cliente.model';
import { ClienteService } from 'src/app/services/venta/cliente.service';
import { Unit } from 'src/app/models/inventory/unit.model';
import { UnitService } from 'src/app/services/inventory/unit.service';


@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styles: [
  ]
})
export class QuotationComponent implements OnInit {


  public productos: Producto[] = [];
  public apus: Apu[] = [];
  public clientes: Cliente[] = [];
  public unidades: Unit[] = [];


  public fechaActual: string;
  public numeroProforma: string = "PROF-0015";



  /* Variables  */
  public id_cliente: number;

  razonSocial: string = '';
  telefono: string = '';
  direccion: string = '';
  email: string = '';

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
    private proformaService: QuotationService,
    private clienteServive: ClienteService,
    private unidadService: UnitService,
    private datePipe: DatePipe
  ) { }
  ngOnInit(): void {
    this.fechaActual = this.datePipe.transform(new Date(), 'yyyy/MM/dd');
    this.cargarClientes();
    this.cargarUnidades();

  }
  //customValue = (cliente: any): string => `${cliente.identificacion} ${cliente.razonSocial}`;


  /* Add & Delete Filas Materiales */
  addFilaProforma() {
    //console.log('Id: '+ this.id_cliente);
    this.filasProforma.push({ item: '', item_id: '', cantidad: null, unidad: '', precio_unitario: null, descuento: 0, total: null });

  }
  deleteFilaProforma(index: number) {
    if (this.filasProforma.length >= 1) {
      this.filasProforma.splice(index, 1);
    }
  }
  mostrarErrorDescuento(item: any): boolean {
    return item.descuento > (item.cantidad * item.precio_unitario);
  }
  actualizarDatos(productoSeleccionado: any, indice: number) {
    if (productoSeleccionado) {
      // Si se ha seleccionado un producto, actualiza el campo de "precio" en la fila correspondiente
      this.filasProforma[indice].precio_unitario = productoSeleccionado.precio_venta;
      this.filasProforma[indice].item_id = productoSeleccionado.id_producto;
      //this.filasProforma[indice].unidad = productoSeleccionado.id_unidad_medida;

      const unidadSeleccionada = this.unidades.find(u => u.id_unidad_medida === productoSeleccionado.id_unidad_medida);
      this.filasProforma[indice].unidad = unidadSeleccionada ? unidadSeleccionada.descripcion : '';


    }
  }
  actualizarDatosApu(apuSeleccionado: any, indice: number) {
    if (apuSeleccionado) {
      // Si se ha seleccionado un producto, actualiza el campo de "precio" en la fila correspondiente
      this.filasProforma[indice].precio_unitario = apuSeleccionado.total;
      this.filasProforma[indice].item_id = apuSeleccionado.id_capitulo;
      this.filasProforma[indice].unidad = apuSeleccionado.unidad;

    }
  }


  cargarDetallesCliente() {

    const clienteSeleccionado = this.clientes.find(cliente => cliente.id_cliente === this.id_cliente);

    if (clienteSeleccionado) {
      this.razonSocial = clienteSeleccionado.razon_social;
      this.telefono = clienteSeleccionado.telefono;
      this.direccion = clienteSeleccionado.direccion;
      this.email = clienteSeleccionado.email;

    } else {
      // Restablecer los campos si no se encuentra el cliente
      this.razonSocial = '';
      this.telefono = '';
      this.direccion = '';
      this.email = '';
    }
  }


  cargarUnidades() {
    this.unidadService.cargarUnits().
      subscribe(unidades => {
        this.unidades = unidades;
      })
  }


  calcularSubTotalPro(indice: number) {
    const fila = this.filasProforma[indice];
    if (fila.cantidad !== null && fila.precio_unitario !== null) {
      fila.total = (fila.cantidad * fila.precio_unitario) - fila.descuento;
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



  cargarClientes() {
    this.clienteServive.loadClientesAll()
      .subscribe(({ clientes }) => {
        this.clientes = clientes;
      })
  }


  cargarDatos(item: any) {
    if (item.item === 'PRODUCTO') {
      this.productoService.loadProductos()
        .subscribe(({ productos }) => {
          this.productos = productos;
        });


    } else if (item.item === 'APU') {
      this.apuService.cargarApus().subscribe(apus => {
        this.apus = apus;
      });
    }
  }



  crearProforma() {
    const proforma: Proforma = {
      id_cliente: this.id_cliente,
      fecha: this.fechaActual,
      descuento: this.totalDescuento,
      total: this.totalPro,
      productos: this.filasProforma
    };

    this.proformaService.createProfroma(proforma).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Creado correctamente',
          text: `Profroma creada correctamente.`,
          showConfirmButton: false,
          timer: 1500
        });
      },
      (error) => {
        Swal.fire('Error', error, 'error');
      }
    );
  }


}


