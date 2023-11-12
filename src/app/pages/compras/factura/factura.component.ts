import { Component, OnInit, ElementRef, ViewChild, HostListener, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SweetAlertIcon } from 'sweetalert2';
import { formatDate, DatePipe } from '@angular/common';
import { switchMap, concatMap } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

// XML
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as xml2js from 'xml2js';
import { forkJoin, Observable } from 'rxjs';

// Models
import { Proveedor } from '../../../models/compra/proveedor.model';
import { Producto } from '../../../models/inventario/producto.model';
import { FormaPago } from '../../../models/contabilidad/forma-pago.model';
import { Factura } from '../../../models/compra/factura.model';
import { DetalleFactura } from '../../../models/compra/detalle-factura.model';
import { Pago } from '../../../models/contabilidad/pago.model';

// Services
import { ProveedorService } from '../../../services/compra/proveedor.service';
import { ProductoService } from '../../../services/inventario/producto.service';
import { FormaPagoService } from '../../../services/contabilidad/forma-pago.service';
import { FacturaService } from '../../../services/compra/factura.service';
import { DetalleFacturaService } from '../../../services/compra/detalle-factura.service';
import { PagoService } from '../../../services/contabilidad/pago.service';

interface DetalleFacturaFormInterface {
  producto: number;
  codigo_principal: string;
  stock: number;
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

interface FacturaXMLInterface {
  id_proveedor: number;
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
  id_forma_pago: number;
  observacion: string;

  //razon_social: string;
  //ruc: string;
  //estab: string;
  //ptoEmi: string;
  //secuencial: string;
}

interface DetalleXMLInterface {
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

  public formSubmitted = false;
  public mostrarModal: boolean = true;
  public fechaActual: string;

  // Datos recuperados
  public proveedores: Proveedor[] = [];
  public formas_pago: FormaPago[] = [];
  public productos: Producto[] = [];
  public productosAll: Producto[] = [];
  public facturas: Factura[] = [];

  public pagos: Pago[] = [];

  // Modal Create Factura
  public facturaForm: FormGroup;
  public detalleFacturaFormInterface: DetalleFacturaFormInterface[] = [];
  // Variables para filtrar proveedores 
  proveedoresFiltrados: any[] = [];
  proveedorSeleccionado: any;
  identificacionSeleccionada: string;
  // Variables para actualizar sumas
  public sumaTotalImpuesto: number = 0;
  public sumaTotalImpuestoCero: number = 0;
  public sumaTotalDescuento: number = 0;
  public sumaTotalSinImpuesto: number = 0;
  public sumaTotalICE: number = 0;
  public sumaTotalIVA: number = 0;
  public sumaPrecioTotal: number = 0;

  // Modal Update Factura
  public facturaFormU: FormGroup;
  public facturaSeleccionada: Factura;
  public detalles_factura: DetalleFactura[] = [];
  public codigo: string;
  public fechaEmisionU: Date;
  public fechaVencimientoU: Date;
  public total_sin_impuesto: number;
  public total_descuento: number;
  public valor: number;
  public importe_total: number;
  public abono: number;
  public abonoU: number; // Abono recuperado
  public saldoInicial: number; // Saldo recuperado

  // Modal XML
  public facturaFormXML: FormGroup;
  public detalleFacturaForm: FormGroup;
  public abonoXML: number;

  // Modal Create Proveedor
  public proveedorForm: FormGroup;
  // Variables para cargar proveedor por identificación
  public identificacion: string;
  public razon_social: string;
  public nombre_comercial: string;
  public direccion: string;
  public telefono: string;
  public email: string;
  // Variables para crear proveedor
  public nuevoProveedor: any;
  public id_proveedor: any;
  //public razon_social: string; // Reutilizada 
  //public direccion: string; // Reutilizada
  //public telefono: string; // Reutilizada
  //public email: string; // Reutilizada

  // XML
  public detallesXMLInterface: DetalleXMLInterface[] = [];
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
  public dirEstablecimiento: string = '';
  public obligadoContabilidad: string = '';
  public tipoIdentificacionComprador: string = '';
  public razonSocialComprador: string = '';
  public identificacionComprador: string = '';
  public direccionComprador: string = '';
  public totalSinImpuestos: number = 0.00;
  public totalDescuento: number = 0.00;
  public ivaAux: number = 0.00;
  // infoFactura/totalConImpuestos
  public codigo2: string = '';
  public codigoPorcentaje2: string = '';
  public baseImponible2: number = 0.00;
  public valor2: number = 0.00;
  // infoFactura
  public propina: number = 0.00;
  public importeTotal: number = 0.00;
  public moneda: string = "";
  // infoFactura/pagos
  public formaPago: string = '';
  public total: number = 0;
  public plazo: number = 0;
  public unidadTiempo: string = '';
  // variables calculadas con detalles
  public precioTotalSinImpuestoAux: number = 0;
  public valorAux: number = 0;
  // infoAdicional
  public telefonoXML: string = "";
  public emailXML: string = "";

  // Paginación
  //public totalFacturas: number = 0; abajo
  public itemsPorPagina = 10;
  public paginaActual = 1;
  public paginas: number[] = [];
  public mostrarPaginacion: boolean = false;
  public maximoPaginasVisibles = 5;

  // Búsqueda y filtrado
  public buscarTexto: string = '';
  public allFacturas: Factura[] = [];
  public fechaInicio: string;
  public fechaFin: string;
  public estadoPagoSelect: string;

  public totalFacturas: number = 0;
  public totalFacturasPendientes: number = 0;
  public sumaSaldo: number = 0;
  public sumaImporteTotal: number = 0;

