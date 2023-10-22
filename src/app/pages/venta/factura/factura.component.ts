import { Component, OnInit } from '@angular/core';
import { ElementRef, HostListener } from '@angular/core';

import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SweetAlertIcon } from 'sweetalert2';

import { formatDate } from '@angular/common';

import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { concatMap } from 'rxjs/operators';
// XML
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as xml2js from 'xml2js';
//import * as $ from 'jquery';
import { forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';


// Models
import { Factura } from 'src/app/models/venta/factura.model';
import { DetalleFactura } from '../../../models/venta/detalle-factura.model';
import { Cliente } from '../../../models/venta/cliente.model';
import { Producto } from 'src/app/models/inventario/producto.model';
import { FormaPago } from '../../../models/contabilidad/forma-pago.model';

// Services
import { FacturaService } from 'src/app/services/venta/factura.service';
import { DetalleFacturaService } from 'src/app/services/venta/detalle-factura.service';
import { ClienteService } from 'src/app/services/venta/cliente.service';
import { ProductoService } from 'src/app/services/inventario/producto.service';
import { FormaPagoService } from 'src/app/services/contabilidad/forma-pago.service';

import { EventEmitter, Output } from '@angular/core';



interface DetalleFactura2 {
  producto: number;
  cantidad: number;
  descripcion: string;
  precio_unitario: number;
  tarifa: number;
  descuento: number;
  valor_total: number;
  valor_ICE: number;
}


@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styles: [
  ]
})
export class FacturaVentaComponent implements OnInit {
  public formSubmitted = false;
  public ocultarModal: boolean = true;
  public facturaForm: FormGroup;
  public facturaFormXML: FormGroup;
  public detalleForm: FormGroup;
  public facturaFormU: FormGroup;
  public clienteForm: FormGroup;
  public clienteSeleccionado2: Cliente;



  public facturas: Factura[] = [];
  public saldo: string;
  public detalleFactura: DetalleFactura;
  public detalleFactura2: DetalleFactura2[] = [];  // Agrega una matriz para almacenar los detalles del asiento
  public facturaSeleccionado: Factura;
  public fechaActual: string;

  public codigo: string;
  //public abono: string;

  public subtotal_sin_impuestos: string;
  public total_descuento: string;
  public iva: string;
  public valor_total: string;
  //public valor_total: string;
  public abono: string;

  public clientes: Cliente[] = [];
  public formas_pago: FormaPago[] = [];
  public productos: Producto[] = [];


  public identificacion: string;
  public nombre: string;
  public apellido: string;
  public nombre_comercial: string;
  public direccion: string;
  public telefono: string;
  public email: string;
  //@Output() clienteCreado: EventEmitter<any> = new EventEmitter<any>();
  @Output() clienteCreado = new EventEmitter<any>();
  //@HostListener('document:click', ['$event'])

  public detalle_facturas: DetalleFactura[] = [];

  // XML
  title = 'Read XML';
  public xmlItems: ProductDetail[] = []; // Updated to use the ProductDetail interface
  private xmlFilePath: string | null = null;

  // info tributaria
  public razonSocial: string = '';
  public ruc: string = '';
  public claveAcceso: string = '';
  public estab: string = '';
  public ptoEmi: string = '';
  public secuencial: string = '';
  // info factura
  public fechaEmision: string = '';
  public razonSocialComprador: string = '';
  public identificacionComprador: string = '';
  public direccionComprador: string = '';
  public totalSinImpuestos: number = 0;
  public totalDescuento: number = 0;
  public codigo2: string = '';
  public codigoPorcentaje2: string = '';
  public baseImponible2: number = 0;
  public valor2: number = 0;
  public importeTotal: number = 0;
  public formaPago: string = '';
  public total: number = 0;
  public plazo: number = 0;
  public unidadTiempo: string = '';

  // calculados
  public precioTotalSinImpuestoAux: number = 0;
  public valor: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private facturaService: FacturaService,
    private detalleFacturaService: DetalleFacturaService,
    private clienteService: ClienteService,
    private formaPagoService: FormaPagoService,

    private productoService: ProductoService,

    private elementRef: ElementRef,

