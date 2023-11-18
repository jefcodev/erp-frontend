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
import { TipoComprobante } from '../../../models/contabilidad/tipo-comprobante.model';
import { Cliente } from '../../../models/venta/cliente.model';
import { Venta } from '../../../models/venta/venta.model';
import { FormaPago } from '../../../models/contabilidad/forma-pago.model';
import { Producto } from '../../../models/inventario/producto.model';
import { DetalleVenta } from '../../../models/venta/detalle-venta.model';
import { Pago } from '../../../models/contabilidad/pago.model';

// Services
import { TipoComprobanteService } from '../../../services/contabilidad/tipo-comprobante.service';
import { ClienteService } from '../../../services/venta/cliente.service';
import { VentaService } from '../../../services/venta/venta.service';
import { DetalleVentaService } from '../../../services/venta/detalle-venta.service';
import { ProductoService } from '../../../services/inventario/producto.service';
import { FormaPagoService } from '../../../services/contabilidad/forma-pago.service';
import { PagoService } from '../../../services/contabilidad/pago.service';

interface DetalleVentaFormInterface {
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

interface VentaXMLInterface {
  id_tipo_comprobante: number;
  id_cliente: number;
  //id_asiento: number;
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
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styles: [
  ]
})

export class VentaComponent implements OnInit {

  public formSubmitted = false;
  public mostrarModal: boolean = true;
  public fechaActual: string;

  public id_tipo_comprobante: number | null = null;

  // Datos recuperados
  public tipos_comprobantes: TipoComprobante[] = [];
  public clientes: Cliente[] = [];
  public formas_pago: FormaPago[] = [];
  public productos: Producto[] = [];
  public productosAll: Producto[] = [];
  public ventas: Venta[] = [];

  public pagos: Pago[] = [];

  // Modal Create Venta
  public ventaForm: FormGroup;
  public detalleVentaFormInterface: DetalleVentaFormInterface[] = [];
  // Variables para filtrar clientes 
  clientesFiltrados: any[] = [];
  clienteSeleccionado: any;
  identificacionSeleccionada: string;
  // Variables para actualizar sumas
  public sumaTotalImpuesto: number = 0;
  public sumaTotalImpuestoCero: number = 0;
  public sumaTotalDescuento: number = 0;
  public sumaTotalSinImpuesto: number = 0;
  public sumaTotalICE: number = 0;
  public sumaTotalIVA: number = 0;
  public sumaPrecioTotal: number = 0;

  // Modal Update Venta
  public ventaFormU: FormGroup;
  public ventaSeleccionada: Venta;
  public detalles_venta: DetalleVenta[] = [];
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
  public estado: number; // Estado recuperado

  // Modal XML
  public ventaFormXML: FormGroup;
  public detalleVentaForm: FormGroup;
  public abonoXML: number;

  // Modal Create Cliente
  public clienteForm: FormGroup;
  // Variables para cargar cliente por identificación
  public identificacion: string;
  public razon_social: string;
  //public nombre_comercial: string;
  public direccion: string;
  public telefono: string;
  public email: string;
  // Variables para crear cliente
  public nuevoCliente: any;
  public id_cliente: any;
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
  // infoVenta
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
  // infoVenta/totalConImpuestos
  public codigo2: string = '';
  public codigoPorcentaje2: string = '';
  public baseImponible2: number = 0.00;
  public valor2: number = 0.00;
  // infoVenta
  public propina: number = 0.00;
  public importeTotal: number = 0.00;
  public moneda: string = "";
  // infoVenta/pagos
  public formaPago: string = '';
  public total: number = 0;
  public plazo: number = 0;
  public unidadTiempo: string = '';
  // variables calculadas con detalles
  public precioTotalSinImpuestoAux: number = 0;
  public valorAux: number = 0;
  // infoAdicional
  public telefonoComprador: string = "";
  public emailComprador: string = "";

  // Paginación
  //public totalVentas: number = 0; abajo
  public itemsPorPagina = 10;
  public paginaActual = 1;
  public paginas: number[] = [];
  public mostrarPaginacion: boolean = false;
  public maximoPaginasVisibles = 5;

  // Búsqueda y filtrado
  public buscarTexto: string = '';
  public allVentas: Venta[] = [];
  public fechaInicio: string;
  public fechaFin: string;
  public estadoPagoSelect: string;
  public tipoComprobanteSelect: string;

  public totalVentas: number = 0;
  public totalVentasPendientes: number = 0;
  public sumaSaldo: number = 0;
  public sumaImporteTotal: number = 0;

  public ventasAux: Venta[] = [];
  public totalVentasAux: number = 0;
  public totalVentasPendientesAux: number = 0;
  public sumaSaldoAux: number = 0;
  public sumaImporteTotalAux: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,

    // Servicios 
    private TipoComprobanteService: TipoComprobanteService,
    private clienteService: ClienteService,
    private pagoService: PagoService,
    private productoService: ProductoService,
    private formaPagoService: FormaPagoService,
    private ventaService: VentaService,
    private detalleVentaService: DetalleVentaService,

    //XML
    private http: HttpClient,
    //private elementRef: ElementRef,

