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

// Models
import { Factura } from 'src/app/models/compra/factura.model';
import { DetalleFactura } from '../../../models/compra/detalle-factura.model';
import { Proveedor } from '../../../models/compra/proveedor.model';
import { Producto } from 'src/app/models/inventario/producto.model';
import { FormaPago } from '../../../models/contabilidad/forma-pago.model';

// Services
import { FacturaService } from 'src/app/services/compra/factura.service';
import { DetalleFacturaService } from 'src/app/services/compra/detalle-factura.service';
import { ProveedorService } from 'src/app/services/compra/proveedor.service';
import { ProductoService } from 'src/app/services/inventario/producto.service';
import { FormaPagoService } from 'src/app/services/contabilidad/forma-pago.service';

import { EventEmitter, Output } from '@angular/core';
import { forkJoin, Observable } from 'rxjs'; // Importa forkJoin y Observable
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';

interface DetalleFacturaFormulario {
  producto: number;
  codigo_principal: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  precio_total_sin_impuesto: number;
  //codigo: number;
  //codigo_porcentaje: number;
  tarifa: number;
  //base_imponible: number;
  valor: number;
  ice: number;
  precio_total: number;
}

interface FacturaXML {
  id_proveedor: number;
  id_forma_pago: number;
  id_asiento: number;
  id_info_tributaria: number,
  clave_acceso: string;
  codigo: string;
  fecha_emision: Date;
  fecha_vencimiento: Date;
  estado_pago: string;
  total_sin_impuesto: number;
  total_descuento: number;
  valor: number;
  propina: number;
  importe_total: number;
  abono: number;
  //saldo: number;

  /*
    razon_social: string;
    ruc: string;
    estab: string;
    ptoEmi: string;
    secuencial: string;
    */
}

// Define the DetalleXML interface
interface DetalleXML {
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

// Define the ProductoXML interface
/*
interface ProductoXML {
  codigoPrincipal: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  tarifa: number;
  //valorUnitarioAux: number;
  //precioCompraUnitarioAux: number;
}

*/
@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styles: [
  ]
})
export class FacturaComponent implements OnInit {

  @Output() proveedorCreado = new EventEmitter<any>();

  public formSubmitted = false;
  public ocultarModal: boolean = true;

  public facturaForm: FormGroup;
  //public facturaFormXML: FormGroup;
  public facturaFormU: FormGroup;
  public detalleFacturaForm: FormGroup;
  public proveedorForm: FormGroup;
  public proveedorSeleccionado2: Proveedor;

  public facturas: Factura[] = [];
  public saldo: string;
  public detalleFactura: DetalleFactura;
  public detalleFacturaFormulario: DetalleFacturaFormulario[] = [];  // Agrega una matriz para almacenar los detalles del asiento
  public facturaSeleccionada: Factura;
  public fechaActual: string;

  public codigo: string;
  public total_sin_impuesto: number;
  public total_descuento: number;
  public valor: number;
  public importe_total: number;
  public abono: number;

  public proveedores: Proveedor[] = [];
  public formas_pago: FormaPago[] = [];
  public productos: Producto[] = [];

  // Proveedor
  public identificacion: string;
  public razon_social: string;
  public nombre_comercial: string;
  public direccion: string;
  public telefono: string;
  public email: string;

  public detalle_facturas: DetalleFactura[] = [];

  // XML
  title = 'Read XML';
  public detallesXML: DetalleXML[] = []; // Updated to use the DetalleXML interface
  //public productosXML: ProductoXML[] = []; // Updated to use the DetalleXML interface
  private xmlFilePath: string | null = null;

  // infoTributaria
  public ambiente: string = '';
  public tipoEmision: string = '';
  public razonSocial: string = '';
  public ruc: string = '';
  public claveAcceso: string = '';
  public codDoc: string = '';
  public estab: string = '';
  public ptoEmi: string = '';
  public secuencial: string = '';
  public dirMatriz: string = '';
  public contribuyenteRimpe: string = '';

  // infoFactura
  public fechaEmision: Date = null;
  //EDpublic fechaEmision: string = '';
  public dirEstablecimiento: string = '';
  public obligadoContabilidad: string = '';
  public tipoIdentificacionComprador: string = '';
  public razonSocialComprador: string = '';
  public identificacionComprador: string = '';
  public direccionComprador: string = '';
  public totalSinImpuestos: number = 0.00;
  public totalDescuento: number = 0.00;
  public ivaAux: number = 0.00;

  public codigo2: string = '';
  public codigoPorcentaje2: string = '';
  public baseImponible2: number = 0.00;
  public valor2: number = 0.00;

  public propina: number = 0.00;
  public importeTotal: number = 0.00;
  public moneda: string = "";

  public formaPago: string = '';
  public total: number = 0;
  public plazo: number = 0;
  public unidadTiempo: string = '';

  // calculados con detalles
  public precioTotalSinImpuestoAux: number = 0;
  public valorAux: number = 0;