    //XML
    private http: HttpClient,

  ) {
    this.facturaForm = this.fb.group({

      id_factura_venta: [''],

      id_cliente: ['', [Validators.required, Validators.minLength(0)]],
      identificacion: ['', [Validators.required, Validators.minLength(0)]],
      nombre: ['', [Validators.required, Validators.minLength(0)]],
      apellido: ['', [Validators.required, Validators.minLength(0)]],
      direccion: ['', [Validators.required, Validators.minLength(0)]],
      telefono: ['', [Validators.required, Validators.minLength(0)]],
      email: ['', [Validators.required, Validators.email]],

      id_forma_pago: ['2'],
      id_asiento: ['1'],
      codigo: [''],
      //fecha_emision: ['2023-01-01'],
      fecha_emision: [''],
      //fecha_vencimiento: ['2023-01-01'],
      fecha_vencimiento: [''],
      //estado_pago: ['POR PAGAR'],
      subtotal_sin_impuestos: ['22'],
      total_descuento: ['22'],
      iva: ['22'],
      valor_total: ['22'],
      abono: [''],
      //saldo: ['8'],

    });
    /*
    //Esta forma actua como si estuviera con un formulario quemado
    this.facturaFormXML = this.fb.group({

      id_factura_venta: [''],

      id_cliente: ['1', [Validators.required, Validators.minLength(0)]],
      identificacion: ['111111', [Validators.required, Validators.minLength(0)]],
      nombre: ['Edison ', [Validators.required, Validators.minLength(0)]],
      apellido: ['Pinanjota', [Validators.required, Validators.minLength(0)]],
      direccion: ['Cayambe', [Validators.required, Validators.minLength(0)]],
      telefono: ['0978812129', [Validators.required, Validators.minLength(0)]],
      email: ['eepinanjota95@utn.edu.ec', [Validators.required, Validators.email]],

      id_forma_pago: ['2'],
      id_asiento: ['1'],
      codigo: ['1'],
      //fecha_emision: this.fechaEmision,
      fecha_emision: [''],
      //fecha_emision: [''],
      fecha_vencimiento: ['2023-01-01'],
      //fecha_vencimiento: [''],
      //estado_pago: ['POR PAGAR'],
      subtotal_sin_impuestos: ['22'],
      total_descuento: ['22'],
      iva: ['22'],
      valor_total: ['22'],
      abono: ['23'],
      //saldo: ['8'],
    });
    */


    this.facturaFormU = this.fb.group({

      //id_factura_venta: [''], 

      //id_cliente: [''],
      identificacion: [''],
      nombre: [''],
      apellido: [''],
      direccion: [''],
      telefono: [''],
      email: [''],

      id_forma_pago: [''],
      id_asiento: [''],
      codigo: [''],
      fecha_emision: [''],
      fecha_vencimiento: [''],
      estado_pago: [''],
      subtotal_sin_impuestos: [''],
      total_descuento: [''],
      iva: [''],
      valor_total: [''],

      abono: [''],
      saldo: [''],
    });

    this.detalleForm = this.fb.group({
      detalles: this.fb.array([])
    });

    this.clienteForm = this.fb.group({
      identificacion: ['1727671628', [Validators.required, Validators.minLength(3)]],
      nombre: ['Edison', [Validators.required, Validators.minLength(3)]],
      apellido: ['Pinanjota', [Validators.required, Validators.minLength(3)]],
      nombre_comercial: ['Systemcode', [Validators.required, Validators.minLength(3)]],
      direccion: ['Cayambe', [Validators.required, Validators.minLength(3)]],
      telefono: ['0978812129', [Validators.required, Validators.minLength(3)]],
      email: ['eepinanjotac@utn.edu.ec', [Validators.required, Validators.email]],
    });

  }

  ngOnInit(): void {
    this.cargarFacturas();
    this.cargarClientes();
    this.cargarFormasPago();
    this.cargarProductos();
    const fechaActual = new Date();
    this.fechaActual = formatDate(fechaActual, 'd-M-yyyy', 'en-US', 'UTC-5');
    //this.codigo = 'CODIGO 1';
  }

  cargarFacturas() {
    this.facturaService.loadFacturas()
      .subscribe(({ facturas }) => {
        this.facturas = facturas;
      });
  }

  cargarClientes() {
    this.clienteService.loadClientes()
      .subscribe(({ clientes }) => {
        this.clientes = clientes;
      })
  }

  cargarClientePorId(id_cliente: any) {
    return this.clienteService.loadClienteById(id_cliente);
  }

  //cargarClientePorIdentificacion(identificacion: any) {
  //return this.clienteService.loadClienteByIdentificacion(identificacion);
  //}

  /*

  cargarClientePorIdentificacion(identificacion: string) {
    console.log("  cargarClientePorIdentificacion(identificacion: any) {")
    console.log('identificaion a CARGAR')
    console.log(identificacion)
    this.clienteService.loadClienteByIdentificacion(identificacion)
      .subscribe(cliente => {
        const { id_cliente, identificacion, nombre, apellido } = cliente[0];
        this.clienteSeleccionado2 = cliente[0];
        console.log("id_cliente: " + id_cliente);
        console.log("identificacion: " + identificacion);
        console.log("nombre: " + nombre);
        console.log("apellido: " + apellido);
      })
  }
  */

  cargarClienteByIdentificacion(identificacion: string) {
    console.log("\n\n-> cargarClientePorIdentificacion(identificacion: string) {");
    console.log('identificacion: ' + identificacion);
    console.log('--> Incio - Load Cliente (service)');
    this.clienteService.loadClienteByIdentificacion(identificacion)
      .subscribe(
        (cliente) => {
          console.log('\n\n--> Incio - Load Cliente (service - subscribe)');
          if (Array.isArray(cliente) && cliente.length > 0) {
            const { id_cliente, identificacion, nombre, apellido } = cliente[0];
            console.log("Se encontró el cliente con la identificación: " + identificacion);
            console.log("< id_cliente: ", id_cliente);
            console.log("< identificacion: ", identificacion);
            console.log("< nombre: " + nombre);
            console.log("< apellido: " + apellido);
            this.id_cliente = id_cliente;
            this.identificacion = identificacion;
            this.nombre = nombre;
            this.apellido = apellido;
          } else {
            console.log("No se encontró ningún cliente con la identificación: " + identificacion);
            Swal.fire({
              title: 'Éxito 2',
              text: 'XML Cargado',
              icon: 'success',
              timer: 1500, // Duración en milisegundos (1 segundo)
              showConfirmButton: false, // Ocultar el botón "OK"
            })
              .then(() => {
                this.mostrarMensajeDeAdvertenciaConOpciones('Advertencia', 'Cliente no encontrado ¿Desea crear un nuevo cliente?');
              });
          }
          console.log('--> Fin - Load Cliente (service - subscribe)');
        },
        (err) => {
          // Manejo de errores en caso de problemas con la solicitud HTTP
          console.error("Error al buscar el cliente: ", err);
          // Puedes mostrar un mensaje de error al usuario o realizar otras acciones aquí
          let errorMessage = 'Se produjo un error al cargar el cliente.';
          if (err.error && err.error.msg) {
            errorMessage = err.error.msg;
          }
          Swal.fire('Error', err.error.msg, 'error');
        }
      );
    console.log('--> Fin - Load Cliente (service)');
  }

  // Función para mostrar mensajes de alerta con SweetAlert2
  mostrarMensajeDeError(title: string, text: string) {
    Swal.fire({
      icon: 'error' as SweetAlertIcon, // Puedes personalizar el ícono
      title,
      text,
    });
  }
  // Función para mostrar mensajes de advertencia con SweetAlert2
  mostrarMensajeDeAdvertencia(title: string, text: string) {
    Swal.fire({
      icon: 'warning' as SweetAlertIcon, // Cambiado a 'warning' para mostrar una advertencia
      title,
      text,
    });
  }

  // Función para mostrar mensajes de advertencia con opciones "Sí" o "No"
  mostrarMensajeDeAdvertenciaConOpciones(title: string, text: string) {
    console.log('\n\n-> mostrarMensajeDeAdvertenciaConOpciones(title: string, text: string) {')
    Swal.fire({
      icon: 'warning',
      title,
      text,
      showCancelButton: true, // Muestra los botones "Sí" y "No"
      confirmButtonText: 'Sí', // Texto del botón "Sí"
      cancelButtonText: 'No', // Texto del botón "No"
    }).then((result) => {
      if (result.isConfirmed) {
        // El usuario hizo clic en "Sí", puedes tomar acciones aquí
        console.log('Usuario hizo clic en "Sí"');
        console.log('--> Inicio - this.crearClienteXML()');
        this.crearClienteXML();
        console.log('--> Fin - this.crearClienteXML()');
      } else {
        // El usuario hizo clic en "No" o cerró el cuadro de diálogo
        console.log('Usuario hizo clic en "No" o cerró el cuadro de diálogo');
      }
    });

  }

  // Función para mostrar mensajes de advertencia con opciones "Sí" o "No"
  mostrarMensajeDeAdvertenciaConOpciones2(title: string, text: string) {
    console.log('\n\n-> mostrarMensajeDeAdvertenciaConOpciones2(title: string, text: string) {')
    Swal.fire({
      icon: 'warning',
      title,
      text,
      showCancelButton: true, // Muestra los botones "Sí" y "No"
      confirmButtonText: 'Sí', // Texto del botón "Sí"
      cancelButtonText: 'No', // Texto del botón "No"
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Usuario hizo clic en "Sí"');
        console.log('--> Inicio - this.crearFormaPagoXML()');
        this.crearFormaPagoXML();
        console.log('--> Fin - this.crearFormaPagoXML()');
      } else {
        // El usuario hizo clic en "No" o cerró el cuadro de diálogo
        console.log('Usuario hizo clic en "No" o cerró el cuadro de diálogo');
      }
    });
  }

  cargarFormasPago() {
    this.formaPagoService.loadFormasPago()
      .subscribe(({ formas_pago }) => {
        this.formas_pago = formas_pago;
        console.log("")
        console.log(formas_pago)
      })
  }

  id_forma_pago: any;
  codigo_forma_pago: any;
  descripcion_forma_pago: any;

  cargarFormaPagoByCodigo(codigo: string) {
    console.log('\n\n-> cargarFormaPagoByCodigo(codigo: string) {');
    console.log('codigo: ' + codigo);
    console.log('--> Incio - Load Forma Pago (service)');
    this.formaPagoService.loadFormaPagoByCodigo(codigo)
      .subscribe(
        (forma_pago) => {
          console.log('\n\n--> Incio - Load Forma Pago (service - subscribe)');
          if (Array.isArray(forma_pago) && forma_pago.length > 0) {
            const { id_forma_pago, codigo, descripcion } = forma_pago[0];
            console.log("Se encontró forma de pago con codigo: " + codigo);
            console.log("< id_forma_pago: " + id_forma_pago);
            console.log("< codigo: " + codigo);
            console.log("< descripcion: " + descripcion);

            this.id_forma_pago = id_forma_pago;
            this.codigo_forma_pago = codigo;
            this.descripcion_forma_pago = descripcion;
          } else {
            console.log("No se encontró ningúna forma de pago con codigo: " + this.codigo_forma_pago);
            Swal.fire({
              title: 'Éxito Forma Pago',
              text: 'XML Cargado',
              icon: 'success',
              timer: 1500, // Duración en milisegundos (1 segundo)
              showConfirmButton: false, // Ocultar el botón "OK"
            })
              .then(() => {
                this.mostrarMensajeDeAdvertenciaConOpciones2('Advertencia', 'Forma de pago no encontrado ¿Desea crear nueva Forma de Pago?');
              });
          }
          console.log('--> Fin - Load Forma Pago (service - subscribe)');
        },
        (err) => {
          // Manejo de errores en caso de problemas con la solicitud HTTP
          console.error("Error al buscar forma de pago: ", err);
          // Puedes mostrar un mensaje de error al usuario o realizar otras acciones aquí
          let errorMessage = 'Se produjo un error al cargar forma de pago.';
          if (err.error && err.error.msg) {
            errorMessage = err.error.msg;
          }
          Swal.fire('Error', err.error.msg, 'error');
        }
      );
    console.log('--> Fin - Load Forma Pago (service)');
  }


  crearFormaPagoXML() {
    console.log('\n\n->crearFormaPagoXML() {')

    this.codigo_forma_pago = this.formaPago
    this.descripcion_forma_pago = "FORMA DE PAGO N " + this.formaPago + " (editar)"

    console.log('> this.codigo_forma_pago', this.codigo_forma_pago)
    console.log('> this.descripcion_forma_pago', this.descripcion_forma_pago)

    if (!this.codigo_forma_pago || !this.descripcion_forma_pago) {
      Swal.fire('Error', 'Falta información requerida para crear la forma de pago.', 'error');
      return;
    }

    // Crea un objeto con la información de forma pago
    const formaPagoData = {
      codigo: this.codigo_forma_pago,
      descripcion: this.descripcion_forma_pago,
    };

    // Realiza la solicitud POST para crear Forma Pago
    console.log('--> Incio - Create Forma Pago (service)');
    this.formaPagoService.createFormaPago(formaPagoData).subscribe(
      (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Forma de Pago creado',
          text: 'Forma de Pago se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        console.log('--> Inicio - this.cargarFormaPagoByCodigo(this.codigo_forma_pago)');
        this.cargarFormaPagoByCodigo(this.codigo_forma_pago);
        console.log('--> Fin - this.cargarFormaPagoByCodigo(this.codigo_forma_pago)');
        //this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al crear Forma de Pago.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    //this.recargarComponente();
    console.log('--> Incio - Create Forma Pago (service)');
  }



  cargarProductos() {
    this.productoService.loadProductos()
      .subscribe(({ productos }) => {
        this.productos = productos;
      })
  }


  cargarFacturaPorId(id_factura_venta: any) {
    this.facturaService.loadFacturaById(id_factura_venta)
      .pipe(
        switchMap((factura: any) => {
          const { id_cliente, id_forma_pago, id_asiento, codigo, fecha_emision, fecha_vencimiento, estado_pago,
            subtotal_sin_impuestos, total_descuento, iva, valor_total, abono } = factura.factura[0];

          const saldo = factura.saldo;
          console.log("this.saldo");
          console.log(saldo);

          this.facturaSeleccionado = factura.factura[0];
          this.codigo = codigo;
          this.subtotal_sin_impuestos = subtotal_sin_impuestos;
          this.total_descuento = total_descuento;
          this.iva = iva;

          this.valor_total = valor_total;
          console.log("this.valor_total");
          console.log(this.valor_total);

          this.abono = abono;
          console.log("this.abono-----------------------");
          console.log(this.abono);

          return this.cargarClientePorId(id_cliente).pipe(
            concatMap(cliente => {
              const { identificacion, nombre, apellido, nombre_comercial, direccion, telefono, email } = cliente[0];
              this.clienteSeleccionado = cliente[0];
              this.identificacion = identificacion;
              this.nombre = nombre;
              this.apellido = apellido;
              this.direccion = direccion;
              this.telefono = telefono;
              this.email = email;
              const abono = "0.00";
              return of({
                identificacion, nombre, apellido, direccion, telefono, email, id_forma_pago, id_asiento, codigo,
                fecha_emision, fecha_vencimiento, estado_pago, subtotal_sin_impuestos, total_descuento, iva, valor_total, abono, saldo
              });
            })
          );
        })
      )
      .subscribe(data => {
        this.facturaFormU.setValue(data);
      });
  }

  /*
    cargarFacturaPorId2(id_factura_venta: any) {
      //console.log('id_factura_venta')
      //console.log(id_factura_venta)
      this.facturaService.loadFacturaById(id_factura_venta)
        .pipe(switchMap(factura => {
          const { id_cliente, id_forma_pago, id_asiento, codigo, fecha_emision, fecha_vencimiento, estado_pago,
            subtotal_sin_impuestos, total_descuento, iva, valor_total, abono } = factura[0];
  
          this.facturaSeleccionado = factura[0];
  
          this.codigo = codigo
  
          this.subtotal_sin_impuestos = subtotal_sin_impuestos
          this.total_descuento = total_descuento
          this.iva = iva
          this.valor_total = valor_total
          this.abono = abono
          console.log("this.abono")
          console.log(this.abono)
  
          return this.cargarClientePorId(id_cliente).pipe(
            concatMap(cliente => {
              const { identificacion, nombre, apellido, nombre_comercial, direccion, telefono, email } = cliente[0];
              this.clienteSeleccionado = cliente[0];
              this.identificacion = identificacion;
              //console.log("identficacion this 1")
              //console.log(this.identificacion)
              this.nombre = nombre;
              this.apellido = apellido;
              this.direccion = direccion;
              this.telefono = telefono;
              this.email = email;
              return of({ identificacion, nombre, apellido, direccion, telefono, email, id_forma_pago, id_asiento, codigo, fecha_emision, fecha_vencimiento, estado_pago, subtotal_sin_impuestos, total_descuento, iva, valor_total, abono });
            })
          );
        })
        )
        .subscribe(data => {
          this.facturaFormU.setValue(data);
        });
    }*/

  crearFactura2() {
    this.formSubmitted = true;
    console.log('CREAR factura 2');
    console.log(this.facturaForm.value);
    if (this.facturaForm.invalid) {
      return;
    }

    this.crearFactura2_aux()

    // Realizar posteo del factura principal
    this.facturaService.createFactura(this.facturaForm.value).subscribe(
      (res: any) => {
        const facturaId = res.id_factura_venta; // Obtener el ID del factura guardado
        console.log('facturaID')
        console.log(facturaId)
        console.log('DETALLES factura 222222')
        //console.log(this.detalleFactura2)
        // Crear los detalles y asociarlos al factura
        const detalles = [];
        for (const detalle2 of this.detalleFactura2) {
          const nuevoDetalle: DetalleFactura = {
            id_producto: detalle2.producto,
            id_factura_venta: facturaId,
            codigo_principal: detalle2.descripcion,//ver
            detalle_adicional: detalle2.descripcion,//ver
            cantidad: detalle2.cantidad,
            descripcion: detalle2.descripcion,
            precio_unitario: detalle2.precio_unitario,
            subsidio: detalle2.cantidad,//ver
            precio_sin_subsidio: detalle2.cantidad,//ver
            descuento: detalle2.descuento,
            codigo_auxiliar: detalle2.descripcion,//ver
            precio_total: detalle2.valor_total,
            iva: detalle2.tarifa,
            ice: detalle2.valor_ICE,
          };
          detalles.push(nuevoDetalle);
        }
        console.log('DETALLES CON ID_factura')
        console.log(detalles)
        this.detalleFacturaService.createDetalleFactura2(detalles).subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Factura y detalles creados',
              text: 'El factura y los detalles se han creado correctamente.',
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
            this.cerrarModal();
          },
          (err) => {
            // En caso de error en la creación del factura principal
            let errorMessage = 'Se produjo un error al crear el factura.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
        );

        this.recargarComponente();
      })
  }



  /*
  Problemas de sincronización
  crearFactura2XML() {
    this.formSubmitted = true;
    console.log('Hola XML');
  
    // solo para ver si tiene datos cargados
    this.crearFactura2_aux_XML()
  
    // busca el proveeedor por identificacion
    console.log("this.identificacionComprador")
    console.log(this.identificacionComprador)
    this.cargarClientePorIdentificacion(this.identificacionComprador)
    console.log("FINALIN 1")
  
    // mostramos los datos recuperado de la busqueda
    const nombreDelCliente = this.clienteSeleccionado2.nombre;
    console.log("Nombre del cliente: " + nombreDelCliente);
  
    // asiganamos el id_cliente de la identificación cargadad
    console.log("this.id_cliente XD")
    console.log(this.id_cliente)
  
    const facturaData: FormFacturaXML2 = {
  
      codigo: '1',
      fecha_emision: null,
      fecha_vencimiento: null,
      saldo: 0, // Valor válido
  
      razonSocial: 'Nombre de la razón social',
      ruc: '1234567890',
      claveAcceso: 'clave de acceso',
      estab: 'Establecimiento',
      ptoEmi: 'Punto de emisión',
      secuencial: 'Secuencial',
      id_factura_venta: 1,
  
      id_cliente: 5,
      id_forma_pago: 3,
      id_asiento: null,
      // Otras propiedades requeridas
      estado_pago: 'Por pagar', // Propiedad requerida
      subtotal_sin_impuestos: this.totalSinImpuestos, // Propiedad requerida
      total_descuento: 10, // Propiedad requerida
      iva: 12, // Propiedad requerida
      valor_total: this.importeTotal, // Propiedad requerida
      abono: 0, // Valor válido
    };
  
    this.facturaService.createFactura(facturaData).subscribe(
      (res: any) => {
        const facturaId = res.id_factura_venta; // Obtener el ID del factura guardado
        console.log('facturaID')
        console.log(facturaId)
        console.log('DETALLES factura 222222')
        //console.log(this.detalleFactura2)
        // Crear los detalles y asociarlos al factura
        const detalles = [];
        for (const detalle2 of this.xmlItems) {
          const nuevoDetalle: DetalleFactura = {
            id_producto: 1,
            id_factura_venta: facturaId,
            codigo_principal: detalle2.descripcion,//ver
            detalle_adicional: detalle2.descripcion,//ver
            cantidad: detalle2.cantidad,
            descripcion: detalle2.descripcion,
            precio_unitario: detalle2.precioUnitario,
            subsidio: detalle2.cantidad,//ver
            precio_sin_subsidio: detalle2.cantidad,//ver
            descuento: detalle2.descuento,
            codigo_auxiliar: detalle2.descripcion,//ver
            precio_total: detalle2.precioTotalSinImpuesto,
            iva: detalle2.tarifa,
            ice: detalle2.cantidad,
          };
          detalles.push(nuevoDetalle);
        }
        console.log('DETALLES CON ID_factura')
        console.log(detalles)
        this.detalleFacturaService.createDetalleFactura2(detalles).subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Factura y detalles creados',
              text: 'El factura y los detalles se han creado correctamente.',
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
            this.cerrarModal();
          },
          (err) => {
            // En caso de error en la creación del factura principal
            let errorMessage = 'Se produjo un error al crear el factura.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
        );
  
        this.recargarComponente();
      })
  }
  */

  crearFactura2_aux() {
    // Obtener los valores del formulario de detalles
    const formValues = this.detalleForm.getRawValue();
    console.log('formValues -----------');
    console.log(formValues);

    // Obtener el número de detalles
    const numDetalles2 = Object.keys(formValues).filter(key => key.startsWith('producto_')).length;
    console.log('numDetalles 2 -----------');
    console.log(numDetalles2);

    // Reiniciar el arreglo detalleFactura2
    this.detalleFactura2 = [];

    for (let i = 0; i < numDetalles2; i++) {
      const nuevoDetalle: DetalleFactura2 = {
        producto: formValues[`producto_${i}`],
        cantidad: formValues[`cantidad_${i}`],
        descripcion: formValues[`descripcion_${i}`],
        precio_unitario: formValues[`precio_unitario_${i}`],
        tarifa: formValues[`tarifa_${i}`],
        descuento: formValues[`descuento_${i}`],
        valor_total: formValues[`valor_total_${i}`],
        valor_ICE: formValues[`valor_ICE_${i}`],
      };

      this.detalleFactura2.push(nuevoDetalle);
    }

    console.log('detalleFactura2 -----------');
    console.log(this.detalleFactura2);
    // Limpiar el formulario de detalles
    //this.detalleForm.reset();
  }

  crearFactura2_aux_XML() {

    // Reiniciar el arreglo xmlItems
    //this.xmlItems = [];

    console.log('PROBANDO DATOS 1 en xmlItems -----------');
    console.log(this.xmlItems);
    // Limpiar el formulario de detalles
    //this.detalleForm.reset();
  }



  agregarDetalleFactura2(): void {
    if (this.detalleForm.invalid) {
      console.log('RETURN')
      return;
    }

    const nuevoDetalle2: DetalleFactura2 = {
      producto: null,
      cantidad: null,
      descripcion: '',
      precio_unitario: null,
      tarifa: null,
      descuento: null,
      valor_total: null,
      valor_ICE: null
    };

    // Crear instancias de FormControl para cada propiedad del detalle
    const productoControl = new FormControl(nuevoDetalle2.producto);
    const cantidadControl = new FormControl(nuevoDetalle2.cantidad);
    const descripcionControl = new FormControl(nuevoDetalle2.descripcion);
    const precioUnitarioControl = new FormControl(nuevoDetalle2.precio_unitario);
    const tarifaControl = new FormControl(nuevoDetalle2.tarifa);
    const descuentoControl = new FormControl(nuevoDetalle2.descuento);
    const valorTotalControl = new FormControl(nuevoDetalle2.valor_total);
    const valorICEControl = new FormControl(nuevoDetalle2.valor_ICE);

    // Agregar los controles al formulario
    this.detalleForm.addControl('producto_' + this.detalleFactura2.length, productoControl);
    this.detalleForm.addControl('cantidad_' + this.detalleFactura2.length, cantidadControl);
    this.detalleForm.addControl('descripcion_' + this.detalleFactura2.length, descripcionControl);
    this.detalleForm.addControl('precio_unitario_' + this.detalleFactura2.length, precioUnitarioControl);
    this.detalleForm.addControl('tarifa_' + this.detalleFactura2.length, tarifaControl);
    this.detalleForm.addControl('descuento_' + this.detalleFactura2.length, descuentoControl);
    this.detalleForm.addControl('valor_total_' + this.detalleFactura2.length, valorTotalControl);
    this.detalleForm.addControl('valor_ICE_' + this.detalleFactura2.length, valorICEControl);

    nuevoDetalle2.producto = productoControl.value;
    nuevoDetalle2.cantidad = cantidadControl.value;
    nuevoDetalle2.descripcion = descripcionControl.value;
    nuevoDetalle2.precio_unitario = precioUnitarioControl.value;
    nuevoDetalle2.tarifa = tarifaControl.value;
    nuevoDetalle2.descuento = descuentoControl.value;
    nuevoDetalle2.valor_total = valorTotalControl.value;
    nuevoDetalle2.valor_ICE = valorICEControl.value;

    // Agregar el detalle al arreglo
    this.detalleFactura2.push(nuevoDetalle2);
    console.log('DETALLE ----------- detalleFactura2')
    console.log(this.detalleFactura2)
    // Calcular los totales
    //this.calcularTotales();
  }

  eliminarDetalle(index: number): void {
    this.detalleFactura2.splice(index, 1);
    // Calcular los totales
    //this.calcularTotales();
  }

  actualizarFactura() {
    console.log("Actualizar: actualizarFactura() { ")
    //console.log(factura.id_factura_venta)
    if (this.facturaFormU.invalid) {
      return;
    }
    const data = {
      ...this.facturaFormU.value,
      id_factura_venta: this.facturaSeleccionado.id_factura_venta
    }

    console.log("UNO---updateFactura()")
    console.log(data)

    // realizar posteo
    this.facturaService.updateFactura(data)
      .subscribe(res => {
        console.log("DOS---updateFactura()")
        console.log(data)

        Swal.fire({
          icon: 'success',
          title: 'Factura actualizado',
          text: 'Factura se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        //this.router.navigateByUrl(`/dashboard/facturas`)
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al actualizar el factura.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  borrarFactura(factura: Factura) {
    console.log("Borrar:   borrarFactura(factura: Factura) {")
    console.log(factura.id_factura_venta)
    Swal.fire({
      title: '¿Borrar Factura?',
      text: `Estas a punto de borrar a ${factura.codigo}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.facturaService.deleteFactura(factura.id_factura_venta)
          .subscribe(resp => {
            this.cargarFacturas();
            Swal.fire({
              icon: 'success',
              title: 'Factura borrado',
              text: `${factura.codigo} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar el factura.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
          );
      }
    });
  }

  campoNoValido(campo: string, form: FormGroup): boolean {
    if (form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }

  obtenerUltimoId(): number {
    if (this.facturas.length > 0) {
      return (this.facturas[this.facturas.length - 1].id_factura_venta) + 1;
    }
    return 0; // o cualquier valor predeterminado
  }

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/facturas']);
    });

  }

  abrirModal() {
    this.ocultarModal = false;
    this.activatedRoute.params.subscribe(params => {
      console.log(params)
    })
  }

  cerrarModal() {
    this.ocultarModal = true;
  }

  nombreCliente: string;
  apellidoCliente: string;
  direccionCliente: string;
  telefonoCliente: string;
  emailCliente: string;

  estadoPagoFactura: string;

  actualizarNombre(event: any): void {
    const clienteId = event.target.value;
    const cliente = this.clientes.find(p => p.id_cliente == clienteId);
    this.nombreCliente = cliente ? cliente.nombre : '';
  }

  actualizarApellido(event: any): void {
    const clienteId = event.target.value;
    const cliente = this.clientes.find(p => p.id_cliente == clienteId);
    this.apellidoCliente = cliente ? cliente.apellido : '';
  }

  actualizarDireccion(event: any): void {
    const clienteId = event.target.value;
    const cliente = this.clientes.find(p => p.id_cliente == clienteId);
    this.direccionCliente = cliente ? cliente.direccion : '';
  }

  actualizarTelefono(event: any): void {
    const clienteId = event.target.value;
    const cliente = this.clientes.find(p => p.id_cliente == clienteId);
    this.telefonoCliente = cliente ? cliente.telefono : '';
  }

  actualizarEmail(event: any): void {
    const clienteId = event.target.value;
    const cliente = this.clientes.find(p => p.id_cliente == clienteId);
    this.emailCliente = cliente ? cliente.email : '';
  }

  crearClienteXML() {
    console.log("\n\n-> crearClienteXML() {")
    //this.formSubmitted = true;
    /*
    this.identificacion = "1727671630"
    this.nombre = "Edison"
    this.apellido = "Pinanjota"
    this.nombre_comercial = "SystemCode"
    this.direccion = "Cayambe"
    this.telefono = "0978812130"
    this.email = "eepinanjotac30@utn.edu.ec"
    */
    this.identificacion = this.identificacionComprador
    this.nombre = this.razonSocialComprador
    this.apellido = ""
    this.nombre_comercial = ""
    this.direccion = this.direccionComprador
    this.telefono = ""
    this.email = this.identificacionComprador + "@example.com"

    console.log('> this.identificacion', this.identificacion)
    console.log('> this.nombre (Razón Social): ', this.nombre)
    console.log('> this.apellido: ', this.apellido)
    console.log('> this.nombre_comercial: ', this.nombre_comercial)
    console.log('> this.direccion: ', this.direccion)
    console.log('> this.telefono: ', this.telefono)
    console.log('> this.email: ', this.email)

    if (!this.identificacion || !this.nombre || !this.direccion) {
      Swal.fire('Error', 'Falta información requerida para crear el cliente.', 'error');
      return;
    }

    // Crea un objeto con la información del cliente
    const clienteData = {
      identificacion: this.identificacion,
      nombre: this.nombre,
      apellido: this.apellido,
      nombre_comercial: this.nombre_comercial,
      direccion: this.direccion,
      telefono: this.telefono,
      email: this.email
    };

    // Realiza la solicitud POST para crear el cliente
    console.log('--> Incio - Create Cliente (service)');
    this.clienteService.createCliente(clienteData).subscribe(
      (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente creado',
          text: 'Cliente se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        console.log('--> Inicio - this.cargarClienteByIdentificacion(this.identificacion)');
        this.cargarClienteByIdentificacion(this.identificacion);
        console.log('--> Fin - this.cargarClienteByIdentificacion(this.identificacion)');
        //this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al crear el cliente.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    //this.recargarComponente();
    console.log('--> Fin - Create Cliente (service)');
  }

  crearCliente() {
    this.formSubmitted = true;
    console.log(this.clienteForm.value)
    if (this.clienteForm.invalid) {
      return;
    }
    // realizar posteo
    this.clienteService.createCliente(this.clienteForm.value)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente creado',
          text: 'Cliente se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        //this.nuevoCliente = res;
        this.clienteCreado.emit(res); // Emitir el evento clienteCreado con el cliente creado
        console.log('////////////// RES')
        console.log(res)

        this.nuevoCliente = res;

        this.id_cliente = this.nuevoCliente.id_cliente;
        this.nombre = this.nuevoCliente.nombre;
        this.apellido = this.nuevoCliente.apellido;
        this.direccion = this.nuevoCliente.direccion;
        this.telefono = this.nuevoCliente.telefono;
        this.email = this.nuevoCliente.email;

        console.log('ID CLIENTE')
        console.log(this.id_cliente)
        console.log('NOMBRE')
        console.log(this.nombre)
        console.log('APELLIDO')
        console.log(this.apellido)
        console.log('DIRECCION')
        console.log(this.direccion)
        console.log('TELEFONO')
        console.log(this.telefono)
        console.log('EMAIL')
        console.log(this.email)

        //this.recargarComponente();
        this.agregarCliente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al crear el cliente.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    //this.recargarComponente();
  }

  nuevoCliente: any;
  id_cliente: any;
  /* OJO ver si esta ingresadon correctamente por que fueron comentadas estas lienas
  nombre: any;
  apellido: any;
  direccion: any;
  telefono: any;
  email: any;*/

  agregarCliente() {
    // Seleccionar automáticamente el nuevo cliente en el selector
    this.facturaForm.get('id_cliente').setValue(this.id_cliente);
    this.facturaForm.get('identificacion').setValue(this.identificacion);
    //this.facturaForm.get('identificacion').setValue(this.identificacionSeleccionada);
    this.facturaForm.get('nombre').setValue(this.nombre);
    this.facturaForm.get('apellido').setValue(this.apellido);
    this.facturaForm.get('direccion').setValue(this.direccion);
    this.facturaForm.get('telefono').setValue(this.telefono);
    this.facturaForm.get('email').setValue(this.email);
  }

  clientesFiltrados: any[] = [];

  filtrarClientes3(event: any) {
    const identficacion = event.target.value.toLowerCase();
    console.log('A buscar')
    console.log(identficacion)
    this.clientesFiltrados = this.clientes.filter(cliente => cliente.identificacion.toLowerCase().includes(identficacion));
    console.log('Encontrado')
    console.log(this.clientesFiltrados)
  }
  /*
    filtrarClientes2(identficacionInput: any) {
      const identficacion = identficacionInput.target.value as string;
      console.log('A buscar')
      console.log(identficacion)
      this.clientes = this.clientes.filter(cliente => cliente.identificacion.includes(identficacion));
      console.log('Encontrado')
      console.log(this.clientes)
    }*/

  clienteSeleccionado: any;

  seleccionarCliente3(cliente: any) {
    // Aquí puedes realizar alguna acción adicional con el cliente seleccionado
    console.log(cliente);
    // También puedes asignar los valores a los campos correspondientes en el formulario
    this.facturaForm.patchValue({
      id_cliente: cliente.id_cliente,
      identificacion: cliente.identificacion,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      email: cliente.email
    });
  }

  identificacionSeleccionada: string;

  actualizarIdentificacion(identificacion: string) {
    this.identificacionSeleccionada = identificacion;
  }

  showClientesFiltrados: boolean = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    this.showClientesFiltrados = clickedInside;
  }


  getFormattedFechaEmision(): string {
    const fechaEmision = this.facturaFormU.get('fecha_emision')?.value;
    if (fechaEmision) {
      const fecha = new Date(fechaEmision);
      return fecha.toISOString().split('T')[0];
    }
    return '';
  }

  getFormattedFechaVencimiento(): string {
    const fechaVencimiento = this.facturaFormU.get('fecha_vencimiento')?.value;
    if (fechaVencimiento) {
      const fecha = new Date(fechaVencimiento);
      return fecha.toISOString().split('T')[0];
    }
    return '';
  }

  /*
  cargarDetalleFacturas(id_factura_venta: any) {
    this.detalleFacturaService.loadDetalleFacturaByFactura(id_factura_venta)
      .subscribe(({ detalle_facturas }) => {
        this.detalle_facturas = detalle_facturas;
      })
  }
  calcularAbono(id_factura_venta: any) {
    this.detalleFacturaService.loadDetalleFacturaByFactura(id_factura_venta)
      .subscribe(({ detalle_facturas }) => {
        this.detalle_facturas = detalle_facturas;
      })
  }


  cargarDetalleFacturas2(id_factura_venta: any) {
    this.detalleFacturaService.loadDetalleFacturaByFactura2(id_factura_venta)
      .subscribe(response => {
        this.detalle_facturas = response.detalle_facturas;
      });
  }
*/

  // XML
  
  loadXML() {
    if (this.xmlFilePath) {
      this.http.get(this.xmlFilePath, {
        //this.http.get('assets/users.xml', {
        headers: new HttpHeaders()
          .set('Content-Type', 'text/xml')
          .append('Access-Control-Allow-Methods', 'GET')
          .append('Access-Control-Allow-Origin', '*')
          .append('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Access-Control-Allow-Origin, AccessControl-Request-Method"),
        responseType: 'text'
      }).subscribe((data) => {
        this.parseXML(data).then((data) => {
          this.xmlItems = data;
        });
      });
    }
  }
  

  
  parseXML(data: string): Promise<ProductDetail[]> {
    console.log("\n\n-> parseXML(data: string): Promise<ProductDetail[]> {")
    return new Promise(resolve => {
      var k: string | number,
        arr: ProductDetail[] = [],
        parser = new xml2js.Parser({
          trim: true,
          explicitArray: true
        });

      parser.parseString(data, (err, result) => {
        const factura = result?.factura;
        if (!factura) {
          resolve(arr);
          return;
        }

        const infoTributaria = factura.infoTributaria[0];
        this.razonSocial = infoTributaria.razonSocial[0];
        this.ruc = infoTributaria.ruc[0];
        this.claveAcceso = infoTributaria.claveAcceso[0];
        this.estab = infoTributaria.estab[0];
        this.ptoEmi = infoTributaria.ptoEmi[0];
        this.secuencial = infoTributaria.secuencial[0];

        const infoFactura = factura.infoFactura[0];
        this.fechaEmision = infoFactura.fechaEmision[0];
        this.razonSocialComprador = infoFactura.razonSocialComprador[0];
        this.identificacionComprador = infoFactura.identificacionComprador[0];
        this.direccionComprador = infoFactura.direccionComprador[0];
        this.totalSinImpuestos = parseFloat(infoFactura.totalSinImpuestos[0]);
        this.totalDescuento = parseFloat(infoFactura.totalDescuento[0]);

        const totalImpuestos = infoFactura.totalConImpuestos[0].totalImpuesto[0];

        if (totalImpuestos.codigo[0] === '2' && totalImpuestos.codigoPorcentaje[0] === '2') {
          this.codigo2 = totalImpuestos.codigo[0];
          this.codigoPorcentaje2 = totalImpuestos.codigoPorcentaje[0];
          this.baseImponible2 = parseFloat(totalImpuestos.baseImponible[0]);
          this.valor2 = parseFloat(totalImpuestos.valor[0]);
        }

        this.importeTotal = parseFloat(result.factura.infoFactura[0].importeTotal[0]);

        const pago = result.factura.infoFactura[0].pagos[0].pago[0];
        this.formaPago = pago.formaPago[0];
        this.total = parseFloat(pago.total[0]);
        this.plazo = parseInt(pago.plazo[0]);
        this.unidadTiempo = pago.unidadTiempo[0];

        this.precioTotalSinImpuestoAux = 0;
        this.valor = 0;

        if (result && result.factura) {
          if (result.factura.detalles && result.factura.detalles[0] && result.factura.detalles[0].detalle) {
            var detalles = result.factura.detalles[0].detalle;
            for (k in detalles) {
              var item = detalles[k];
              arr.push({
                codigoPrincipal: item.codigoPrincipal[0],
                descripcion: item.descripcion[0],
                cantidad: parseFloat(item.cantidad[0]),
                precioUnitario: parseFloat(item.precioUnitario[0]),
                descuento: parseFloat(item.descuento[0]),
                precioTotalSinImpuesto: parseFloat(item.precioTotalSinImpuesto[0]),
                // Add the new properties here
                codigo: item.impuestos[0].impuesto[0].codigo[0],
                codigoPorcentaje: item.impuestos[0].impuesto[0].codigoPorcentaje[0],
                tarifa: parseFloat(item.impuestos[0].impuesto[0].tarifa[0]),
                baseImponible: parseFloat(item.impuestos[0].impuesto[0].baseImponible[0]),
                valor: parseFloat(item.impuestos[0].impuesto[0].valor[0]),
              });
              // calculados
              this.precioTotalSinImpuestoAux += parseFloat(item.precioTotalSinImpuesto[0]);
              if (item.impuestos[0].impuesto[0].codigoPorcentaje[0] === '2') {
                this.valor += parseFloat(item.impuestos[0].impuesto[0].valor[0]);
              }

            }
          }
        }
        this.xmlItems = arr; // Updated to assign to xmlItems
        console.log('this.xmlItems: ', this.xmlItems);

        resolve(arr);

        
        console.log('--> Inicio -  Cargar Cliente');
        this.cargarClienteByIdentificacion(this.identificacionComprador)
        console.log('--> Fin -  Cargar Cliente');

        console.log('--> Incio - Cargar Forma Pago');
        this.cargarFormaPagoByCodigo(this.formaPago)
        console.log('--> Fin - Cargar Forma Pago');

      });
    });
  }
  



  onFileSelected(event: any): void {
    console.log('\n\n-> START (Seleccionar archivo)  onFileSelected(event: any): void {');
    const file: File = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.xml')) { // Verifica que el archivo sea de tipo XML
        const reader = new FileReader();
        reader.onload = (e) => { // Define una función de devolución de llamada que se ejecutará después de que se cargue el archivo.
          if (e.target) {
            const result = e.target.result;
            if (result) {
              const xmlData: string | ArrayBuffer = result as string | ArrayBuffer; // Verifica si result no es nulo
              this.parseXML(xmlData as string)
                .then((data) => {
                  this.xmlItems = data;
                });
            }
          }
        };
        reader.readAsText(file); // Lee el contenido del archivo como una cadena.
        Swal.fire({
          title: 'Éxito',
          text: 'XML Cargado',
          icon: 'success',
          timer: 1500, // Duración en milisegundos (1 segundo)
          showConfirmButton: false, // Ocultar el botón "OK"
        });
        // Lógica para cargar el archivo al servidor (en este caso, moverlo a la carpeta "assets" de tu aplicación)
        this.uploadFile(file);
      } else {
        // El archivo no es de tipo XML, muestra un mensaje de error o realiza la acción correspondiente.
        //alert('Selecciona un archivo XML válido.');
        this.mostrarMensajeDeError('Error', 'Selecciona un archivo XML válido..');
      }
    }
  }
  

  uploadFile(file: File): void {
    const formData = new FormData();
    formData.append('xmlFile', file, file.name);

    // Realiza una solicitud HTTP para cargar el archivo al servidor (por ejemplo, en una API)
    // Asegúrate de configurar tu servidor para manejar la carga de archivos.

    // Ejemplo de solicitud HTTP (debes ajustarlo según tu backend):
    // this.http.post('URL_de_tu_API', formData).subscribe(response => {
    //   console.log('Archivo cargado exitosamente.', response);
    // }, error => {
    //   console.error('Error al cargar el archivo.', error);
    // });
  }




}

// Define the ProductDetail interface
interface ProductDetail {
  codigoPrincipal: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  precioTotalSinImpuesto: number;
  codigo: string; // Add the new properties here
  codigoPorcentaje: string;
  tarifa: number;
  baseImponible: number;
  valor: number;
}

interface FormFacturaXML2 {

  codigo: string;
  fecha_emision: Date;
  fecha_vencimiento: Date;
  saldo: number;
  razonSocial: string;
  ruc: string;
  claveAcceso: string;
  estab: string;
  ptoEmi: string;
  secuencial: string;
  id_factura_venta: number;
  id_cliente: number;
  id_forma_pago: number;
  id_asiento: number;
  estado_pago: string;
  subtotal_sin_impuestos: number;
  total_descuento: number;
  iva: number;
  valor_total: number;
  abono: number;
  // Otras propiedades necesarias
}