  public facturasAux: Factura[] = [];
  public totalFacturasAux: number = 0;
  public totalFacturasPendientesAux: number = 0;
  public sumaSaldoAux: number = 0;
  public sumaImporteTotalAux: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,

    // Services
    private proveedorService: ProveedorService,
    private pagoService: PagoService,
    private productoService: ProductoService,
    private formaPagoService: FormaPagoService,
    private facturaService: FacturaService,
    private detalleFacturaService: DetalleFacturaService,

    //XML
    private http: HttpClient,
    //private elementRef: ElementRef,

    // Filtrado de facturas
    private datePipe: DatePipe,

  ) {
    this.facturaForm = this.fb.group({

      id_factura_compra: [''],

      id_proveedor: ['', [Validators.required, Validators.minLength(0)]],
      identificacion: ['', [Validators.required, Validators.minLength(0)]],
      razon_social: ['', [Validators.required, Validators.minLength(0)]],
      direccion: ['', [Validators.required, Validators.minLength(0)]],
      telefono: [],
      email: [],

      id_asiento: ['1'],
      codigo: [''],
      fecha_emision: ['', Validators.required],
      fecha_vencimiento: ['', [Validators.required]],
      total_sin_impuesto: [],
      total_descuento: [],
      valor: [],
      propina: [],
      importe_total: [],
      
      id_forma_pago: [''],
      fecha_pago: [''],
      abono: [],
      observacion: [''],
      
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

      id_asiento: [''],
      codigo: [''],
      fecha_emision: [''],
      fecha_vencimiento: [''],
      estado_pago: [''],
      total_sin_impuesto: [''],
      total_descuento: [''],
      valor: [''],
      importe_total: [''],
      
      id_forma_pago: [''],
      fecha_pago: [''],
      abono: [''],
      observacion: [''],
      
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

      id_asiento: [''],
      clave_acceso: [''],
      codigo: [''],
      fecha_emision: [],
      fecha_vencimiento: [],
      estado_pago: [''],
      total_sin_impuesto: [''],
      total_descuento: [''],
      valor: [''],
      importe_total: [''],

      id_forma_pago: [''],
      fecha_pago: [''],
      abono: [''],
      observacion: [''],
      
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

    // Agregar validación personalizada para fecha de vencimiento
    this.facturaForm.get('fecha_vencimiento').setValidators((control) => {
      const fechaEmision = this.facturaForm.get('fecha_emision').value;
      const fechaVencimiento = control.value;
      if (fechaEmision && fechaVencimiento && fechaVencimiento < fechaEmision) {
        return { fechaInvalida: true };
      }
      return null;
    });

    // Agregar validación personalizada para fecha de vencimiento
    this.facturaFormXML.get('fecha_vencimiento').setValidators((control) => {
      //const fechaEmision = this.facturaFormXML.get('fecha_emision').value;
      const fechaEmision = this.datePipe.transform(this.fechaEmision, 'yyyy-MM-dd')
      const fechaVencimiento = control.value;
      console.log("Fecha Emision ", fechaEmision)
      console.log("Fecha Vencimiento ", fechaVencimiento)
      if (fechaEmision && fechaVencimiento && fechaVencimiento < fechaEmision) {
        return { fechaInvalida: true };
      }
      return null;
    });

    // Agregar validación personalizada para fecha de vencimiento
    this.facturaFormU.get('fecha_vencimiento').setValidators((control) => {
      const fechaEmision = this.facturaFormU.get('fecha_emision').value;
      const fechaVencimiento = control.value;
      console.log("Fecha Emision ", fechaEmision)
      console.log("Fecha Vencimiento ", fechaVencimiento)
      if (fechaEmision && fechaVencimiento && fechaVencimiento < fechaEmision) {
        return { fechaInvalida: true };
      }
      return null;
    });
  }

  /*
  ngOnInit(): void {
    this.cargarProveedoresAll();
    this.cargarFormasPago();
    this.cargarProductos();
    this.cargarProductosAll();
    this.cargarFacturasAll();
    this.cargarFacturas();
    const fechaActual = new Date();
    this.fechaActual = formatDate(fechaActual, 'd-M-yyyy', 'en-US', 'UTC-5');
  }*/

  
  async ngOnInit(): Promise<void> {
    this.cargarProveedoresAll();
    this.cargarFormasPago();
    this.cargarProductos();
    //this.cargarProductosAll();
    this.cargarFacturasAll();
    this.cargarFacturas();
    this.cargarProductosAll();  // Espera a que se carguen los productos

    const fechaActual = new Date();
    this.fechaActual = formatDate(fechaActual, 'd-M-yyyy', 'en-US', 'UTC-5');
  }
  


  // Método para cargar todos los proveedores 
  cargarProveedoresAll() {
    this.proveedorService.loadProveedoresAll()
      .subscribe(({ proveedores }) => {
        this.proveedores = proveedores;
      })
  }

  // Método para cargar todas las formas de pago
  cargarFormasPago() {
    this.formaPagoService.loadFormasPago()
      .subscribe(({ formas_pago }) => {
        this.formas_pago = formas_pago;
      })
  }

  // Método para cargar todos los productos
  cargarProductos() {
    this.productoService.loadProductos()
      .subscribe(({ productos }) => {
        this.productos = productos;
      })
  }

  // Método para cargar todos los productos
  cargarProductosAll() {
    this.productoService.loadProductosAll()
      .subscribe(({ productos }) => {
        console.log("ALL PRODUCT: ", productos)
        this.productosAll = productos;
      })
  }

  // Método para cargar los pagos
  cargarPagosByIdFactura(id_factura: any) {
    this.pagoService.loadPagosByIdFacturaCompra(id_factura)
      .subscribe(({ pagos }) => {
        this.pagos = pagos;
        console.log("this.pagos", this.pagos)
      })
  }

  // Método para cargar facturas paginadas en Table Data Factura
  cargarFacturas() {
    const desde = (this.paginaActual - 1) * this.itemsPorPagina;
    console.log("DESDE: ",desde)
    console.log("LIMIT", this.itemsPorPagina)
    this.facturaService.loadFacturas(desde, this.itemsPorPagina)
      .subscribe(({ facturas, totalFacturas }) => {
        this.facturas = facturas;
        this.totalFacturas = totalFacturas;
        this.calcularNumeroPaginas();
        this.mostrarPaginacion = this.totalFacturas > this.itemsPorPagina;
      });
  }

  // Método para cargar todas facturas en Table Data Factura
  cargarFacturasAll() {
    this.facturaService.loadFacturasAll()
      .subscribe(({ facturas, totalFacturas, totalFacturasPendientes, sumaSaldo, sumaImporteTotal }) => {
        this.allFacturas = facturas;
        this.totalFacturas = totalFacturas;
        this.totalFacturasPendientes = totalFacturasPendientes;
        this.sumaSaldo = sumaSaldo;
        this.sumaImporteTotal = sumaImporteTotal;
      });
  }

  // Método para borrar pago en Table Update Factura
  borrarPago(pago: Pago) {
    Swal.fire({
      title: '¿Borrar Pago?',
      text: `Estas a punto de borrar pago de $${pago.abono}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.pagoService.deletePago(pago.id_pago)
          .subscribe(resp => {
            //this.cargarPagosByIdFactura(this.id_factura);
            Swal.fire({
              icon: 'success',
              title: 'Pago borrado',
              text: `Pago de ${pago.abono} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
            this.cerrarModal();
            this.recargarComponente();
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar el pago.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
          );
      }
    });
  }