  // productos
  public valorUnitarioAux: number = 0;
  public precioCompraUnitarioAux: number = 0;

  // informacioó adicional
  public telefonoXML: string = "";
  public emailXML: string = "";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,

    private elementRef: ElementRef,

    private facturaService: FacturaService,
    private detalleFacturaService: DetalleFacturaService,
    private proveedorService: ProveedorService,
    private formaPagoService: FormaPagoService,
    private productoService: ProductoService,

    //XML
    private http: HttpClient,

  ) {
    this.facturaForm = this.fb.group({

      id_factura_compra: [''],

      id_proveedor: ['', [Validators.required, Validators.minLength(0)]],
      identificacion: ['', [Validators.required, Validators.minLength(0)]],
      razon_social: ['', [Validators.required, Validators.minLength(0)]],
      direccion: ['', [Validators.required, Validators.minLength(0)]],
      telefono: ['', [Validators.required, Validators.minLength(0)]],
      email: ['', [Validators.required, Validators.email]],

      id_forma_pago: ['2'],
      id_asiento: ['1'],
      codigo: [''],
      fecha_emision: [''],
      fecha_vencimiento: [''],
      total_sin_impuesto: ['22'],
      total_descuento: ['22'],
      valor: ['22'],
      propina: ['22'],
      importe_total: ['22'],
      abono: [''],
      //saldo: ['8'],
    });

    this.facturaFormU = this.fb.group({

      //id_factura_compra: [''], 

      //id_proveedor: [''],
      identificacion: [''],
      razon_social: [''],
      direccion: [''],
      telefono: [''],
      email: [''],

      id_forma_pago: [''],
      id_asiento: [''],
      codigo: [''],
      fecha_emision: [''],
      fecha_vencimiento: [''],
      estado_pago: [''],
      total_sin_impuesto: [''],
      total_descuento: [''],
      valor: [''],
      importe_total: [''],

      abono: [''],
      saldo: [''],
    });

    this.detalleFacturaForm = this.fb.group({
      detalles: this.fb.array([])
    });

    this.proveedorForm = this.fb.group({
      identificacion: ['1727671628', [Validators.required, Validators.minLength(3)]],
      razon_social: ['PINANJOTA EDISON', [Validators.required, Validators.minLength(3)]],
      nombre_comercial: ['Systemcode', [Validators.required, Validators.minLength(3)]],
      direccion: ['Cayambe', [Validators.required, Validators.minLength(3)]],
      telefono: ['0978812129', [Validators.required, Validators.minLength(3)]],
      email: ['eepinanjotac@utn.edu.ec', [Validators.required, Validators.email]],
    });

  }

  ngOnInit(): void {
    this.cargarFacturas();
    this.cargarProveedores();
    this.cargarFormasPago();
    this.cargarProductos();
    const fechaActual = new Date();
    this.fechaActual = formatDate(fechaActual, 'd-M-yyyy', 'en-US', 'UTC-5');
  }

  cargarFacturas() {
    this.facturaService.loadFacturas()
      .subscribe(({ facturas }) => {
        this.facturas = facturas;
      });
  }

  cargarProveedores() {
    this.proveedorService.loadProveedores()
      .subscribe(({ proveedores }) => {
        this.proveedores = proveedores;
      })
  }

  cargarProveedorPorId(id_proveedor: any) {
    return this.proveedorService.loadProveedorById(id_proveedor);
  }

  cargarProveedorByIdentificacion(identificacion: string) {
    console.log("\n\n-> cargarProveedorPorIdentificacion(identificacion: string) {");
    console.log('identificacion: ' + identificacion);
    console.log('--> Incio - Load Proveedor (service)');
    this.proveedorService.loadProveedorByIdentificacion(identificacion)
      .subscribe(
        (proveedor) => {
          console.log('\n\n--> Incio - Load Proveedor (service - subscribe)');
          if (Array.isArray(proveedor) && proveedor.length > 0) {
            const { id_proveedor, identificacion, razon_social } = proveedor[0];
            console.log("Se encontró el proveedor con la identificación: " + identificacion);
            console.log("< id_proveedor: ", id_proveedor);
            console.log("< identificacion: ", identificacion);
            console.log("< razon_social: " + razon_social);
            this.id_proveedor = id_proveedor;
            this.identificacion = identificacion;
            this.razon_social = razon_social;
          } else {
            console.log("No se encontró ningún proveedor con la identificación: " + identificacion);
            Swal.fire({
              title: 'Éxito 2',
              text: 'XML Cargado',
              icon: 'success',
              timer: 1500, // Duración en milisegundos (1 segundo)
              showConfirmButton: false, // Ocultar el botón "OK"
            })
              .then(() => {
                this.mostrarMensajeDeAdvertenciaConOpciones('Advertencia', 'Proveedor no encontrado ¿Desea crear un nuevo proveedor?');
              });
          }
          console.log('--> Fin - Load Proveedor (service - subscribe)');
        },
        (err) => {
          // Manejo de errores en caso de problemas con la solicitud HTTP
          console.error("Error al buscar el proveedor: ", err);
          // Puedes mostrar un mensaje de error al usuario o realizar otras acciones aquí
          let errorMessage = 'Se produjo un error al cargar el proveedor.';
          if (err.error && err.error.msg) {
            errorMessage = err.error.msg;
          }
          Swal.fire('Error', err.error.msg, 'error');
        }
      );
    console.log('--> Fin - Load Proveedor (service)');
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
        console.log('--> Inicio - this.crearProveedorXML()');
        this.crearProveedorXML();
        console.log('--> Fin - this.crearProveedorXML()');
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

  cargarFacturaPorId(id_factura_compra: any) {
    this.facturaService.loadFacturaById(id_factura_compra)
      .pipe(
        switchMap((factura: any) => {
          const { id_proveedor, id_forma_pago, id_asiento, codigo, fecha_emision, fecha_vencimiento, estado_pago,
            total_sin_impuesto, total_descuento, valor, importe_total, abono } = factura.factura[0];

          const saldo = factura.saldo;
          console.log("this.saldo");
          console.log(saldo);

          this.facturaSeleccionada = factura.factura[0];
          this.codigo = codigo;
          this.total_sin_impuesto = total_sin_impuesto;
          this.total_descuento = total_descuento;
          this.valor = this.valor2;

          this.importe_total = importe_total;
          console.log("this.importe_total");
          console.log(this.importe_total);

          this.abono = abono;
          console.log("this.abono-----------------------");
          console.log(this.abono);

          return this.cargarProveedorPorId(id_proveedor).pipe(
            concatMap(proveedor => {
              const { identificacion, razon_social, nombre_comercial, direccion, telefono, email } = proveedor[0];
              this.proveedorSeleccionado = proveedor[0];
              this.identificacion = identificacion;
              this.razon_social = razon_social;
              this.direccion = direccion;
              this.telefono = telefono;
              this.email = email;
              const abono = "0.00";
              return of({
                identificacion, razon_social, direccion, telefono, email, id_forma_pago, id_asiento, codigo,
                fecha_emision, fecha_vencimiento, estado_pago, total_sin_impuesto, total_descuento, valor, importe_total, abono, saldo
              });
            })
          );
        })
      )
      .subscribe(data => {
        this.facturaFormU.setValue(data);
      });
  }

  crearFactura() {
    console.log('\n\n🟩 crearFactura() {');
    this.formSubmitted = true;
    console.log(this.facturaForm.value);
    if (this.facturaForm.invalid) {
      return;
    }

    // Obtener los detalles del formulario
    this.obtenerDetalleFacturaFormulario()

    // Realizar posteo del factura principal
    this.facturaService.createFactura(this.facturaForm.value).subscribe(
      (res: any) => {
        const facturaId = res.id_factura_compra; // Obtener el ID del factura guardado
        console.log('facturaID: ', facturaId)

        // Crear los detalles y asociarlos a la factura
        const detalles = [];
        for (const detalle of this.detalleFacturaFormulario) {
          const nuevoDetalle: DetalleFactura = {
            id_factura_compra: facturaId,
            id_producto: detalle.producto,
            codigo_principal: detalle.codigo_principal,//ver
            descripcion: detalle.descripcion,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
            descuento: detalle.descuento,
            precio_total_sin_impuesto: detalle.precio_total_sin_impuesto,

            codigo: null,
            codigo_porcentaje: null,
            tarifa: detalle.tarifa,
            base_imponible: detalle.precio_total_sin_impuesto, // reutilizamos valor
            valor: detalle.valor,
            ice: detalle.ice,
            precio_total: detalle.precio_total,
          };
          detalles.push(nuevoDetalle);
        }
        console.log('DETALLES CON ID_factura')
        console.log(detalles)
        this.detalleFacturaService.createDetalleFacturaArray(detalles).subscribe(
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

  crearFacturaXML() {
    console.log('\n\n🟩 crearFacturaXML() {');
    this.formSubmitted = true; //OJO
    // Reiniciar el arreglo detallesXML
    //this.detallesXML = [];
    // Limpiar el formulario de detalles
    //this.detalleFacturaForm.reset();

    console.log("this.detallesXML: ", this.detallesXML);
    if (this.detallesXML.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No ha cargado un archivo XML.',
      });
      return;
    }

    // Una vez que los productos se han creado, procede a crear la factura
    const facturaData: FacturaXML = {
      id_proveedor: this.id_proveedor,
      id_forma_pago: this.id_forma_pago,
      id_asiento: 1,
      id_info_tributaria: 1,
      clave_acceso: this.claveAcceso,
      codigo: this.estab + "-" + this.ptoEmi + "-" + this.secuencial,
      fecha_emision: this.fechaEmision,
      fecha_vencimiento: this.fechaEmision,
      estado_pago: '',
      total_sin_impuesto: this.totalSinImpuestos,
      total_descuento: this.totalDescuento,
      valor: this.valor2,
      propina: this.propina,
      importe_total: this.importeTotal,
      abono: 0,
      //saldo: 0, // Valor válido
    };
    this.facturaService.createFactura(facturaData).subscribe(
      (res: any) => {
        const facturaId = res.id_factura_compra; // Obtener el ID del factura guardado
        console.log('< facturaID: ', facturaId)

        const productosObservables = this.crearProductos();

        forkJoin(productosObservables).subscribe((productosCreados: any[]) => {
          console.log('🟩 PRODUCTOS CREADOS: ', productosCreados);

          // Crear los detalles y asociarlos a la factura y productos
          const detallesXML = this.detallesXML.map((detalleXML, index) => {

            return {
              id_factura_compra: facturaId,
              id_producto: productosCreados[index].id_producto, // Aquí accedemos al primer producto en el array de productos creados
              codigo_principal: detalleXML.codigoPrincipal,//ver
              descripcion: detalleXML.descripcion,
              cantidad: detalleXML.cantidad,
              precio_unitario: detalleXML.precioUnitario,
              descuento: detalleXML.descuento,
              precio_total_sin_impuesto: detalleXML.precioTotalSinImpuesto,

              codigo: detalleXML.codigo,
              codigo_porcentaje: detalleXML.codigoPorcentaje,
              tarifa: detalleXML.tarifa,
              base_imponible: detalleXML.baseImponible,
              valor: detalleXML.valor,
              ice: null,
              precio_total: detalleXML.precioTotalSinImpuesto + detalleXML.valor,
            };

            //detallesXML.push(nuevoDetalle);
          });
          this.detalleFacturaService.createDetalleFacturaArray(detallesXML).subscribe(
            () => {
              Swal.fire({
                icon: 'success',
                title: 'Factura y detalles creados',
                text: 'El factura y los detalles se han creado correctamente.',
                showConfirmButton: false,
                timer: 1500
              });
              //this.recargarComponente();
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
        },
          (err) => {
            // Manejar errores
          }
        );
      },
      (err) => {
        // Manejar errores
      }
    );
  }

  crearProductos(): Observable<Producto[]>[] {
    const productosObservables: Observable<Producto[]>[] = this.detallesXML.map((detalleXML) => {
      const nuevoProducto: Producto = {
        id_producto: null,
        id_tipo_inventario: null,
        id_marca: null,
        id_clasificacion: null,
        id_unidad_medida: null,
        id_tarifa_iva: null,
        id_tarifa_ice: null,
        id_tipo_producto: null,
        id_lista_precio: null,
        codigo_principal: detalleXML.codigoPrincipal,
        descripcion: detalleXML.descripcion,
        stock: detalleXML.cantidad,
        stock_minimo: null,
        stock_maximo: null,
        utilidad: null,
        descuento: null,
        iva: null,
        ice: null,
        precio_compra: detalleXML.precioUnitario,
        precio_venta: null,
        ficha: null,
        nota: null,
        especificacion: null,
        fecha_registro: null,
        fecha_caducidad: null,
        fecha_modificacion: null,
        imagen_producto: null,
      };
      return this.productoService.createProducto(nuevoProducto);
    });

    return productosObservables;
  }


  obtenerDetalleFacturaFormulario() {
    // Obtener los valores del formulario de detalles
    const formValues = this.detalleFacturaForm.getRawValue();
    console.log('formValues -----------');
    console.log(formValues);

    // Obtener el número de detalles
    const numDetalles2 = Object.keys(formValues).filter(key => key.startsWith('producto_')).length;
    console.log('numDetalles 2 -----------');
    console.log(numDetalles2);

    // Reiniciar el arreglo detalleFacturaFormulario
    this.detalleFacturaFormulario = [];

    for (let i = 0; i < numDetalles2; i++) {
      const nuevoDetalle: DetalleFacturaFormulario = {
        producto: formValues[`producto_${i}`],
        cantidad: formValues[`cantidad_${i}`],
        codigo_principal: formValues[`codigo_principal_${i}`],
        descripcion: formValues[`descripcion_${i}`],
        precio_unitario: formValues[`precio_unitario_${i}`],
        descuento: formValues[`descuento_${i}`],
        precio_total_sin_impuesto: formValues[`precio_total_sin_impuesto_${i}`],
        //codigo: null,
        //codigo_porcentaje: null,
        tarifa: formValues[`tarifa_${i}`],
        //base_imponible: null, // estamos reutilizando información
        valor: formValues[`valor_${i}`],
        ice: formValues[`ice_${i}`],
        precio_total: formValues[`precio_total_${i}`],
      };
      this.detalleFacturaFormulario.push(nuevoDetalle);
    }
    // Limpiar el formulario de detalles
    //this.detalleFacturaForm.reset();
  }

  agregarDetalleFactura2(): void {
    if (this.detalleFacturaForm.invalid) {
      console.log('RETURN')
      return;
    }

    const nuevoDetalle: DetalleFacturaFormulario = {
      producto: null,
      codigo_principal: null,
      descripcion: null,
      cantidad: null,
      precio_unitario: null,
      descuento: null,
      precio_total_sin_impuesto: null,
      tarifa: null,
      valor: null,
      ice: null,
      precio_total: null,
    };

    // Crear instancias de FormControl para cada propiedad del detalle
    const productoControl = new FormControl(nuevoDetalle.producto);
    const codigoPrincipalControl = new FormControl(nuevoDetalle.codigo_principal);
    const descripcionControl = new FormControl(nuevoDetalle.descripcion);
    const cantidadControl = new FormControl(nuevoDetalle.cantidad);
    const precioUnitarioControl = new FormControl(nuevoDetalle.precio_unitario);
    const descuentoControl = new FormControl(nuevoDetalle.descuento);
    const precioTotalSinImpuestoControl = new FormControl(nuevoDetalle.precio_total_sin_impuesto);
    const tarifaControl = new FormControl(nuevoDetalle.tarifa);
    const valorControl = new FormControl(nuevoDetalle.valor);
    const iceControl = new FormControl(nuevoDetalle.ice);
    const precioTotalControl = new FormControl(nuevoDetalle.precio_total);

    // Agregar los controles al formulario
    this.detalleFacturaForm.addControl('producto_' + this.detalleFacturaFormulario.length, productoControl);
    this.detalleFacturaForm.addControl('codigo_principal_' + this.detalleFacturaFormulario.length, codigoPrincipalControl);
    this.detalleFacturaForm.addControl('descripcion_' + this.detalleFacturaFormulario.length, descripcionControl);
    this.detalleFacturaForm.addControl('cantidad_' + this.detalleFacturaFormulario.length, cantidadControl);
    this.detalleFacturaForm.addControl('precio_unitario_' + this.detalleFacturaFormulario.length, precioUnitarioControl);
    this.detalleFacturaForm.addControl('descuento_' + this.detalleFacturaFormulario.length, descuentoControl);
    this.detalleFacturaForm.addControl('precio_total_sin_impuesto_' + this.detalleFacturaFormulario.length, precioTotalSinImpuestoControl);
    this.detalleFacturaForm.addControl('tarifa_' + this.detalleFacturaFormulario.length, tarifaControl);
    this.detalleFacturaForm.addControl('valor_' + this.detalleFacturaFormulario.length, valorControl);
    this.detalleFacturaForm.addControl('ice_' + this.detalleFacturaFormulario.length, iceControl);
    this.detalleFacturaForm.addControl('precio_total_' + this.detalleFacturaFormulario.length, precioTotalControl);

    nuevoDetalle.producto = productoControl.value;
    nuevoDetalle.codigo_principal = codigoPrincipalControl.value;
    nuevoDetalle.descripcion = descripcionControl.value;
    nuevoDetalle.cantidad = cantidadControl.value;
    nuevoDetalle.precio_unitario = precioUnitarioControl.value;
    nuevoDetalle.descuento = descuentoControl.value;
    nuevoDetalle.precio_total_sin_impuesto = precioTotalSinImpuestoControl.value;// es igual a 
    nuevoDetalle.tarifa = tarifaControl.value;
    nuevoDetalle.valor = valorControl.value;
    nuevoDetalle.ice = iceControl.value;
    nuevoDetalle.precio_total = precioTotalControl.value;

    // Agregar el detalle al arreglo
    this.detalleFacturaFormulario.push(nuevoDetalle);
    console.log('Agregar detalle: ', this.detalleFacturaFormulario)
  }

  eliminarDetalle(index: number): void {
    this.detalleFacturaFormulario.splice(index, 1);
    // Calcular los totales
    //this.calcularTotales();
  }

  actualizarFactura() {
    console.log("Actualizar: actualizarFactura() { ")
    if (this.facturaFormU.invalid) {
      return;
    }
    const data = {
      ...this.facturaFormU.value,
      id_factura_compra: this.facturaSeleccionada.id_factura_compra
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
    console.log(factura.id_factura_compra)
    Swal.fire({
      title: '¿Borrar Factura?',
      text: `Estas a punto de borrar a ${factura.codigo}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.facturaService.deleteFactura(factura.id_factura_compra)
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
      return (this.facturas[this.facturas.length - 1].id_factura_compra) + 1;
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

  razonSocialProveedor: string;
  direccionProveedor: string;
  telefonoProveedor: string;
  emailProveedor: string;

  estadoPagoFactura: string;

  actualizarRazonSocial(event: any): void {
    const proveedorId = event.target.value;
    const proveedor = this.proveedores.find(p => p.id_proveedor == proveedorId);
    this.razonSocialProveedor = proveedor ? proveedor.razon_social : '';
  }

  actualizarDireccion(event: any): void {
    const proveedorId = event.target.value;
    const proveedor = this.proveedores.find(p => p.id_proveedor == proveedorId);
    this.direccionProveedor = proveedor ? proveedor.direccion : '';
  }

  actualizarTelefono(event: any): void {
    const proveedorId = event.target.value;
    const proveedor = this.proveedores.find(p => p.id_proveedor == proveedorId);
    this.telefonoProveedor = proveedor ? proveedor.telefono : '';
  }

  actualizarEmail(event: any): void {
    const proveedorId = event.target.value;
    const proveedor = this.proveedores.find(p => p.id_proveedor == proveedorId);
    this.emailProveedor = proveedor ? proveedor.email : '';
  }

  crearProveedorXML() {
    console.log("\n\n-> crearProveedorXML() {")

    this.identificacion = this.identificacionComprador
    this.razon_social = this.razonSocialComprador
    this.direccion = this.direccionComprador
    this.telefono = this.telefonoXML
    this.email = this.emailXML

    console.log('> this.identificacion', this.identificacion)
    console.log('> this.razon_social (Razón Social): ', this.razon_social)
    console.log('> this.nombre_comercial: ', this.nombre_comercial)
    console.log('> this.direccion: ', this.direccion)
    console.log('> this.telefono: ', this.telefono)
    console.log('> this.email: ', this.email)

    if (!this.identificacion || !this.razon_social) {
      Swal.fire('Error', 'Falta información requerida para crear el proveedor.', 'error');
      return;
    }

    // Crea un objeto con la información del proveedor
    const proveedorData = {
      identificacion: this.identificacion,
      razon_social: this.razon_social,
      nombre_comercial: this.nombre_comercial,
      direccion: this.direccion,
      telefono: this.telefono,
      email: this.email
    };

    // Realiza la solicitud POST para crear el proveedor
    console.log('--> Incio - Create Proveedor (service)');
    this.proveedorService.createProveedor(proveedorData).subscribe(
      (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Proveedor creado',
          text: 'Proveedor se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        console.log('--> Inicio - this.cargarProveedorByIdentificacion(this.identificacion)');
        this.cargarProveedorByIdentificacion(this.identificacion);
        console.log('--> Fin - this.cargarProveedorByIdentificacion(this.identificacion)');
        //this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al crear el proveedor.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    //this.recargarComponente();
    console.log('--> Fin - Create Proveedor (service)');
  }

  crearProveedor() {
    this.formSubmitted = true;
    console.log(this.proveedorForm.value)
    if (this.proveedorForm.invalid) {
      return;
    }
    // realizar posteo
    this.proveedorService.createProveedor(this.proveedorForm.value)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Proveedor creado',
          text: 'Proveedor se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        //this.nuevoProveedor = res;
        this.proveedorCreado.emit(res); // Emitir el evento proveedorCreado con el proveedor creado
        console.log('////////////// RES')
        console.log(res)

        this.nuevoProveedor = res;

        this.id_proveedor = this.nuevoProveedor.id_proveedor;
        this.razon_social = this.nuevoProveedor.razon_social;
        this.direccion = this.nuevoProveedor.direccion;
        this.telefono = this.nuevoProveedor.telefono;
        this.email = this.nuevoProveedor.email;

        console.log('ID PROVEEDOR')
        console.log(this.id_proveedor)
        console.log('RAZÓN SOCIAL')
        console.log(this.razon_social)
        console.log('DIRECCION')
        console.log(this.direccion)
        console.log('TELEFONO')
        console.log(this.telefono)
        console.log('EMAIL')
        console.log(this.email)

        //this.recargarComponente();
        this.agregarProveedor();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al crear el proveedor.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    //this.recargarComponente();
  }

  nuevoProveedor: any;
  id_proveedor: any;
  /* OJO ver si esta ingresadon correctamente por que fueron comentadas estas lienas
  razon_social: any;
  direccion: any;
  telefono: any;
  email: any;*/

  agregarProveedor() {
    // Seleccionar automáticamente el nuevo proveedor en el selector
    this.facturaForm.get('id_proveedor').setValue(this.id_proveedor);
    this.facturaForm.get('identificacion').setValue(this.identificacion);
    //this.facturaForm.get('identificacion').setValue(this.identificacionSeleccionada);
    this.facturaForm.get('razon_social').setValue(this.razon_social);
    this.facturaForm.get('direccion').setValue(this.direccion);
    this.facturaForm.get('telefono').setValue(this.telefono);
    this.facturaForm.get('email').setValue(this.email);
  }

  proveedoresFiltrados: any[] = [];

  filtrarProveedores3(event: any) {
    const identficacion = event.target.value.toLowerCase();
    console.log('A buscar')
    console.log(identficacion)
    this.proveedoresFiltrados = this.proveedores.filter(proveedor => proveedor.identificacion.toLowerCase().includes(identficacion));
    console.log('Encontrado')
    console.log(this.proveedoresFiltrados)
  }
  /*
    filtrarProveedores2(identficacionInput: any) {
      const identficacion = identficacionInput.target.value as string;
      console.log('A buscar')
      console.log(identficacion)
      this.proveedores = this.proveedores.filter(proveedor => proveedor.identificacion.includes(identficacion));
      console.log('Encontrado')
      console.log(this.proveedores)
    }*/

  proveedorSeleccionado: any;

  seleccionarProveedor3(proveedor: any) {
    // Aquí puedes realizar alguna acción adicional con el proveedor seleccionado
    console.log(proveedor);
    // También puedes asignar los valores a los campos correspondientes en el formulario
    this.facturaForm.patchValue({
      id_proveedor: proveedor.id_proveedor,
      identificacion: proveedor.identificacion,
      razon_social: proveedor.razon_social,
      direccion: proveedor.direccion,
      telefono: proveedor.telefono,
      email: proveedor.email
    });
  }

  identificacionSeleccionada: string;

  actualizarIdentificacion(identificacion: string) {
    this.identificacionSeleccionada = identificacion;
  }

  showProveedoresFiltrados: boolean = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    this.showProveedoresFiltrados = clickedInside;
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

  cargarDetalleFacturas(id_factura_compra: any) {
    this.detalleFacturaService.loadDetalleFacturaByFactura(id_factura_compra)
      .subscribe(({ detalle_facturas }) => {
        this.detalle_facturas = detalle_facturas;
      })
  }
  calcularAbono(id_factura_compra: any) {
    this.detalleFacturaService.loadDetalleFacturaByFactura(id_factura_compra)
      .subscribe(({ detalle_facturas }) => {
        this.detalle_facturas = detalle_facturas;
      })
  }


  cargarDetalleFacturas2(id_factura_compra: any) {
    this.detalleFacturaService.loadDetalleFacturaByFactura2(id_factura_compra)
      .subscribe(response => {
        this.detalle_facturas = response.detalle_facturas;
      });
  }


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
          this.detallesXML = data;
        });
      });
    }
  }

  parseXML(data: string): Promise<DetalleXML[]> {
    console.log("\n\n-> parseXML(data: string): Promise<DetalleXML[]> {")
    return new Promise(resolve => {
      var k: string | number,
        arr: DetalleXML[] = [],
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
        console.log("TEST 0");
        // infoTributaria
        const infoTributaria = factura.infoTributaria[0];
        this.ambiente = infoTributaria.ambiente[0];
        this.tipoEmision = infoTributaria.tipoEmision[0];
        this.razonSocial = infoTributaria.razonSocial[0];
        this.ruc = infoTributaria.ruc[0];
        this.claveAcceso = infoTributaria.claveAcceso[0];
        this.codDoc = infoTributaria.codDoc[0];
        this.estab = infoTributaria.estab[0];
        this.ptoEmi = infoTributaria.ptoEmi[0];
        this.secuencial = infoTributaria.secuencial[0];
        this.dirMatriz = infoTributaria.dirMatriz[0];
        if ('contribuyenteRimpe' in infoTributaria) {
          this.contribuyenteRimpe = infoTributaria.contribuyenteRimpe[0];
        } else {
          this.contribuyenteRimpe = null; // O establecerlo en null o un valor predeterminado
        }

        // infoFactura
        const infoFactura = factura.infoFactura[0];
        const fecha_aux = infoFactura.fechaEmision[0];
        this.fechaEmision = this.formatDate(fecha_aux);
        this.dirEstablecimiento = infoFactura.dirEstablecimiento[0];
        this.obligadoContabilidad = infoFactura.obligadoContabilidad[0];
        this.tipoIdentificacionComprador = infoFactura.tipoIdentificacionComprador[0];
        this.razonSocialComprador = infoFactura.razonSocialComprador[0];
        this.identificacionComprador = infoFactura.identificacionComprador[0];
        if ('direccionComprador' in infoFactura) {
          this.direccionComprador = infoFactura.direccionComprador[0];
        } else {
          this.direccionComprador = null; // O establecerlo en null o un valor predeterminado
        }
        this.totalSinImpuestos = parseFloat(infoFactura.totalSinImpuestos[0]);
        this.totalDescuento = parseFloat(infoFactura.totalDescuento[0]);

        // infoFactura/totalConImpuestos
        const totalConImpuestos = infoFactura.totalConImpuestos[0].totalImpuesto[0];
        if (totalConImpuestos.codigo[0] === '2' && totalConImpuestos.codigoPorcentaje[0] === '2') {
          this.codigo2 = totalConImpuestos.codigo[0];
          this.codigoPorcentaje2 = totalConImpuestos.codigoPorcentaje[0];
          this.baseImponible2 = parseFloat(totalConImpuestos.baseImponible[0]);
          this.valor2 = parseFloat(totalConImpuestos.valor[0]);
        }

        // infoFactura
        this.propina = parseFloat(infoFactura.propina[0]);
        this.importeTotal = parseFloat(infoFactura.importeTotal[0]);
        console.log("this.importeTotal--------------------", this.importeTotal)
        //this.importeTotal = parseFloat(result.factura.infoFactura[0].importeTotal[0]);
        this.ivaAux = this.importeTotal - this.totalSinImpuestos
        this.moneda = infoFactura.moneda[0];

        // infoFactura/pagos
        const pagos = result.factura.infoFactura[0].pagos[0].pago[0];
        this.formaPago = pagos.formaPago[0];
        this.total = parseFloat(pagos.total[0]);

        //this.plazo = parseInt(pagos.plazo[0]);
        if (result?.factura?.infoFactura?.pagos?.[0]?.pago?.[0]?.plazo) {
          this.plazo = parseInt(result.factura.infoFactura.pagos[0].pago[0].plazo[0]);
        } else {
          console.log("plazo no diponible");
          this.plazo = null; // O un valor predeterminado
        }
        //this.unidadTiempo = pagos.unidadTiempo[0];
        if (result?.factura?.infoFactura?.pagos?.[0]?.pago?.[0]?.unidadTiempo) {
          this.unidadTiempo = result.factura.infoFactura.pagos[0].pago[0].unidadTiempo[0];
        } else {
          console.log("unidadTiempo no diponible");
          this.unidadTiempo = null; // O un valor predeterminado
        }

        // reiniciar valores
        this.precioTotalSinImpuestoAux = 0.00;
        this.valorAux = 0.00;

        if (result && result.factura) {
          if (result.factura.detalles && result.factura.detalles[0] && result.factura.detalles[0].detalle) {
            var detalles = result.factura.detalles[0].detalle;
            for (k in detalles) {
              var item = detalles[k];
              arr.push({
                // detalles/detalle
                codigoPrincipal: item.codigoPrincipal[0],
                descripcion: item.descripcion[0],
                cantidad: parseFloat(item.cantidad[0]),
                precioUnitario: parseFloat(item.precioUnitario[0]),
                descuento: parseFloat(item.descuento[0]),
                precioTotalSinImpuesto: parseFloat(item.precioTotalSinImpuesto[0]),
                // detalles/detalle/impuestos
                codigo: item.impuestos[0].impuesto[0].codigo[0],
                codigoPorcentaje: item.impuestos[0].impuesto[0].codigoPorcentaje[0],
                tarifa: parseFloat(item.impuestos[0].impuesto[0].tarifa[0]),
                baseImponible: parseFloat(item.impuestos[0].impuesto[0].baseImponible[0]),
                valor: parseFloat(item.impuestos[0].impuesto[0].valor[0]),
              });
              // calculados con detalles
              this.precioTotalSinImpuestoAux += parseFloat(item.precioTotalSinImpuesto[0]);
              if (item.impuestos[0].impuesto[0].codigoPorcentaje[0] === '2') {
                this.valorAux += parseFloat(item.impuestos[0].impuesto[0].valor[0]);
              }

            }
          }
        }

        // infoAdicional
        const infoAdicional = result?.factura?.infoAdicional;
        if (infoAdicional && infoAdicional[0]?.campoAdicional) {
          for (const campo of infoAdicional[0].campoAdicional) {
            const nombre = campo.$.nombre;
            const valor = campo._;
            if (nombre === 'Telefono') {
              this.telefonoXML = valor
            } else if (nombre === 'Email') {
              this.emailXML = valor
            }
          }
        }

        this.detallesXML = arr; // Updated to assign to detallesXML
        console.log('this.detallesXML: ', this.detallesXML);
        resolve(arr);

        console.log('--> Inicio -  Cargar Proveedor');
        this.cargarProveedorByIdentificacion(this.identificacionComprador)
        console.log('--> Fin -  Cargar Proveedor');

        console.log('--> Incio - Cargar Forma Pago');
        this.cargarFormaPagoByCodigo(this.formaPago)
        console.log('--> Fin - Cargar Forma Pago');
      });
    });
  }

  formatDate(fechaAux: any): Date | null {
    // Dividir la fecha en partes (día, mes, año)
    const partesFecha = fechaAux.split('/');
    if (partesFecha.length === 3) {
      // Obtener las partes de la fecha
      const dia = partesFecha[0];
      const mes = partesFecha[1];
      const año = partesFecha[2];
      // Construir la nueva cadena de fecha en el formato "YYYY-MM-DD"
      const fechaFormateada = `${año}-${mes}-${dia}`;
      const fechaFormateadaAux = new Date(fechaFormateada);
      return fechaFormateadaAux;
    } else {
      console.log("Formato de fecha no válido");
      return null;
    }
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
                  this.detallesXML = data;
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