    // Filtrado de ventas
    private datePipe: DatePipe,

  ) {
    this.ventaForm = this.fb.group({

      id_tipo_comprobante: [''],
      id_venta: [''],

      id_cliente: ['', [Validators.required, Validators.minLength(0)]],
      identificacion: ['', [Validators.required, Validators.minLength(0)]],
      razon_social: ['', [Validators.required, Validators.minLength(0)]],
      direccion: ['', [Validators.required, Validators.minLength(0)]],
      telefono: ['', [Validators.required, Validators.minLength(0)]],
      email: ['', [Validators.required, Validators.email]],

      //id_asiento: ['1'],
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

    this.ventaFormU = this.fb.group({

      //id_venta: [''], 

      //id_cliente: [''],
      identificacion: [''],
      razon_social: [''],
      direccion: [''],
      telefono: [''],
      email: [''],

      //id_asiento: [''],
      codigo: [''],
      fecha_emision: [],
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

    this.ventaFormXML = this.fb.group({

      //id_venta: [''], 

      //id_cliente: [''],
      identificacion: [''],
      razon_social: [''],
      direccion: [''],
      telefono: [''],
      email: [''],

      //id_asiento: [''],
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

    this.detalleVentaForm = this.fb.group({
      detalles: this.fb.array([])
    });

    this.clienteForm = this.fb.group({
      identificacion: ['1727671629', [Validators.required, Validators.minLength(3)]],
      razon_social: ['ALEX LANCHIMBA', [Validators.required, Validators.minLength(3)]],
      direccion: ['QUITO', [Validators.required, Validators.minLength(3)]],
      telefono: ['0978812129', [Validators.required, Validators.minLength(3)]],
      email: ['ailanchimbaa@utn.edu.ec', [Validators.required, Validators.email]],
    });

    // Agregar validación personalizada para fecha de vencimiento
    this.ventaForm.get('fecha_vencimiento').setValidators((control) => {
      const fechaEmision = this.ventaForm.get('fecha_emision').value;
      const fechaVencimiento = control.value;
      console.log("Fecha Emision ", fechaEmision)
      console.log("Fecha Vencimiento ", fechaVencimiento)
      if (fechaEmision && fechaVencimiento && fechaVencimiento < fechaEmision) {
        return { fechaInvalida: true };
      }
      return null;
    });

    // Agregar validación personalizada para fecha de vencimiento
    this.ventaFormXML.get('fecha_vencimiento').setValidators((control) => {
      //const fechaEmision = this.ventaFormXML.get('fecha_emision').value;
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
    this.ventaFormU.get('fecha_vencimiento').setValidators((control) => {
      const fechaEmision = this.ventaFormU.get('fecha_emision').value;
      const fechaVencimiento = control.value;
      console.log("Fecha Emision ", fechaEmision)
      console.log("Fecha Vencimiento ", fechaVencimiento)
      if (fechaEmision && fechaVencimiento && fechaVencimiento < fechaEmision) {
        return { fechaInvalida: true };
      }
      return null;
    });
  }

  ngOnInit(): void {
    this.cargarTiposComprobantesAll();
    this.cargarClientesAll();
    this.cargarFormasPago();
    this.cargarProductos();
    this.cargarProductosAll();
    this.cargarVentasAll();
    this.cargarVentas();
    const fechaActual = new Date();
    this.fechaActual = formatDate(fechaActual, 'd-M-yyyy', 'en-US', 'UTC-5');
  }

  // Función para actualizar id_tipo_comprobante
  actualizarTipoComprobante(id: number) {
    this.id_tipo_comprobante = id;
  }

  // Método para cargar todos los tipos de comprobantes 
  cargarTiposComprobantesAll() {
    this.TipoComprobanteService.loadTiposComprobantesAll()
      .subscribe(({ tipos_comprobantes }) => {
        this.tipos_comprobantes = tipos_comprobantes;
      })
  }

  // Método para cargar todos los clientes 
  cargarClientesAll() {
    this.clienteService.loadClientesAll()
      .subscribe(({ clientes }) => {
        this.clientes = clientes;
      })
  }

  // Método para cargar todas las formas de pago
  cargarFormasPago() {
    this.formaPagoService.loadFormasPagoAll()
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
        this.productosAll = productos;
      })
  }

  // Método para cargar los pagos 
  cargarPagosByIdVenta(id_venta: any) {
    this.pagoService.loadPagosByIdVenta(id_venta)
      .subscribe(({ pagos }) => {
        this.pagos = pagos;
        console.log("this.pagos", this.pagos)
      })
  }

  // Método para cargar ventas paginadas en Table Data Venta
  cargarVentas() {
    const desde = (this.paginaActual - 1) * this.itemsPorPagina;
    this.ventaService.loadVentas(desde, this.itemsPorPagina)
      .subscribe(({ ventas, totalVentas }) => {
        this.ventas = ventas;
        this.totalVentas = totalVentas;
        this.calcularNumeroPaginas();
        this.mostrarPaginacion = this.totalVentas > this.itemsPorPagina;
      });
  }

  // Método para cargar todas ventas en Table Data Venta
  cargarVentasAll() {
    this.ventaService.loadVentasAll()
      .subscribe(({ ventas, totalVentas, totalVentasPendientes, sumaSaldo, sumaImporteTotal }) => {
        this.allVentas = ventas;
        this.totalVentas = totalVentas;
        this.totalVentasPendientes = totalVentasPendientes;
        this.sumaSaldo = sumaSaldo;
        this.sumaImporteTotal = sumaImporteTotal;
      });
  }

  // Método para borrar pago en Table Update Venta
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
            //this.cargarPagosByIdVenta(this.id_venta);
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

  // Método para borrar venta en Table Date Venta
  borrarVenta(venta: Venta) {
    Swal.fire({
      title: '¿Borrar Venta?',
      text: `Estas a punto de borrar a ${venta.codigo}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.ventaService.deleteVenta(venta.id_venta)
          .subscribe(resp => {
            this.cargarVentas();
            Swal.fire({
              icon: 'success',
              title: 'Venta borrado',
              text: `${venta.codigo} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar el venta.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
          );
      }
    });
  }

  // Método para filtrar ventas en Table Date Venta
  filtrarVentas() {
    if (!this.ventasAux || this.ventasAux.length === 0) {
      // Inicializar las variables auxiliares una sola vez
      this.ventasAux = this.ventas;
      this.totalVentasAux = this.totalVentas;
      this.totalVentasPendientesAux = this.totalVentasPendientes;
      this.sumaImporteTotalAux = this.sumaImporteTotal;
      this.sumaSaldoAux = this.sumaSaldo;
    }
    if (this.buscarTexto.trim() === '' && !this.tipoComprobanteSelect && !this.estadoPagoSelect && (!this.fechaInicio || !this.fechaFin)) {
      // Restablecemos las variables principales con las auxiliares
      this.ventas = this.ventasAux;
      this.totalVentas = this.totalVentasAux;
      this.totalVentasPendientes = this.totalVentasPendientesAux;
      this.sumaImporteTotal = this.sumaImporteTotalAux;
      this.sumaSaldo = this.sumaSaldoAux;
    } else {
      // Reiniciamos variables
      this.totalVentas = 0;
      this.totalVentasPendientes = 0;
      this.sumaImporteTotal = 0;
      this.sumaSaldo = 0;

      this.ventas = this.allVentas.filter((venta) => {
        const regex = new RegExp(this.buscarTexto, 'i');
        const fechaEmision = this.datePipe.transform(new Date(venta.fecha_emision), 'yyyy-MM-dd');
        const cliente = this.clientes.find((prov) => prov.id_cliente === venta.id_cliente);

        const pasaFiltro = (
          (venta.codigo.match(regex) !== null ||
            cliente.razon_social.match(regex) !== null ||
            cliente.identificacion.includes(this.buscarTexto)) &&
          (!this.tipoComprobanteSelect || venta.id_tipo_comprobante.toString() === this.tipoComprobanteSelect) &&
          (!this.estadoPagoSelect || venta.estado_pago === this.estadoPagoSelect) &&
          (!this.fechaInicio || fechaEmision >= this.fechaInicio) &&
          (!this.fechaFin || fechaEmision <= this.fechaFin)
        );

        if (pasaFiltro) {
          this.sumaImporteTotal = this.sumaImporteTotal + parseFloat("" + venta.importe_total);
          if (venta.estado_pago === "PENDIENTE") {
            this.totalVentasPendientes++
          }
          this.sumaSaldo = this.sumaSaldo + (parseFloat("" + venta.importe_total) - (venta.abono ? parseFloat("" + venta.abono) : 0));
          this.totalVentas++;
        }
        return pasaFiltro;
      });
    }
  }

  // Método para borrar fecha fin en Table Date Venta
  borrarFechaFin() {
    this.fechaFin = null; // O establece el valor predeterminado deseado
    this.filtrarVentas();
  }

  // Método para borrar fecha inicio en Table Date Venta
  borrarFechaInicio() {
    this.fechaInicio = null; // O establece el valor predeterminado deseado
    this.filtrarVentas();
  }

  // Método para obtener total páginas en Table Date Venta
  get totalPaginas(): number {
    return Math.ceil(this.totalVentas / this.itemsPorPagina);
  }

  // Método para calcular número de páginas en Table Date Venta
  calcularNumeroPaginas() {
    if (this.totalVentas === 0 || this.itemsPorPagina <= 0) {
      this.paginas = [];
      return;
    }
    const totalPaginas = Math.ceil(this.totalVentas / this.itemsPorPagina);
    const halfVisible = Math.floor(this.maximoPaginasVisibles / 2);
    let startPage = Math.max(1, this.paginaActual - halfVisible);
    let endPage = Math.min(totalPaginas, startPage + this.maximoPaginasVisibles - 1);
    if (endPage - startPage + 1 < this.maximoPaginasVisibles) {
      startPage = Math.max(1, endPage - this.maximoPaginasVisibles + 1);
    }
    this.paginas = Array(endPage - startPage + 1).fill(0).map((_, i) => startPage + i);
  }

  // Método para cambiar items en Table Date Venta
  changeItemsPorPagina() {
    this.cargarVentas();
    this.paginaActual = 1;
  }

  // Método para cambiar página en Table Date Venta
  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.cargarVentas();
    }
  }

  // Método para obtener mínimo en Table Date Venta
  getMinValue(): number {
    const minValue = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    return minValue;
  }

  // Método para obtener máximo en Table Date Venta
  getMaxValue(): number {
    const maxValue = this.paginaActual * this.itemsPorPagina;
    return maxValue;
  }

  // Método para crear venta en Modal Create Venta
  crearVenta() {
    this.formSubmitted = true;
    if (this.ventaForm.invalid) {
      console.log("Validar Formulario", this.ventaForm.value);
      return;
    }

    const id_forma_pago = this.ventaForm.get('id_forma_pago').value;
    const fecha_pago = this.ventaForm.get('fecha_pago').value;
    const abono = this.ventaForm.get('abono').value;
    const observacion = this.ventaForm.get('observacion').value;
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

    // Comprobar si la cantidad en los detalles es mayor que el stock disponible
    // Comprobar si la cantidad en los detalles es mayor que el stock disponible
    for (const detalle of this.detalleVentaFormInterface) {
      if (detalle.cantidad > detalle.stock) {
        alert(`La cantidad para el producto ${detalle.producto} excede el stock disponible (${detalle.stock}).`);
        return; // La función se detiene aquí
      }

      //this.productoService.actualizarStockProducto(detalle.producto, detalle.cantidad);

    }

    // Verificar si fecha_vencimiento no está definido y asignar null
    if (!this.ventaForm.get('fecha_vencimiento').value) {
      this.ventaForm.get('fecha_vencimiento').setValue(null);
    }

    this.ventaForm.get('total_sin_impuesto').setValue(this.sumaTotalSinImpuesto);
    this.ventaForm.get('total_descuento').setValue(this.sumaTotalDescuento);
    this.ventaForm.get('valor').setValue(this.sumaTotalIVA);
    this.ventaForm.get('importe_total').setValue(this.sumaPrecioTotal);

    // Agregar id_tipo_comprobante a la solicitud
    const compraData = {
      ...this.ventaForm.value,
      id_tipo_comprobante: this.id_tipo_comprobante
    };
    this.ventaService.createVenta(compraData).subscribe(
      (res: any) => {
        const ventaId = res.id_venta; // Obtener el ID del venta guardado

        // Crear los detalles y asociarlos a la venta
        const detalles = [];
        for (const detalle of this.detalleVentaFormInterface) {
          const nuevoDetalle: DetalleVenta = {
            id_venta: ventaId,
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
        console.log('DETALLES CON ID_venta')
        console.log(detalles)
        this.detalleVentaService.createDetalleVentaArray(detalles).subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Venta Creada',
              text: 'La venta se han creado correctamente.',
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
            this.cerrarModal();
          },
          (err) => {
            let errorMessage = 'Se produjo un error al crear el venta..';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
        );

        //this.recargarComponente();
      },
      (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al crear la venta.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }

  // Método para crear cliente en Modal Create Venta
  crearCliente() {
    this.formSubmitted = true;
    if (this.clienteForm.invalid) {
      return;
    }
    this.clienteService.createCliente(this.clienteForm.value).subscribe(
      (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente Creado',
          text: 'Cliente se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.nuevoCliente = res;
        this.id_cliente = this.nuevoCliente.id_cliente;
        this.identificacion = this.nuevoCliente.identificacion;
        this.razon_social = this.nuevoCliente.razon_social;
        this.direccion = this.nuevoCliente.direccion;
        this.telefono = this.nuevoCliente.telefono;
        this.email = this.nuevoCliente.email;
        // Una vez creado el cliente llenamos(set) el formulario  
        this.agregarCliente();
        this.cerrarModal();

      }, (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al crear el cliente.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
    //this.recargarComponente();
  }

  // Método para agregar cliente en Modal Create Venta
  agregarCliente() {
    // Seleccionar automáticamente el nuevo cliente en el selector
    this.ventaForm.get('id_cliente').setValue(this.id_cliente);
    this.ventaForm.get('identificacion').setValue(this.identificacion);
    this.ventaForm.get('razon_social').setValue(this.razon_social);
    this.ventaForm.get('direccion').setValue(this.direccion);
    this.ventaForm.get('telefono').setValue(this.telefono);
    this.ventaForm.get('email').setValue(this.email);
  }

  public mostrarListaClientes: boolean = false;

  // Método para filtrar clientes en Modal Create Venta
  filtrarClientes(event: any) {
    const identficacion = event.target.value.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente => cliente.identificacion.toLowerCase().includes(identficacion));
    this.mostrarListaClientes = this.clientesFiltrados.length > 0;
  }

  // Método para cerra lista de clientes en Modal Create Venta
  @ViewChild('clientesLista', { read: ElementRef }) clientesLista: ElementRef;
  @HostListener('document:click', ['$event'])
  cerrarListaClientes(event: Event): void {
    if (this.clientesLista && this.clientesLista.nativeElement && !this.clientesLista.nativeElement.contains(event.target)) {
      this.mostrarListaClientes = false;
    }
  }

  // Método para convertir a mayúsculas en Modal Create Venta
  convertirAMayusculas(event: any) {
    const inputValue = event.target.value;
    const upperCaseValue = inputValue.toUpperCase();
    event.target.value = upperCaseValue;
  }

  // Método para seleccionar cliente en Modal Create Venta
  seleccionarCliente(cliente: any) {
    // Actualizamos valores del formulario
    this.ventaForm.patchValue({
      id_cliente: cliente.id_cliente,
      identificacion: cliente.identificacion,
      razon_social: cliente.razon_social,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      email: cliente.email
    });
  }

  // Método para obtener detalles en Modal Create Venta
  obtenerDetallesForm() {
    const formValues = this.detalleVentaForm.getRawValue();

    // Obtener el número de detalles
    const numDetalles2 = Object.keys(formValues).filter(key => key.startsWith('producto_')).length;

    // Reiniciar el arreglo detalleVentaFormInterface
    this.detalleVentaFormInterface = [];

    for (let i = 0; i < numDetalles2; i++) {
      const nuevoDetalle: DetalleVentaFormInterface = {
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
      this.detalleVentaFormInterface.push(nuevoDetalle);
    }
    //this.detalleVentaForm.reset();
  }

  // Método agregar detalle en Modal Create Venta
  agregarDetalleForm(): void {
    if (this.detalleVentaForm.invalid) {
      console.log('RETURN')
      return;
    }

    const nuevoDetalle: DetalleVentaFormInterface = {
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
    this.detalleVentaForm.addControl('producto_' + this.detalleVentaFormInterface.length, productoControl);
    this.detalleVentaForm.addControl('codigo_principal_' + this.detalleVentaFormInterface.length, codigoPrincipalControl);
    this.detalleVentaForm.addControl('stock_' + this.detalleVentaFormInterface.length, stockControl);
    this.detalleVentaForm.addControl('descripcion_' + this.detalleVentaFormInterface.length, descripcionControl);
    this.detalleVentaForm.addControl('cantidad_' + this.detalleVentaFormInterface.length, cantidadControl);
    this.detalleVentaForm.addControl('precio_unitario_' + this.detalleVentaFormInterface.length, precioUnitarioControl);
    this.detalleVentaForm.addControl('descuento_' + this.detalleVentaFormInterface.length, descuentoControl);
    this.detalleVentaForm.addControl('precio_total_sin_impuesto_' + this.detalleVentaFormInterface.length, precioTotalSinImpuestoControl);
    this.detalleVentaForm.addControl('tarifa_' + this.detalleVentaFormInterface.length, tarifaControl);
    this.detalleVentaForm.addControl('valor_' + this.detalleVentaFormInterface.length, valorControl);
    this.detalleVentaForm.addControl('ice_' + this.detalleVentaFormInterface.length, iceControl);
    this.detalleVentaForm.addControl('precio_total_' + this.detalleVentaFormInterface.length, precioTotalControl);

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
    this.detalleVentaFormInterface.push(nuevoDetalle);
  }

  // Método para eliminar detalle en Modal Create Venta
  eliminarDetalleForm(index: number): void {
    this.detalleVentaFormInterface.splice(index, 1);
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

  // Método para actualizar en Modal Create Venta
  actualizarCodigoPrincipal(event: Event, indice: number) {
    const selectElement = event.target as HTMLSelectElement;
    const productoId = parseInt(selectElement.value, 10);
    const productoSeleccionado = this.productos.find(producto => producto.id_producto === productoId);
    if (productoSeleccionado) {
      this.detalleVentaForm.controls[`codigo_principal_${indice}`].setValue(productoSeleccionado.codigo_principal);
    } else {
      this.detalleVentaForm.controls[`codigo_principal_${indice}`].setValue('');
    }
  }

  // Método para actualizar en Modal Create Venta
  actualizarStock(event: Event, indice: number) {
    const selectElement = event.target as HTMLSelectElement;
    const productoId = parseInt(selectElement.value, 10);
    const productoSeleccionado = this.productos.find(producto => producto.id_producto === productoId);
    if (productoSeleccionado) {
      // Actualiza la descripción en el formulario del detalle de la venta
      this.detalleVentaForm.controls[`stock_${indice}`].setValue(productoSeleccionado.stock);
    } else {
      this.detalleVentaForm.controls[`stock_${indice}`].setValue('');
    }
  }

  validarCantidadMaxima(cantidad: number, stock: number): boolean {
    return cantidad <= stock;
  }

  // Método para actualizar en Modal Create Venta
  actualizarDescripcion(event: Event, indice: number) {
    const selectElement = event.target as HTMLSelectElement;
    const productoId = parseInt(selectElement.value, 10);
    const productoSeleccionado = this.productos.find(producto => producto.id_producto === productoId);
    if (productoSeleccionado) {
      // Actualiza la descripción en el formulario del detalle de la venta
      this.detalleVentaForm.controls[`descripcion_${indice}`].setValue(productoSeleccionado.descripcion);
    } else {
      this.detalleVentaForm.controls[`descripcion_${indice}`].setValue('');
    }
  }

  // Método para actualizar en Modal Create Venta
  actualizarPrecioUnitario(event: Event, indice: number) {
    const selectElement = event.target as HTMLSelectElement;
    const productoId = parseInt(selectElement.value, 10);
    const productoSeleccionado = this.productos.find(producto => producto.id_producto === productoId);
    if (productoSeleccionado) {
      // Actualiza la descripción en el formulario del detalle de la venta
      this.detalleVentaForm.controls[`precio_unitario_${indice}`].setValue(productoSeleccionado.precio_venta);
    } else {
      this.detalleVentaForm.controls[`precio_unitario_${indice}`].setValue('');
    }
  }

  // Método para actualizar en Modal Create Venta
  actualizarTarifa(event: Event, indice: number) {
    const selectElement = event.target as HTMLSelectElement;
    const productoId = parseInt(selectElement.value, 10);
    const productoSeleccionado = this.productos.find(producto => producto.id_producto === productoId);
    if (productoSeleccionado) {
      const tarifaRedondeada = Math.round(productoSeleccionado.tarifa);
      this.detalleVentaForm.controls[`tarifa_${indice}`].setValue(tarifaRedondeada);
    } else {
      this.detalleVentaForm.controls[`tarifa_${indice}`].setValue('');
    }
  }

  // Método para calcular en Modal Create Venta
  calcularPrecioTotalSinImpuestoConDescuento(index: number): void {
    const cantidadControl = this.detalleVentaForm.get(`cantidad_${index}`);
    const precioUnitarioControl = this.detalleVentaForm.get(`precio_unitario_${index}`);
    const descuentoControl = this.detalleVentaForm.get(`descuento_${index}`);
    const precioTotalSinImpuestoControl = this.detalleVentaForm.get(`precio_total_sin_impuesto_${index}`);

    if (cantidadControl && precioUnitarioControl && descuentoControl && precioTotalSinImpuestoControl) {
      const cantidad = cantidadControl.value;
      const precioUnitario = precioUnitarioControl.value;
      const descuento = descuentoControl.value || 0; // Si no hay descuento, se considera 0.

      const precioTotalSinImpuesto = cantidad * precioUnitario - descuento;

      precioTotalSinImpuestoControl.setValue(precioTotalSinImpuesto);
    }
  }

  // Método para calcular en Modal Create Venta
  calcularValor(index: number): void {
    const tarifaControl = this.detalleVentaForm.get(`tarifa_${index}`);
    const precioTotalSinImpuestoControl = this.detalleVentaForm.get(`precio_total_sin_impuesto_${index}`);
    const valorControl = this.detalleVentaForm.get(`valor_${index}`);
    if (tarifaControl && precioTotalSinImpuestoControl && valorControl) {
      const tarifa = tarifaControl.value || 0;
      const precioTotalSinImpuesto = precioTotalSinImpuestoControl.value || 0;
      const valor = (tarifa / 100) * precioTotalSinImpuesto;
      valorControl.setValue(valor);
    }
  }

  // Método para calcular en Modal Create Venta
  calcularPrecioTotal(index: number): void {
    const precioTotalSinImpuestoControl = this.detalleVentaForm.get(`precio_total_sin_impuesto_${index}`);
    const tarifaControl = this.detalleVentaForm.get(`tarifa_${index}`);
    const valorControl = this.detalleVentaForm.get(`valor_${index}`);
    const iceControl = this.detalleVentaForm.get(`ice_${index}`);
    const precioTotalControl = this.detalleVentaForm.get(`precio_total_${index}`);
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

  // Método para actualizar en Modal Create Venta
  actualizarTotalesPorTarifa(): void {
    this.sumaTotalImpuesto = 0;
    this.sumaTotalImpuestoCero = 0;
    for (let i = 0; i < this.detalleVentaFormInterface.length; i++) {
      const tarifaControl = this.detalleVentaForm.get(`tarifa_${i}`);
      const precioTotalSinImpuestoControl = this.detalleVentaForm.get(`precio_total_sin_impuesto_${i}`);
      const iceControl = this.detalleVentaForm.get(`ice_${i}`);
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

  // Método para actualizar en Modal Create Venta
  actualizarTotalDescuento(): void {
    this.sumaTotalDescuento = 0;
    for (let i = 0; i < this.detalleVentaFormInterface.length; i++) {
      const descuentoControl = this.detalleVentaForm.get(`descuento_${i}`);
      if (descuentoControl) {
        const descuento = descuentoControl.value || 0;
        this.sumaTotalDescuento += descuento;
      }
    }
  }

  // Método para actualizar en Modal Create Venta
  actualizarTotalSinImpuestos(): void {
    this.sumaTotalSinImpuesto = 0;
    for (let i = 0; i < this.detalleVentaFormInterface.length; i++) {
      const precioTotalSinImpuestoControl = this.detalleVentaForm.get(`precio_total_sin_impuesto_${i}`);
      if (precioTotalSinImpuestoControl) {
        const precioTotalSinImpuesto = precioTotalSinImpuestoControl.value || 0;
        this.sumaTotalSinImpuesto += precioTotalSinImpuesto;
      }
    }
  }

  // Método para actualizar en Modal Create Venta
  actualizarTotalICE(): void {
    this.sumaTotalICE = 0;
    for (let i = 0; i < this.detalleVentaFormInterface.length; i++) {
      const iceControl = this.detalleVentaForm.get(`ice_${i}`);
      if (iceControl) {
        const ice = iceControl.value || 0;
        this.sumaTotalICE += ice;
      }
    }
  }

  // Método para actualizar en Modal Create Venta
  actualizarTotalIVA(): void {
    this.sumaTotalIVA = 0;
    for (let i = 0; i < this.detalleVentaFormInterface.length; i++) {
      const tarifaControl = this.detalleVentaForm.get(`tarifa_${i}`);
      const valorControl = this.detalleVentaForm.get(`valor_${i}`);

      if (tarifaControl && valorControl) {
        const tarifa = tarifaControl.value;
        const valor = valorControl.value || 0;

        if (tarifa === 12) {
          this.sumaTotalIVA += valor;
        }
      }
    }
  }

  // Método para actualizar en Modal Create Venta
  actualizarPrecioTotal(): void {
    this.sumaPrecioTotal = 0;
    for (let i = 0; i < this.detalleVentaFormInterface.length; i++) {
      const precioTotalControl = this.detalleVentaForm.get(`precio_total_${i}`);
      if (precioTotalControl) {
        const precioTotal = precioTotalControl.value || 0;
        this.sumaPrecioTotal += precioTotal;
      }
    }
  }

  // Método para actualizar en Modal Create Venta
  actualizarSaldo(): void {
    this.abono = this.ventaForm.get('abono').value || 0;
    const nuevoSaldo = Math.max(this.sumaPrecioTotal - this.abono, 0);
    console.log("entra")
    if (nuevoSaldo === 0) {
      this.abono = this.sumaPrecioTotal;
      this.ventaForm.get('abono').setValue(this.abono.toFixed(2));
      this.ventaForm.get('saldo').setValue("0.00"); // Actualizar el campo "Saldo" en el formulario
    } else {
      this.ventaForm.get('saldo').setValue(nuevoSaldo.toFixed(2));
    }
  }

  // Método para actualizar venta en Modal Update Venta
  actualizarVenta() {
    this.formSubmitted = true;
    if (this.ventaFormU.invalid) {
      console.log("Validar Formulario", this.ventaForm.value);
      return;
    }

    const idFormaPago = this.ventaFormU.get('id_forma_pago').value;
    const fecha_pago = this.ventaFormU.get('fecha_pago').value;
    const abono = this.ventaFormU.get('abono').value;
    const observacion = this.ventaFormU.get('observacion').value;
    if (abono > 0) {
      if (!fecha_pago) {
        alert('Debes proporcionar una fecha de pago si el abono es mayor a cero.');
        return;
      }
      if (idFormaPago === '') {
        alert('Debes seleccionar una forma de pago si el abono es mayor a cero.');
        return;
      }
      if (observacion.trim() === '') {
        alert('Debes proporcionar una observación si el abono es mayor a cero.');
        return;
      }
    }

    const data = {
      ...this.ventaFormU.value,
      id_venta: this.ventaSeleccionada.id_venta,
    }

    this.ventaService.updateVenta(data)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Venta actualizada',
          text: 'Venta se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al actualizar la venta.';
        Swal.fire('Error', errorMessage, 'error');
      });
  }


  // Método para cargar venta por id en Modal Update Venta
  cargarVentaPorId(id_venta: any) {
    this.ventaService.loadVentaById(id_venta)
      .pipe(
        switchMap((venta: any) => {
          //const { id_cliente, id_asiento, codigo, fecha_emision, fecha_vencimiento, estado_pago,
          //total_sin_impuesto, total_descuento, valor, importe_total, abono, estado } = venta.venta[0];
          const { id_cliente, codigo, fecha_emision, fecha_vencimiento, estado_pago,
            total_sin_impuesto, total_descuento, valor, importe_total, abono, estado } = venta.venta[0];
          this.ventaSeleccionada = venta.venta[0];
          this.codigo = codigo;
          this.fechaEmisionU = fecha_emision; // Así mantenemos la fecha original
          this.fechaVencimientoU = fecha_vencimiento
          this.total_sin_impuesto = total_sin_impuesto;
          this.total_descuento = total_descuento;
          this.valor = valor;
          this.importe_total = importe_total;
          this.estado = estado;

          const saldo = venta.saldo.toFixed(2);
          this.saldoInicial = parseFloat(saldo); // Saldo recuperado

          this.abonoU = abono; // Abono recuperado

          const id_forma_pago = ""; // Precargar un id_forma_pago en html
          const fecha_pago = null;
          const observacion = "";

          return this.cargarClientePorId(id_cliente).pipe(
            concatMap(cliente => {
              const { identificacion, razon_social, direccion, telefono, email } = cliente[0];
              this.clienteSeleccionado = cliente[0];
              this.identificacion = identificacion;
              this.razon_social = razon_social;
              this.direccion = direccion;
              this.telefono = telefono;
              this.email = email;
              const abono = "0.00"; // Precargar abono en html
              //return of({
              //identificacion, razon_social, direccion, telefono, email,
              //id_asiento, codigo, fecha_emision, fecha_vencimiento, estado_pago, total_sin_impuesto, total_descuento, valor, importe_total, abono, saldo,
              //id_forma_pago, fecha_pago, observacion,
              //});
              return of({
                identificacion, razon_social, direccion, telefono, email,
                codigo, fecha_emision, fecha_vencimiento, estado_pago, total_sin_impuesto, total_descuento, valor, importe_total, abono, saldo,
                id_forma_pago, fecha_pago, observacion,
              });
            })
          );
        })
      )
      .subscribe(data => {
        this.ventaFormU.setValue(data);
        this.ventaFormU.get('fecha_emision').setValue(this.datePipe.transform(this.fechaEmisionU, 'yyyy-MM-dd'));
      });
  }

  // Método para cargar cliente por id en Modal Update Venta
  cargarClientePorId(id_cliente: any) {
    this.ventaFormU.get('fecha_emision').setValue(this.datePipe.transform(this.fechaEmisionU, 'dd/MM/yyyy'));
    return this.clienteService.loadClienteById(id_cliente);
  }

  // Método para formatear fecha en Modal Update Venta
  /*
  getFormattedFechaEmisionU(): string {
    const fechaEmision = this.ventaFormU.get('fecha_emision')?.value;
    if (fechaEmision) {
      const fecha = new Date(fechaEmision);
      return fecha.toISOString().split('T')[0];
    }
    return '';
  }
  */

  // Método para formatear fecha en Modal Update Venta
  getFormattedFechaVencimientoU(): string {
    const fechaVencimiento = this.ventaFormU.get('fecha_vencimiento')?.value;
    if (fechaVencimiento) {
      const fecha = new Date(fechaVencimiento);
      return fecha.toISOString().split('T')[0];
    }
    return '';
  }

  // Método para formatear fecha en Modal Update Venta
  getFormattedFechaEmisionXML(): string {
    const fechaEmision = this.ventaFormXML.get('fecha_emision')?.value;
    if (fechaEmision) {
      const fecha = new Date(fechaEmision);
      return fecha.toISOString().split('T')[0];
    }
    return '';
  }

  // Método para cargar detalles venta por id venta en Modal Update Venta
  cargarDetallesVentaByIdVenta(id_venta: any) {
    this.detalleVentaService.loadDetallesVentaByIdVenta(id_venta)
      .subscribe(({ detalles_ventas }) => {
        console.log("detallessssssssss", detalles_ventas)
        this.detalles_venta = detalles_ventas;
      })
  }

  // Método para actualizar saldo en Modal Update Venta
  actualizarSaldoU(): void {
    this.abonoU = this.ventaFormU.get('abono').value || 0;
    const nuevoSaldo = Math.max(this.saldoInicial - this.abonoU, 0);
    if (nuevoSaldo === 0) {
      this.abonoU = this.saldoInicial;
      this.ventaFormU.get('abono').setValue(this.abonoU.toFixed(2));
      this.ventaFormU.get('saldo').setValue("0.00");
    } else {
      this.ventaFormU.get('saldo').setValue(nuevoSaldo.toFixed(2));
    }
  }


  // Método para crear venta en Modal XML
  crearVentaXML() {
    // Reiniciar el arreglo detallesXMLInterface
    //this.detallesXMLInterface = [];
    // Limpiar el formulario de detalles
    //this.detalleVentaForm.reset();
    if (this.detallesXMLInterface.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No ha cargado un archivo XML.',
      });
      return;
    }

    this.formSubmitted = true;
    if (this.ventaFormU.invalid) {
      // Aquí se valida los campos que están validando en "Input Validation"
      console.log("Validar Formulario", this.ventaForm.value);
      return;
    }

    const id_forma_pago = this.ventaForm.get('id_forma_pago').value;
    const fecha_pago = this.ventaForm.get('fecha_pago').value;
    const abono = this.ventaForm.get('abono').value;
    const observacion = this.ventaForm.get('observacion').value;
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

    // Una vez que los productos se han creado, procede a crear la venta
    const ventaData: VentaXMLInterface = {
      id_tipo_comprobante: this.id_tipo_comprobante,
      id_cliente: this.id_cliente,
      //id_forma_pago: this.id_forma_pago, con esto cargamos la forma de pago del XML
      id_forma_pago: this.ventaFormXML.get("id_forma_pago").value,
      //id_asiento: 1,
      id_info_tributaria: 1,
      clave_acceso: this.claveAcceso,
      codigo: this.estab + "-" + this.ptoEmi + "-" + this.secuencial,
      fecha_emision: this.fechaEmision,
      fecha_vencimiento: this.ventaFormXML.get("fecha_vencimiento").value,
      estado_pago: '',
      total_sin_impuesto: this.totalSinImpuestos,
      total_descuento: this.totalDescuento,
      valor: this.valor2,
      propina: this.propina,
      importe_total: this.importeTotal,

      abono: this.abonoXML,
      //saldo: 0, // Valor válido
      observacion: this.ventaFormXML.get("observacion").value,
    };
    console.log("Data: ", ventaData)
    this.ventaService.createVenta(ventaData).subscribe(
      (res: any) => {
        const ventaId = res.id_venta; // Obtener el ID del venta guardado
        console.log("RES ", res)
        console.log("FACTURA ID: ", ventaId)
        const productosObservables = this.crearProductosXML();
        forkJoin(productosObservables).subscribe((productosCreados: any[]) => {
          // Crear los detalles y asociarlos a la venta y productos
          const detallesXMLInterface = this.detallesXMLInterface.map((detalleXML, index) => {

            return {
              id_venta: ventaId,
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
          this.detalleVentaService.createDetalleVentaArray(detallesXMLInterface).subscribe(
            () => {
              Swal.fire({
                icon: 'success',
                title: 'Venta Creada',
                text: 'La venta se han creado correctamente.',
                showConfirmButton: false,
                timer: 1500
              });
              //this.recargarComponente();
              this.cerrarModal();
            },
            (err) => {
              let errorMessage = 'Se produjo un error al crear el venta.';
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
      console.log("PASA: ", this.ruc)
      parser.parseString(data, (err, result) => {
        const factura = result?.factura;
        console.log("PASA 2: ", factura)
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
        console.log("RUC: ", this.ruc)
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
        //this.importeTotal = parseFloat(result.venta.infoVenta[0].importeTotal[0]);
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
              this.telefonoComprador = valor
            } else if (nombre === 'Email') {
              this.emailComprador = valor
            }
          }
        }
        this.detallesXMLInterface = arr; // Updated to assign to detallesXMLInterface
        resolve(arr);
        this.cargarClienteByIdentificacion(this.identificacionComprador)
      });
    });
  }

  // Método para crear cliente en Modal XML
  crearClienteXML() {
    this.identificacion = this.identificacionComprador
    this.razon_social = this.razonSocialComprador
    this.direccion = this.direccionComprador
    this.telefono = this.telefonoComprador
    this.email = this.emailComprador
    if (!this.identificacion || !this.razon_social) {
      Swal.fire('Error', 'Falta información requerida para crear el cliente.', 'error');
      return;
    }

    // Crea un objeto con la información del cliente
    const clienteData = {
      identificacion: this.identificacion,
      razon_social: this.razon_social,
      //nombre_comercial: this.nombre_comercial,
      direccion: this.direccion,
      telefono: this.telefono,
      email: this.email
    };
    console.log('clienteData: ', clienteData)
    // Realiza la solicitud POST para crear el cliente
    this.clienteService.createCliente(clienteData).subscribe(
      (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente Creado',
          text: 'Cliente se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.cargarClienteByIdentificacion(this.identificacion);
        //this.recargarComponente();
        //this.cerrarModal();
      }, (err) => {
        let errorMessage = 'Se produjo un error al crear el cliente.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    //this.recargarComponente();
  }

  // Método para cargar cliente por identificación en Modal XML
  cargarClienteByIdentificacion(identificacion: string) {
    this.clienteService.loadClienteByIdentificacion(identificacion)
      .subscribe(
        (cliente) => {
          if (Array.isArray(cliente) && cliente.length > 0) {
            const { id_cliente, identificacion, razon_social } = cliente[0];
            this.id_cliente = id_cliente;
            this.identificacion = identificacion;
            this.razon_social = razon_social;
            console.log("this.identificacion 3: ", this.identificacion)

          } else {
            Swal.fire({
              title: 'Éxito',
              text: 'XML Cargado',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            })
              .then(() => {
                console.log("this.identificacion 4: ", this.identificacion)
                this.mostrarMensajeDeAdvertenciaConOpciones('Advertencia', 'Cliente no encontrado. ¿Desea crear un nuevo cliente?');
              });
          }
        }, (err) => {
          let errorMessage = 'Se produjo un error al cargar el cliente.';
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
        console.log('--> Inicio - this.crearClienteXML()');
        this.crearClienteXML();
        console.log('--> Fin - this.crearClienteXML()');
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
    this.abonoXML = this.ventaFormXML.get('abono').value || 0;
    const nuevoSaldo = Math.max(this.importeTotal - this.abonoXML, 0);
    if (nuevoSaldo === 0) {
      this.abonoXML = this.importeTotal;
      this.ventaFormXML.get('abono').setValue(this.abonoXML.toFixed(2));
      this.ventaFormXML.get('saldo').setValue("0.00");
    } else {
      this.ventaFormXML.get('saldo').setValue(nuevoSaldo.toFixed(2));
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
      this.router.navigate(['/dashboard/ventas']);
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