  // Método para borrar factura en Table Date Factura
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
            this.recargarComponente();
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

  // Método para filtrar facturas en Table Date Factura
  filtrarFacturas() {
    if (!this.facturasAux || this.facturasAux.length === 0) {
      // Inicializar las variables auxiliares una sola vez
      this.facturasAux = this.facturas;
      this.totalFacturasAux = this.totalFacturas;
      this.totalFacturasPendientesAux = this.totalFacturasPendientes;
      this.sumaImporteTotalAux = this.sumaImporteTotal;
      this.sumaSaldoAux = this.sumaSaldo;
    }
    if (this.buscarTexto.trim() === '' && !this.estadoPagoSelect && (!this.fechaInicio || !this.fechaFin)) {
      // Restablecemos las variables principales con las auxiliares
      this.facturas = this.facturasAux;
      this.totalFacturas = this.totalFacturasAux;
      this.totalFacturasPendientes = this.totalFacturasPendientesAux;
      this.sumaImporteTotal = this.sumaImporteTotalAux;
      this.sumaSaldo = this.sumaSaldoAux;
    } else {
      // Reiniciamos variables
      this.totalFacturas = 0;
      this.totalFacturasPendientes = 0;
      this.sumaImporteTotal = 0;
      this.sumaSaldo = 0;

      this.facturas = this.allFacturas.filter((factura) => {
        const regex = new RegExp(this.buscarTexto, 'i');
        const fechaEmision = this.datePipe.transform(new Date(factura.fecha_emision), 'yyyy-MM-dd');
        const proveedor = this.proveedores.find((prov) => prov.id_proveedor === factura.id_proveedor);

        const pasaFiltro = (
          (factura.codigo.match(regex) !== null ||
            proveedor.razon_social.match(regex) !== null ||
            proveedor.identificacion.includes(this.buscarTexto)) &&
          (!this.estadoPagoSelect || factura.estado_pago === this.estadoPagoSelect) &&
          (!this.fechaInicio || fechaEmision >= this.fechaInicio) &&
          (!this.fechaFin || fechaEmision <= this.fechaFin)
        );

        if (pasaFiltro) {
          this.sumaImporteTotal = this.sumaImporteTotal + parseFloat("" + factura.importe_total);
          if (factura.estado_pago === "PENDIENTE") {
            this.totalFacturasPendientes++
          }
          this.sumaSaldo = this.sumaSaldo + (parseFloat("" + factura.importe_total) - (factura.abono ? parseFloat("" + factura.abono) : 0));
          this.totalFacturas++;
        }
        return pasaFiltro;
      });
    }
  }

  // Método para borrar fecha fin en Table Date Factura
  borrarFechaFin() {
    this.fechaFin = null; // O establece el valor predeterminado deseado
    this.filtrarFacturas();
  }

  // Método para borrar fecha inicio en Table Date Factura
  borrarFechaInicio() {
    this.fechaInicio = null; // O establece el valor predeterminado deseado
    this.filtrarFacturas();
  }

  // Método para obtener total páginas en Table Date Factura
  get totalPaginas(): number {
    return Math.ceil(this.totalFacturas / this.itemsPorPagina);
  }

