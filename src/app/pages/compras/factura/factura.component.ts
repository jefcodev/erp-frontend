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
import { forkJoin, Observable } from 'rxjs';

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
  public facturaFormU: FormGroup;
  public facturaFormXML: FormGroup;
  public detalleFacturaForm: FormGroup;
  public proveedorForm: FormGroup;

  public proveedorSeleccionado2: Proveedor;

  public facturas: Factura[] = [];
  public detalleFactura: DetalleFactura;
  public detalleFacturaFormulario: DetalleFacturaFormulario[] = [];
  public facturaSeleccionada: Factura;
  public fechaActual: string;

  public codigo: string;
  public total_sin_impuesto: number;
  public total_descuento: number;
  public valor: number;
  public importe_total: number;
  public abono: number;
  public abonoU: number;
  public abonoXML: number;

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

  // Variables para actualizar totales del formulario
  public sumaTotalImpuesto: number = 0;
  public sumaTotalImpuestoCero: number = 0;
  public sumaTotalDescuento: number = 0;
  public sumaTotalSinImpuesto: number = 0;
  public sumaTotalICE: number = 0;
  public sumaTotalIVA: number = 0;
  public sumaPrecioTotal: number = 0;

  // XML
  title = 'Read XML';
  public detallesXML: DetalleXML[] = []; // Updated to use the DetalleXML interface
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
      total_sin_impuesto: [],
      total_descuento: [],
      valor: [],
      propina: [],
      importe_total: [],

      abono: [],
      saldo: ['0.00'],
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
      saldo: ['0.00'],
    });

    this.facturaFormXML = this.fb.group({

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
      saldo: ['0.00'],
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
    this.cargarTarifasIVA();
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
    this.proveedorService.loadProveedorByIdentificacion(identificacion)
      .subscribe(
        (proveedor) => {
          if (Array.isArray(proveedor) && proveedor.length > 0) {
            const { id_proveedor, identificacion, razon_social } = proveedor[0];
            this.id_proveedor = id_proveedor;
            this.identificacion = identificacion;
            this.razon_social = razon_social;
          } else {
            Swal.fire({
              title: 'Éxito 2',
              text: 'XML Cargado',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            })
              .then(() => {
                this.mostrarMensajeDeAdvertenciaConOpciones('Advertencia', 'Proveedor no encontrado ¿Desea crear un nuevo proveedor?');
              });
          }
        },
        (err) => {
          let errorMessage = 'Se produjo un error al cargar el proveedor.';
          if (err.error && err.error.msg) {
            errorMessage = err.error.msg;
          }
          Swal.fire('Error', err.error.msg, 'error');
        }
      );
  }

  mostrarMensajeDeError(title: string, text: string) {
    Swal.fire({
      icon: 'error' as SweetAlertIcon, // Puedes personalizar el ícono
      title,
      text,
    });
  }
  mostrarMensajeDeAdvertencia(title: string, text: string) {
    Swal.fire({
      icon: 'warning' as SweetAlertIcon, // Cambiado a 'warning' para mostrar una advertencia
      title,
      text,
    });
  }

  mostrarMensajeDeAdvertenciaConOpciones(title: string, text: string) {
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
    this.formaPagoService.loadFormaPagoByCodigo(codigo)
      .subscribe(
        (forma_pago) => {
          if (Array.isArray(forma_pago) && forma_pago.length > 0) {
            const { id_forma_pago, codigo, descripcion } = forma_pago[0];
            console.log("Se encontró forma de pago con codigo: " + codigo);
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
        },
        (err) => {
          let errorMessage = 'Se produjo un error al cargar forma de pago.';
          if (err.error && err.error.msg) {
            errorMessage = err.error.msg;
          }
          Swal.fire('Error', err.error.msg, 'error');
        }
      );
  }

  crearFormaPagoXML() {
    this.codigo_forma_pago = this.formaPago
    this.descripcion_forma_pago = "FORMA DE PAGO N " + this.formaPago + " (editar)"
    if (!this.codigo_forma_pago || !this.descripcion_forma_pago) {
      Swal.fire('Error', 'Falta información requerida para crear la forma de pago.', 'error');
      return;
    }

    // Crea un objeto con la información de forma pago
    const formaPagoData = {
      codigo: this.codigo_forma_pago,
      descripcion: this.descripcion_forma_pago,
    };

    this.formaPagoService.createFormaPago(formaPagoData).subscribe(
      (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Forma de Pago creado',
          text: 'Forma de Pago se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.cargarFormaPagoByCodigo(this.codigo_forma_pago);
        //this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        let errorMessage = 'Se produjo un error al crear Forma de Pago.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    //this.recargarComponente();
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

          const saldo = factura.saldo.toFixed(2);
          console.log("this.saldo");
          console.log(saldo);
          //this.saldo = parseFloat(saldo);

          this.saldoInicial = parseFloat(saldo);

          this.facturaSeleccionada = factura.factura[0];
          this.codigo = codigo;
          this.total_sin_impuesto = total_sin_impuesto;
          this.total_descuento = total_descuento;
          this.valor = valor;
          this.importe_total = importe_total;

          this.abonoU = abono;

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

  cargarTarifasIVA() {
    this.productoService.loadProductos()
      .subscribe(({ productos }) => {
        this.productos = productos;
      })
  }

  crearFactura() {
    console.log('\n\n🟩 crearFactura() {');
    this.formSubmitted = true;
    console.log("▶️ this.facturaForm.value:", this.facturaForm.value);
    if (this.facturaForm.invalid) {
      return;
    }

    // Obtener los detalles del formulario
    this.obtenerDetallesForm()

    this.facturaForm.get('total_sin_impuesto').setValue(this.sumaTotalSinImpuesto);
    this.facturaForm.get('total_descuento').setValue(this.sumaTotalDescuento);
    this.facturaForm.get('valor').setValue(this.sumaTotalIVA);
    this.facturaForm.get('importe_total').setValue(this.sumaPrecioTotal);

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
      abono: this.abonoXML,
      //saldo: 0, // Valor válido
    };
    this.facturaService.createFactura(facturaData).subscribe(
      (res: any) => {
        const facturaId = res.id_factura_compra; // Obtener el ID del factura guardado
        console.log('< facturaID: ', facturaId)

        const productosObservables = this.crearProductosXML();

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

              precio_total_sin_impuesto_mas_ice: null,

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

  crearProductosXML(): Observable<Producto[]>[] {
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
        tarifa: detalleXML.tarifa,
        ice: null,
        precio_compra: (detalleXML.precioTotalSinImpuesto + detalleXML.valor) / detalleXML.cantidad,
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

  obtenerDetallesForm() {
    const formValues = this.detalleFacturaForm.getRawValue();

    // Obtener el número de detalles
    const numDetalles2 = Object.keys(formValues).filter(key => key.startsWith('producto_')).length;

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
    //this.detalleFacturaForm.reset();
  }

  agregarDetalleForm(): void {
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
  }

  eliminarDetalleForm(index: number): void {
    this.detalleFacturaFormulario.splice(index, 1);
    // Volver a calcular los totales
    this.calcularPrecioTotalSinImpuestoConDescuento(index);
    this.calcularValor(index);
    this.actualizarTotalDescuento();
    this.actualizarTotalesPorTarifa();
    this.actualizarTotalSinImpuestos();
    this.actualizarTotalIVA();
    this.actualizarPrecioTotal();
    this.actualizarTotalICE();
    this.actualizarSaldo();
  }

  actualizarFactura() {
    if (this.facturaFormU.invalid) {
      return;
    }
    const data = {
      ...this.facturaFormU.value,
      id_factura_compra: this.facturaSeleccionada.id_factura_compra
    }

    this.facturaService.updateFactura(data)
      .subscribe(res => {
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
        let errorMessage = 'Se produjo un error al actualizar el factura.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  borrarFactura(factura: Factura) {
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
    this.identificacion = this.identificacionComprador
    this.razon_social = this.razonSocialComprador
    this.direccion = this.direccionComprador
    this.telefono = this.telefonoXML
    this.email = this.emailXML
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
    this.proveedorService.createProveedor(proveedorData).subscribe(
      (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Proveedor creado',
          text: 'Proveedor se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.cargarProveedorByIdentificacion(this.identificacion);
        //this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        let errorMessage = 'Se produjo un error al crear el proveedor.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    //this.recargarComponente();
  }

  crearProveedor() {
    this.formSubmitted = true;
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
        this.proveedorCreado.emit(res); // Emitir el evento proveedorCreado con el proveedor creado
        this.nuevoProveedor = res;
        this.id_proveedor = this.nuevoProveedor.id_proveedor;
        this.razon_social = this.nuevoProveedor.razon_social;
        this.direccion = this.nuevoProveedor.direccion;
        this.telefono = this.nuevoProveedor.telefono;
        this.email = this.nuevoProveedor.email;
        //this.recargarComponente();
        this.agregarProveedor();
        this.cerrarModal();
      }, (err) => {
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
    this.proveedoresFiltrados = this.proveedores.filter(proveedor => proveedor.identificacion.toLowerCase().includes(identficacion));
  }

  proveedorSeleccionado: any;

  seleccionarProveedor3(proveedor: any) {
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
    /*
        const fileInput = document.getElementById('fileInput');
        const customFileLabel = document.getElementById('custom-file-label');
        
        if (fileInput && customFileLabel) {
            const fileName = event.target.files[0].name;
            customFileLabel.textContent = `Archivo seleccionado: ${fileName}`;
        }
        */

    const selectedFile = event.target.files[0];
    const fileNameSpan = document.getElementById("selectedFileName");

    if (selectedFile) {
      fileNameSpan.textContent = selectedFile.name;
    } else {
      fileNameSpan.textContent = "Ninguno";
    }

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
  public productoSeleccionado: number;

  actualizarDescripcion(event: Event, indice: number) {
    // Haz un casting explícito del objetivo del evento a un elemento HTMLSelectElement
    const selectElement = event.target as HTMLSelectElement;
    // Obtiene el valor seleccionado del elemento <select>
    const productoId = parseInt(selectElement.value, 10);
    // Encuentra el producto seleccionado por su ID
    const productoSeleccionado = this.productos.find(producto => producto.id_producto === productoId);
    if (productoSeleccionado) {
      // Actualiza la descripción en el formulario del detalle de la factura
      this.detalleFacturaForm.controls[`descripcion_${indice}`].setValue(productoSeleccionado.descripcion);
    } else {
      // Si no se encuentra el producto, puedes limpiar la descripción o mostrar un mensaje de error.
      this.detalleFacturaForm.controls[`descripcion_${indice}`].setValue('');
      // También puedes mostrar un mensaje de error si lo deseas.
      // this.mostrarMensajeDeError('Producto no encontrado');
    }
  }

  actualizarCodigoPrincipal(event: Event, indice: number) {
    const selectElement = event.target as HTMLSelectElement;
    const productoId = parseInt(selectElement.value, 10);
    const productoSeleccionado = this.productos.find(producto => producto.id_producto === productoId);
    if (productoSeleccionado) {
      this.detalleFacturaForm.controls[`codigo_principal_${indice}`].setValue(productoSeleccionado.codigo_principal);
    } else {
      this.detalleFacturaForm.controls[`codigo_principal_${indice}`].setValue('');
    }
  }

  actualizarTarifa(event: Event, indice: number) {
    const selectElement = event.target as HTMLSelectElement;
    const productoId = parseInt(selectElement.value, 10);
    const productoSeleccionado = this.productos.find(producto => producto.id_producto === productoId);
    if (productoSeleccionado) {
      // Redondear el valor a número entero antes de establecerlo en el formulario
      const tarifaRedondeada = Math.round(productoSeleccionado.tarifa);
      this.detalleFacturaForm.controls[`tarifa_${indice}`].setValue(tarifaRedondeada);
    } else {
      this.detalleFacturaForm.controls[`tarifa_${indice}`].setValue('');
    }
  }

  calcularPrecioTotalSinImpuestoConDescuento(index: number): void {
    const cantidadControl = this.detalleFacturaForm.get(`cantidad_${index}`);
    const precioUnitarioControl = this.detalleFacturaForm.get(`precio_unitario_${index}`);
    const descuentoControl = this.detalleFacturaForm.get(`descuento_${index}`);
    const precioTotalSinImpuestoControl = this.detalleFacturaForm.get(`precio_total_sin_impuesto_${index}`);

    if (cantidadControl && precioUnitarioControl && descuentoControl && precioTotalSinImpuestoControl) {
      const cantidad = cantidadControl.value;
      const precioUnitario = precioUnitarioControl.value;
      const descuento = descuentoControl.value || 0; // Si no hay descuento, se considera 0.

      const precioTotalSinImpuesto = cantidad * precioUnitario - descuento;

      precioTotalSinImpuestoControl.setValue(precioTotalSinImpuesto);
    }
  }

  calcularValor(index: number): void {
    const tarifaControl = this.detalleFacturaForm.get(`tarifa_${index}`);
    const precioTotalSinImpuestoControl = this.detalleFacturaForm.get(`precio_total_sin_impuesto_${index}`);
    const valorControl = this.detalleFacturaForm.get(`valor_${index}`);

    if (tarifaControl && precioTotalSinImpuestoControl && valorControl) {
      const tarifa = tarifaControl.value || 0;
      const precioTotalSinImpuesto = precioTotalSinImpuestoControl.value || 0;

      const valor = (tarifa / 100) * precioTotalSinImpuesto;

      valorControl.setValue(valor);
    }
  }

  calcularPrecioTotal(index: number): void {
    const precioTotalSinImpuestoControl = this.detalleFacturaForm.get(`precio_total_sin_impuesto_${index}`);
    const tarifaControl = this.detalleFacturaForm.get(`tarifa_${index}`);
    const valorControl = this.detalleFacturaForm.get(`valor_${index}`);
    const iceControl = this.detalleFacturaForm.get(`ice_${index}`);
    const precioTotalControl = this.detalleFacturaForm.get(`precio_total_${index}`);

    if (precioTotalSinImpuestoControl && tarifaControl && valorControl && iceControl && precioTotalControl) {
      const precioTotalSinImpuesto = precioTotalSinImpuestoControl.value || 0;
      const tarifa = tarifaControl.value || 0;
      const valor = valorControl.value || 0;
      const ice = iceControl.value || 0;

      const iceImpuesto = (tarifa / 100) * ice;
      const precioTotal = (precioTotalSinImpuesto + valor) + (ice + iceImpuesto);

      precioTotalControl.setValue(precioTotal);
    }
  }

  actualizarTotalesPorTarifa(): void {
    this.sumaTotalImpuesto = 0;
    this.sumaTotalImpuestoCero = 0;

    for (let i = 0; i < this.detalleFacturaFormulario.length; i++) {
      const tarifaControl = this.detalleFacturaForm.get(`tarifa_${i}`);
      const precioTotalSinImpuestoControl = this.detalleFacturaForm.get(`precio_total_sin_impuesto_${i}`);
      const iceControl = this.detalleFacturaForm.get(`ice_${i}`);

      if (tarifaControl && precioTotalSinImpuestoControl && iceControl) {
        const tarifa = tarifaControl.value;
        const precioTotalSinImpuesto = precioTotalSinImpuestoControl.value || 0;
        const ice = iceControl.value || 0;

        if (tarifa === 12) {
          this.sumaTotalImpuesto += precioTotalSinImpuesto + ice;
        } else if (tarifa === 0) {
          this.sumaTotalImpuestoCero += precioTotalSinImpuesto + ice;
        }
      }
    }
  }

  actualizarTotalDescuento(): void {
    this.sumaTotalDescuento = 0;
    for (let i = 0; i < this.detalleFacturaFormulario.length; i++) {
      const descuentoControl = this.detalleFacturaForm.get(`descuento_${i}`);
      if (descuentoControl) {
        const descuento = descuentoControl.value || 0;
        this.sumaTotalDescuento += descuento;
      }
    }
  }

  actualizarTotalSinImpuestos(): void {
    this.sumaTotalSinImpuesto = 0;
    for (let i = 0; i < this.detalleFacturaFormulario.length; i++) {
      const precioTotalSinImpuestoControl = this.detalleFacturaForm.get(`precio_total_sin_impuesto_${i}`);
      if (precioTotalSinImpuestoControl) {
        const precioTotalSinImpuesto = precioTotalSinImpuestoControl.value || 0;
        this.sumaTotalSinImpuesto += precioTotalSinImpuesto;
      }
    }
  }

  actualizarTotalICE(): void {
    this.sumaTotalICE = 0;
    for (let i = 0; i < this.detalleFacturaFormulario.length; i++) {
      const iceControl = this.detalleFacturaForm.get(`ice_${i}`);
      if (iceControl) {
        const ice = iceControl.value || 0;
        this.sumaTotalICE += ice;
      }
    }
  }

  actualizarTotalIVA(): void {
    this.sumaTotalIVA = 0;
    for (let i = 0; i < this.detalleFacturaFormulario.length; i++) {
      const tarifaControl = this.detalleFacturaForm.get(`tarifa_${i}`);
      const valorControl = this.detalleFacturaForm.get(`valor_${i}`);

      if (tarifaControl && valorControl) {
        const tarifa = tarifaControl.value;
        const valor = valorControl.value || 0;

        if (tarifa === 12) {
          this.sumaTotalIVA += valor;
        }
      }
    }
  }

  actualizarPrecioTotal(): void {
    this.sumaPrecioTotal = 0;
    for (let i = 0; i < this.detalleFacturaFormulario.length; i++) {
      const precioTotalControl = this.detalleFacturaForm.get(`precio_total_${i}`);
      if (precioTotalControl) {
        const precioTotal = precioTotalControl.value || 0;
        this.sumaPrecioTotal += precioTotal;
      }
    }
  }

  actualizarSaldo(): void {
    this.abono = this.facturaForm.get('abono').value || 0; // Obtener el valor del abono, asegurándose de que sea un número
    const saldo = this.sumaPrecioTotal; // Obtener el saldo directamente
    if (this.abono > saldo) {
      // Si el abono es mayor que el saldo, establecer el abono como igual al saldo
      this.facturaForm.get('abono').setValue(saldo.toFixed(2));
    }
    const nuevoSaldo = saldo - this.abono; // Calcular el saldo restando el abono del importe total
    console.log("abono: ", this.abono);
    console.log("importe total: ", saldo);
    console.log("saldo: ", nuevoSaldo);
    this.facturaForm.get('saldo').setValue(nuevoSaldo.toFixed(2)); // Actualizar el campo "Saldo" en el formulario
  }

  //public saldo: number;

  public saldoInicial: number;

  actualizarSaldoU(): void {
    console.log("SALDO INICIAL", this.saldoInicial)
    this.abonoU = this.facturaFormU.get('abono').value || 0; // Obtener el valor del abono, asegurándose de que sea un número
    const nuevoSaldo = this.saldoInicial - this.abonoU; // Calcular el nuevo saldo restando el abono del saldo inicial
    console.log("2 abono: ", this.abonoU);
    console.log("2 saldo: ", nuevoSaldo);

    if (nuevoSaldo < 0) {
      // Si el nuevo saldo es negativo, establecer el abono como igual al saldo inicial
      this.facturaFormU.get('abono').setValue(this.saldoInicial.toFixed(2));
      this.facturaFormU.get('saldo').setValue("0.00");
    } else {
      this.facturaFormU.get('saldo').setValue(nuevoSaldo.toFixed(2));
    }
  }

  actualizarSaldoXML(): void {
    this.abonoXML = this.facturaFormXML.get('abono').value || 0; // Obtener el valor del abono, asegurándose de que sea un número
    const nuevoSaldo = this.importeTotal - this.abonoXML; // Calcular el saldo restando el abono del importe total
    console.log("2 abono: ", this.abonoXML);
    console.log("2 saldo: ", nuevoSaldo);

    if (nuevoSaldo < 0) {
      // Si el nuevo saldo es negativo, establecer el abono como igual al saldo
      this.facturaFormXML.get('abono').setValue(this.importeTotal.toFixed(2));
      this.facturaFormXML.get('saldo').setValue("0.00");
    } else {
      this.facturaFormXML.get('saldo').setValue(nuevoSaldo.toFixed(2));
    }
  }

  formatPorcentaje(decimalValue: number): string {
    // Multiplica por 100 y agrega el símbolo '%' al final
    return (decimalValue * 100).toFixed(0) + '%';
  }

}