  // Método para calcular número de páginas en Table Date Factura
  calcularNumeroPaginas() {
    if (this.totalFacturas === 0 || this.itemsPorPagina <= 0) {
      this.paginas = [];
      return;
    }
    const totalPaginas = Math.ceil(this.totalFacturas / this.itemsPorPagina);
    const halfVisible = Math.floor(this.maximoPaginasVisibles / 2);
    let startPage = Math.max(1, this.paginaActual - halfVisible);
    let endPage = Math.min(totalPaginas, startPage + this.maximoPaginasVisibles - 1);
    if (endPage - startPage + 1 < this.maximoPaginasVisibles) {
      startPage = Math.max(1, endPage - this.maximoPaginasVisibles + 1);
    }
    this.paginas = Array(endPage - startPage + 1).fill(0).map((_, i) => startPage + i);
  }

  // Método para cambiar items en Table Date Factura
  changeItemsPorPagina() {
    this.cargarFacturas();
    this.paginaActual = 1;
  }

  // Método para cambiar página en Table Date Factura
  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.cargarFacturas();
    }
  }

  // Método para obtener mínimo en Table Date Factura
  getMinValue(): number {
    const minValue = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    return minValue;
  }

  // Método para obtener máximo en Table Date Factura
  getMaxValue(): number {
    const maxValue = this.paginaActual * this.itemsPorPagina;
    return maxValue;
  }

  // Método para crear factura en Modal Create Factura
  crearFactura() {
    this.formSubmitted = true;
    if (this.facturaForm.invalid) {
      console.log("Validar Formulario", this.facturaForm.value);
      return;
    }

    const id_forma_pago = this.facturaForm.get('id_forma_pago').value;
    const fecha_pago = this.facturaForm.get('fecha_pago').value;
    const abono = this.facturaForm.get('abono').value;
    const observacion = this.facturaForm.get('observacion').value;
    if (abono > 0) {
      if (!fecha_pago) {
        alert('Debes proporcionar una fecha de pago si el abono es mayor a cero.');
        return;
      }
      if (id_forma_pago === '') {
        alert('Debes seleccionar una forma de pago si el abono es mayor a cero.');
        return;
      }
      if (observacion.trim() === '') {
        alert('Debes proporcionar una observación si el abono es mayor a cero.');
        return;
      }
    }

    // Obtener los detalles del formulario
    this.obtenerDetallesForm()

    // Verificar si fecha_vencimiento no está definido y asignar null
    if (!this.facturaForm.get('fecha_vencimiento').value) {
      this.facturaForm.get('fecha_vencimiento').setValue(null);
    }
    
    this.facturaForm.get('total_sin_impuesto').setValue(this.sumaTotalSinImpuesto);
    this.facturaForm.get('total_descuento').setValue(this.sumaTotalDescuento);
    this.facturaForm.get('valor').setValue(this.sumaTotalIVA);
    this.facturaForm.get('importe_total').setValue(this.sumaPrecioTotal);

    this.facturaService.createFactura(this.facturaForm.value).subscribe(
      (res: any) => {
        const facturaId = res.id_factura_compra; // Obtener el ID del factura guardado
        console.log('facturaID: ', facturaId)

        // Crear los detalles y asociarlos a la factura
        const detalles = [];
        for (const detalle of this.detalleFacturaFormInterface) {
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
              title: 'Factura Creada',
              text: 'La factura se han creado correctamente.',
              showConfirmButton: false,
              timer: 1500
            });
            this.cargarProductosAll()
            this.cerrarModal();
            this.recargarComponente();
          },
          (err) => {
            let errorMessage = 'Se produjo un error al crear el factura..';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
        );
        //this.recargarComponente();
      },
      (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al crear la factura.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }

  // Método para crear proveedor en Modal Create Factura
  crearProveedor() {
    this.formSubmitted = true;
    if (this.proveedorForm.invalid) {
      return;
    }
    this.proveedorService.createProveedor(this.proveedorForm.value).subscribe(
      (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Proveedor creado',
          text: 'Proveedor se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.nuevoProveedor = res;
        this.id_proveedor = this.nuevoProveedor.id_proveedor;
        this.identificacion = this.nuevoProveedor.identificacion;
        this.razon_social = this.nuevoProveedor.razon_social;
        this.direccion = this.nuevoProveedor.direccion;
        this.telefono = this.nuevoProveedor.telefono;
        this.email = this.nuevoProveedor.email;
        // Una vez creado el proveedor llenamos(set) el formulario  
        this.agregarProveedor();
        this.cerrarModal();

      }, (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al crear el proveedor.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
    //this.recargarComponente();
  }

  // Método para agregar proveedor en Modal Create Factura
  agregarProveedor() {
    // Seleccionar automáticamente el nuevo proveedor en el selector
    this.facturaForm.get('id_proveedor').setValue(this.id_proveedor);
    this.facturaForm.get('identificacion').setValue(this.identificacion);
    this.facturaForm.get('razon_social').setValue(this.razon_social);
    this.facturaForm.get('direccion').setValue(this.direccion);
    this.facturaForm.get('telefono').setValue(this.telefono);
    this.facturaForm.get('email').setValue(this.email);
  }

  public mostrarListaProveedores: boolean = false;

  // Método para filtrar proveedores en Modal Create Factura
  filtrarProveedores(event: any) {
    const identficacion = event.target.value.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter(proveedor => proveedor.identificacion.toLowerCase().includes(identficacion));
    this.mostrarListaProveedores = this.proveedoresFiltrados.length > 0;
  }

  // Método para cerra lista de proveedores en Modal Create Factura
  @ViewChild('proveedoresLista', { read: ElementRef }) proveedoresLista: ElementRef;
  @HostListener('document:click', ['$event'])
  cerrarListaProveedores(event: Event): void {
    if (this.proveedoresLista && this.proveedoresLista.nativeElement && !this.proveedoresLista.nativeElement.contains(event.target)) {
      this.mostrarListaProveedores = false;
    }
  }

  // Método para convertir a mayúsculas en Modal Create Factura
  convertirAMayusculas(event: any) {
    const inputValue = event.target.value;
    const upperCaseValue = inputValue.toUpperCase();
    event.target.value = upperCaseValue;
  }

  // Método para seleccionar proveedor en Modal Create Factura
  seleccionarProveedor(proveedor: any) {
    // Actualizamos valores del formulario
    this.facturaForm.patchValue({
      id_proveedor: proveedor.id_proveedor,
      identificacion: proveedor.identificacion,
      razon_social: proveedor.razon_social,
      direccion: proveedor.direccion,
      telefono: proveedor.telefono,
      email: proveedor.email
    });
  }

  // Método para obtener detalles en Modal Create Factura
  obtenerDetallesForm() {
    const formValues = this.detalleFacturaForm.getRawValue();

    // Obtener el número de detalles
    const numDetalles2 = Object.keys(formValues).filter(key => key.startsWith('producto_')).length;

    // Reiniciar el arreglo detalleFacturaFormInterface
    this.detalleFacturaFormInterface = [];

    for (let i = 0; i < numDetalles2; i++) {
      const nuevoDetalle: DetalleFacturaFormInterface = {
        producto: formValues[`producto_${i}`],
        cantidad: formValues[`cantidad_${i}`],
        codigo_principal: formValues[`codigo_principal_${i}`],
        stock: formValues[`stock_${i}`],
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
      this.detalleFacturaFormInterface.push(nuevoDetalle);
    }
    //this.detalleFacturaForm.reset();
  }

  // Método agregar detalle en Modal Create Factura
  agregarDetalleForm(): void {
    if (this.detalleFacturaForm.invalid) {
      console.log('RETURN')
      return;
    }

    const nuevoDetalle: DetalleFacturaFormInterface = {
      producto: null,
      codigo_principal: null,
      stock: null,
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
    const stockControl = new FormControl(nuevoDetalle.stock);
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
    this.detalleFacturaForm.addControl('producto_' + this.detalleFacturaFormInterface.length, productoControl);
    this.detalleFacturaForm.addControl('codigo_principal_' + this.detalleFacturaFormInterface.length, codigoPrincipalControl);
    this.detalleFacturaForm.addControl('stock_' + this.detalleFacturaFormInterface.length, stockControl);
    this.detalleFacturaForm.addControl('descripcion_' + this.detalleFacturaFormInterface.length, descripcionControl);
    this.detalleFacturaForm.addControl('cantidad_' + this.detalleFacturaFormInterface.length, cantidadControl);
    this.detalleFacturaForm.addControl('precio_unitario_' + this.detalleFacturaFormInterface.length, precioUnitarioControl);
    this.detalleFacturaForm.addControl('descuento_' + this.detalleFacturaFormInterface.length, descuentoControl);
    this.detalleFacturaForm.addControl('precio_total_sin_impuesto_' + this.detalleFacturaFormInterface.length, precioTotalSinImpuestoControl);
    this.detalleFacturaForm.addControl('tarifa_' + this.detalleFacturaFormInterface.length, tarifaControl);
    this.detalleFacturaForm.addControl('valor_' + this.detalleFacturaFormInterface.length, valorControl);
    this.detalleFacturaForm.addControl('ice_' + this.detalleFacturaFormInterface.length, iceControl);
    this.detalleFacturaForm.addControl('precio_total_' + this.detalleFacturaFormInterface.length, precioTotalControl);

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
    this.detalleFacturaFormInterface.push(nuevoDetalle);
  }

  // Método para eliminar detalle en Modal Create Factura
  eliminarDetalleForm(index: number): void {
    this.detalleFacturaFormInterface.splice(index, 1);
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

  // Método para actualizar en Modal Create Factura
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

  // Método para actualizar en Modal Create Factura
  actualizarStock(event: Event, indice: number) {
    const selectElement = event.target as HTMLSelectElement;
    const productoId = parseInt(selectElement.value, 10);
    const productoSeleccionado = this.productos.find(producto => producto.id_producto === productoId);
    if (productoSeleccionado) {
      // Actualiza la descripción en el formulario del detalle de la factura
      this.detalleFacturaForm.controls[`stock_${indice}`].setValue(productoSeleccionado.stock);
    } else {
      this.detalleFacturaForm.controls[`stock_${indice}`].setValue('');
    }
  }

  // Método para actualizar en Modal Create Factura
  actualizarDescripcion(event: Event, indice: number) {
    const selectElement = event.target as HTMLSelectElement;
    const productoId = parseInt(selectElement.value, 10);
    const productoSeleccionado = this.productos.find(producto => producto.id_producto === productoId);
    if (productoSeleccionado) {
      // Actualiza la descripción en el formulario del detalle de la factura
      this.detalleFacturaForm.controls[`descripcion_${indice}`].setValue(productoSeleccionado.descripcion);
    } else {
      this.detalleFacturaForm.controls[`descripcion_${indice}`].setValue('');
    }
  }

  // Método para actualizar en Modal Create Factura
  actualizarTarifa(event: Event, indice: number) {
    const selectElement = event.target as HTMLSelectElement;
    const productoId = parseInt(selectElement.value, 10);
    const productoSeleccionado = this.productos.find(producto => producto.id_producto === productoId);
    if (productoSeleccionado) {
      const tarifaRedondeada = Math.round(productoSeleccionado.tarifa);
      this.detalleFacturaForm.controls[`tarifa_${indice}`].setValue(tarifaRedondeada);
    } else {
      this.detalleFacturaForm.controls[`tarifa_${indice}`].setValue('');
    }
  }

  // Método para calcular en Modal Create Factura
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

  // Método para calcular en Modal Create Factura
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

  // Método para calcular en Modal Create Factura
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

  // Método para actualizar en Modal Create Factura
  actualizarTotalesPorTarifa(): void {
    this.sumaTotalImpuesto = 0;
    this.sumaTotalImpuestoCero = 0;
    for (let i = 0; i < this.detalleFacturaFormInterface.length; i++) {
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

  // Método para actualizar en Modal Create Factura
  actualizarTotalDescuento(): void {
    this.sumaTotalDescuento = 0;
    for (let i = 0; i < this.detalleFacturaFormInterface.length; i++) {
      const descuentoControl = this.detalleFacturaForm.get(`descuento_${i}`);
      if (descuentoControl) {
        const descuento = descuentoControl.value || 0;
        this.sumaTotalDescuento += descuento;
      }
    }
  }

  // Método para actualizar en Modal Create Factura
  actualizarTotalSinImpuestos(): void {
    this.sumaTotalSinImpuesto = 0;
    for (let i = 0; i < this.detalleFacturaFormInterface.length; i++) {
      const precioTotalSinImpuestoControl = this.detalleFacturaForm.get(`precio_total_sin_impuesto_${i}`);
      if (precioTotalSinImpuestoControl) {
        const precioTotalSinImpuesto = precioTotalSinImpuestoControl.value || 0;
        this.sumaTotalSinImpuesto += precioTotalSinImpuesto;
      }
    }
  }

  // Método para actualizar en Modal Create Factura
  actualizarTotalICE(): void {
    this.sumaTotalICE = 0;
    for (let i = 0; i < this.detalleFacturaFormInterface.length; i++) {
      const iceControl = this.detalleFacturaForm.get(`ice_${i}`);
      if (iceControl) {
        const ice = iceControl.value || 0;
        this.sumaTotalICE += ice;
      }
    }
  }

  // Método para actualizar en Modal Create Factura
  actualizarTotalIVA(): void {
    this.sumaTotalIVA = 0;
    for (let i = 0; i < this.detalleFacturaFormInterface.length; i++) {
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

  // Método para actualizar en Modal Create Factura
  actualizarPrecioTotal(): void {
    this.sumaPrecioTotal = 0;
    for (let i = 0; i < this.detalleFacturaFormInterface.length; i++) {
      const precioTotalControl = this.detalleFacturaForm.get(`precio_total_${i}`);
      if (precioTotalControl) {
        const precioTotal = precioTotalControl.value || 0;
        this.sumaPrecioTotal += precioTotal;
      }
    }
  }

  // Método para actualizar en Modal Create Factura
  actualizarSaldo(): void {
    this.abono = this.facturaForm.get('abono').value || 0;
    const nuevoSaldo = Math.max(this.sumaPrecioTotal - this.abono, 0);
    console.log("entra")
    if (nuevoSaldo === 0) {
      this.abono = this.sumaPrecioTotal;
      this.facturaForm.get('abono').setValue(this.abono.toFixed(2));
      this.facturaForm.get('saldo').setValue("0.00"); // Actualizar el campo "Saldo" en el formulario
    } else {
      this.facturaForm.get('saldo').setValue(nuevoSaldo.toFixed(2));
    }
  }

  // Método para actualizar factura en Modal Update Factura
  actualizarFactura() {
    this.formSubmitted = true;
    if (this.facturaFormU.invalid) {
      console.log("Validar Formulario", this.facturaForm.value);
      return;
    }

    const id_forma_pago = this.facturaFormU.get('id_forma_pago').value;
    const fecha_pago = this.facturaFormU.get('fecha_pago').value;
    const abono = this.facturaFormU.get('abono').value;
    const observacion = this.facturaFormU.get('observacion').value;
    if (abono > 0) {
      if (!fecha_pago) {
        alert('Debes proporcionar una fecha de pago si el abono es mayor a cero.');
        return;
      }
      if (id_forma_pago === '') {
        alert('Debes seleccionar una forma de pago si el abono es mayor a cero.');
        return;
      }
      if (observacion.trim() === '') {
        alert('Debes proporcionar una observación si el abono es mayor a cero.');
        return;
      }
    }

    const data = {
      ...this.facturaFormU.value,
      id_factura_compra: this.facturaSeleccionada.id_factura_compra,
    }

    this.facturaService.updateFactura(data)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Factura actualizada',
          text: 'Factura se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al actualizar la factura.';
        Swal.fire('Error', errorMessage, 'error');
      });
  }

  // Método para cargar factura por id en Modal Update Factura
  cargarFacturaPorId(id_factura_compra: any) {
    // Limpia los datos anteriores antes de cargar una nueva factura
    //this.facturas = null;
    this.pagos = [];
    console.log('jajjaja', this.saldoInicial)
    this.facturaService.loadFacturaById(id_factura_compra)
      .pipe(
        switchMap((factura: any) => {
          const { id_proveedor, id_asiento, codigo, fecha_emision, fecha_vencimiento, estado_pago,
            total_sin_impuesto, total_descuento, valor, importe_total, abono } = factura.factura[0];
          this.facturaSeleccionada = factura.factura[0];
          this.codigo = codigo;
          this.fechaEmisionU = fecha_emision; // Así mantenemos la fecha original
          this.fechaVencimientoU = fecha_vencimiento
          this.total_sin_impuesto = total_sin_impuesto;
          this.total_descuento = total_descuento;
          this.valor = valor;
          this.importe_total = importe_total;

          const saldo = factura.saldo.toFixed(2);
          this.saldoInicial = parseFloat(saldo); // Saldo recuperado

          this.abonoU = abono; // Abono recuperado

          const id_forma_pago = ""; // Precargar un id_forma_pago en html
          const fecha_pago = null;
          const observacion = "";

          return this.cargarProveedorPorId(id_proveedor).pipe(
            concatMap(proveedor => {
              const { identificacion, razon_social, nombre_comercial, direccion, telefono, email } = proveedor[0];
              this.proveedorSeleccionado = proveedor[0];
              this.identificacion = identificacion;
              this.razon_social = razon_social;
              this.direccion = direccion;
              this.telefono = telefono;
              this.email = email;
              const abono = "0.00"; // Precargar abono en html
              return of({
                identificacion, razon_social, direccion, telefono, email,
                id_asiento, codigo, fecha_emision, fecha_vencimiento, estado_pago, total_sin_impuesto, total_descuento, valor, importe_total, abono, saldo,
                id_forma_pago, fecha_pago, observacion,
              });
            })
          );
        })
      )
      .subscribe(data => {
        this.facturaFormU.setValue(data);
        this.facturaFormU.get('fecha_emision').setValue(this.datePipe.transform(this.fechaEmisionU, 'yyyy-MM-dd'));
      });
  }

  // Método para cargar proveedor por id en Modal Update Factura
  cargarProveedorPorId(id_proveedor: any) {
    this.facturaFormU.get('fecha_emision').setValue(this.datePipe.transform(this.fechaEmisionU, 'dd/MM/yyyy'));
    return this.proveedorService.loadProveedorById(id_proveedor);
  }

  // Método para formatear fecha en Modal Update Factura
  /*getFormattedFechaEmision(): string {
    const fechaEmision = this.facturaFormU.get('fecha_emision')?.value;
    if (fechaEmision) {
      const fecha = new Date(fechaEmision);
      return fecha.toISOString().split('T')[0];
    }
    return '';
  }
  */

  // Método para formatear fecha en Modal Update Factura
  getFormattedFechaVencimiento(): string {
    const fechaVencimiento = this.facturaFormU.get('fecha_vencimiento')?.value;
    if (fechaVencimiento) {
      const fecha = new Date(fechaVencimiento);
      return fecha.toISOString().split('T')[0];
    }
    return '';
  }

  // Método para formatear fecha en Modal Update Factura
  getFormattedFechaVencimientoU(): string {
    const fechaVencimiento = this.facturaFormU.get('fecha_vencimiento')?.value;
    if (fechaVencimiento) {
      const fecha = new Date(fechaVencimiento);
      return fecha.toISOString().split('T')[0];
    }
    return '';
  }

  // Método para formatear fecha en Modal Update Factura
  getFormattedFechaEmisionXML(): string {
    const fechaEmision = this.facturaFormXML.get('fecha_emision')?.value;
    if (fechaEmision) {
      const fecha = new Date(fechaEmision);
      return fecha.toISOString().split('T')[0];
    }
    return '';
  }

  // Método para cargar detalles factura por id factura en Modal Update Factura
  cargarDetallesFacturaByIdFactura(id_factura_compra: any) {
    this.detalleFacturaService.loadDetallesFacturaByIdFactura(id_factura_compra)
      .subscribe(({ detalles_factura }) => {
        this.detalles_factura = detalles_factura;
      })
  }

  // Método para actualizar saldo en Modal Update Factura
  actualizarSaldoU(): void {
    this.abonoU = this.facturaFormU.get('abono').value || 0;
    const nuevoSaldo = Math.max(this.saldoInicial - this.abonoU, 0);
    if (nuevoSaldo === 0) {
      this.abonoU = this.saldoInicial;
      this.facturaFormU.get('abono').setValue(this.abonoU.toFixed(2));
      this.facturaFormU.get('saldo').setValue("0.00");
    } else {
      this.facturaFormU.get('saldo').setValue(nuevoSaldo.toFixed(2));
    }
  }

  // Método para crear factura en Modal XML
  crearFacturaXML() {
    // Reiniciar el arreglo detallesXMLInterface
    //this.detallesXMLInterface = [];
    // Limpiar el formulario de detalles
    //this.detalleFacturaForm.reset();
    if (this.detallesXMLInterface.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No ha cargado un archivo XML.',
      });
      return;
    }

    this.formSubmitted = true;
    if (this.facturaFormU.invalid) {
      // Aquí se valida los campos que están validando en "Input Validation"
      console.log("Validar Formulario", this.facturaForm.value);
      return;
    }

    const id_forma_pago = this.facturaForm.get('id_forma_pago').value;
    const fecha_pago = this.facturaForm.get('fecha_pago').value;
    const abono = this.facturaForm.get('abono').value;
    const observacion = this.facturaForm.get('observacion').value;
    if (abono > 0) {
      if (!fecha_pago) {
        alert('Debes proporcionar una fecha de pago si el abono es mayor a cero.');
        return;
      }
      if (id_forma_pago === '') {
        alert('Debes seleccionar una forma de pago si el abono es mayor a cero.');
        return;
      }
      if (observacion.trim() === '') {
        alert('Debes proporcionar una observación si el abono es mayor a cero.');
        return;
      }
    }

    // Una vez que los productos se han creado, procede a crear la factura
    const facturaData: FacturaXMLInterface = {
      id_proveedor: this.id_proveedor,
      //id_forma_pago: this.id_forma_pago, con esto cargamos la forma de pago del XML
      id_forma_pago: this.facturaFormXML.get("id_forma_pago").value,
      id_asiento: 1,
      id_info_tributaria: 1,
      clave_acceso: this.claveAcceso,
      codigo: this.estab + "-" + this.ptoEmi + "-" + this.secuencial,
      fecha_emision: this.fechaEmision,
      fecha_vencimiento: this.facturaFormXML.get("fecha_vencimiento").value,
      estado_pago: '',
      total_sin_impuesto: this.totalSinImpuestos,
      total_descuento: this.totalDescuento,
      valor: this.valor2,
      propina: this.propina,
      importe_total: this.importeTotal,

      abono: this.abonoXML,
      //saldo: 0, // Valor válido
      observacion: this.facturaFormXML.get("observacion").value,
    };
    console.log("Data: ", facturaData)
    this.facturaService.createFactura(facturaData).subscribe(
      (res: any) => {
        const facturaId = res.id_factura_compra; // Obtener el ID del factura guardado
        const productosObservables = this.crearProductosXML();
        forkJoin(productosObservables).subscribe((productosCreados: any[]) => {
          // Crear los detalles y asociarlos a la factura y productos
          const detallesXMLInterface = this.detallesXMLInterface.map((detalleXML, index) => {
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
            //detallesXMLInterface.push(nuevoDetalle);
          });
          this.detalleFacturaService.createDetalleFacturaArray(detallesXMLInterface).subscribe(
            () => {
              Swal.fire({
                icon: 'success',
                title: 'Factura creada',
                text: 'La factura se han creado correctamente.',
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

  // Método para cargar xml en Modal XML
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
          this.detallesXMLInterface = data;
        });
      });
    }
  }

  // Método para parsear xml en Modal XML
  parseXML(data: string): Promise<DetalleXMLInterface[]> {
    return new Promise(resolve => {
      var k: string | number,
        arr: DetalleXMLInterface[] = [],
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
        console.log("this.identificacionComprador: ", this.identificacionComprador)
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
        this.detallesXMLInterface = arr; // Updated to assign to detallesXMLInterface
        resolve(arr);
        this.cargarProveedorByIdentificacion(this.ruc)
      });
    });
  }

  // Método para crear proveedor en Modal XML
  crearProveedorXML() {
    this.identificacion = this.ruc
    this.razon_social = this.razonSocial
    this.nombre_comercial = null
    this.direccion = this.dirEstablecimiento
    this.telefono = "0"
    this.email = "provedor@example.com"
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
    console.log('proveedorData: ', proveedorData)
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
        //this.cerrarModal();
      }, (err) => {
        let errorMessage = 'Se produjo un error al crear el proveedor.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    //this.recargarComponente();
  }

  // Método para cargar proveedor por identificación en Modal XML
  cargarProveedorByIdentificacion(identificacion: string) {
    this.proveedorService.loadProveedorByIdentificacion(identificacion)
      .subscribe(
        (proveedor) => {
          if (Array.isArray(proveedor) && proveedor.length > 0) {
            const { id_proveedor, identificacion, razon_social } = proveedor[0];
            this.id_proveedor = id_proveedor;
            this.identificacion = identificacion;
            this.razon_social = razon_social;
            console.log("this.identificacion 3: ", this.identificacion)

          } else {
            Swal.fire({
              title: 'Éxito 2',
              text: 'XML Cargado',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            })
              .then(() => {
                console.log("this.identificacion 4: ", this.identificacion)
                this.mostrarMensajeDeAdvertenciaConOpciones('Advertencia', 'Proveedor no encontrado. ¿Desea crear un nuevo proveedor?');
              });
          }
        }, (err) => {
          let errorMessage = 'Se produjo un error al cargar el proveedor.';
          if (err.error && err.error.msg) {
            errorMessage = err.error.msg;
          }
          Swal.fire('Error', err.error.msg, 'error');
        }
      );
  }

  // Método para mostrar adevertencia en Modal XML
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

  // Método para crear productos en Modal XML
  crearProductosXML(): Observable<Producto[]>[] {
    const productosObservables: Observable<Producto[]>[] = this.detallesXMLInterface.map((detalleXML) => {
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

  // Método para formatear fecha en Modal XML
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

  // Método para cargar la data en Modal XML
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
                  this.detallesXMLInterface = data;
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

  // Método para mostrar mensaje de error en Modal XML
  mostrarMensajeDeError(title: string, text: string) {
    Swal.fire({
      icon: 'error' as SweetAlertIcon, // Puedes personalizar el ícono
      title,
      text,
    });
  }

  // Método para subir un xml al servidor en Modal XML
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

  // Método para actualizar saldo en Modal XML
  actualizarSaldoXML(): void {
    this.abonoXML = this.facturaFormXML.get('abono').value || 0;
    const nuevoSaldo = Math.max(this.importeTotal - this.abonoXML, 0);
    if (nuevoSaldo === 0) {
      this.abonoXML = this.importeTotal;
      this.facturaFormXML.get('abono').setValue(this.abonoXML.toFixed(2));
      this.facturaFormXML.get('saldo').setValue("0.00");
    } else {
      this.facturaFormXML.get('saldo').setValue(nuevoSaldo.toFixed(2));
    }
  }

  // Método para validar las entradas en formularios
  campoNoValido(campo: string, form: FormGroup): boolean {
    if (form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }
  // Método para recargar componente
  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/facturas']);
    });
  }

  // Método para cerrar modal
  cerrarModal() {
    this.mostrarModal = true;
    const body = document.querySelector('body');
    if (body) {
      body.classList.remove('modal-open');
    }
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
      this.renderer.removeChild(document.body, modalBackdrop);
    }
  }

}
