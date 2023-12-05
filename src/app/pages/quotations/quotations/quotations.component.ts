import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

//Model
import { Detalle, Proforma } from 'src/app/models/quotations/quotation.model';
import { Cliente } from 'src/app/models/venta/cliente.model';
import { Producto } from 'src/app/models/inventario/producto.model';
import { Apu } from 'src/app/models/apus/apu.model';

//Service 
import { QuotationService } from 'src/app/services/quotations/quotation.service';
import { ClienteService } from 'src/app/services/venta/cliente.service';
import { ApuService } from 'src/app/services/apus/apu.service';
import { ProductoService } from 'src/app/services/inventario/producto.service';

/* Generar Pdf */
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

/* Imagen base 64 */
import * as base64 from 'base64-js';
import { Venta } from 'src/app/models/venta/venta.model';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';



@Component({
  selector: 'app-quotations',
  templateUrl: './quotations.component.html',
  styles: [
  ]
})
export class QuotationsComponent implements OnInit {


  public proformas: Proforma[] = [];
  public proformaEdit: Proforma[] = [];
  public profromaEditDetalle : Detalle[]=[];

  public clientes: Cliente[] = [];
  public capitulo: Apu[] = [];
  private productos: Producto[] = [];

  public fechaFormateada: string;


  

  /* Agrgar imagen */
  private logoPath = 'assets/images/LogoINVESERVICE.png';
  logoBase64: string;

  constructor(
    private quotationService: QuotationService,
    private clienteServive: ClienteService,
    private apuService: ApuService,
    private productosService: ProductoService,
    private http: HttpClient,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.cargarQuotations();
    this.cargarClientes();
    this.loadLogoBase64();
    this.cargarApus();
    this.cargarProductos();

  }

  private loadLogoBase64() {
    this.http.get(this.logoPath, { responseType: 'arraybuffer' }).subscribe(
      (data) => {
        const base64String = base64.fromByteArray(new Uint8Array(data));
        this.logoBase64 = `data:image/png;base64,${base64String}`;
      },
      (error) => {
        console.error('Error cargando la imagen del logo', error);
      }
    );
  }



  /* Cargar datos */
  cargarQuotations() {

    this.quotationService.cargarQuotations()
      .subscribe(quotations => {
        this.proformas = quotations;
        console.log(quotations);
      });
  }

  cargarClientes() {
    this.clienteServive.loadClientesAll()
      .subscribe(({ clientes }) => {
        this.clientes = clientes;
      })
  }

  cargarApus() {
    this.apuService.cargarApus().subscribe
      (apu => {
        this.capitulo = apu;
      })
  }

  cargarProductos() {
    this.productosService.loadProductosAll()
      .subscribe(({ productos }) => {
        this.productos = productos;
      })
  }

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/quotations']);
    });
  }



  /* Crear proforma */

  crearProformaFactura(id: number, proforma: Proforma) {
    const venta: Venta = {
      id_tipo_comprobante: 1,
      id_cliente: proforma.id_cliente,
      clave_acceso: '',
      codigo: '',
      fecha_emision: new Date(),
      total_sin_impuesto: 0,
      total_descuento: proforma.descuento,
      valor: 0,
      importe_total: proforma.total,
      abono: 1,
      observacion: '',
      id_proforma : id
    };

    Swal.fire({
      title: "Facturar?",
      text: `Desea facturar esta proforma ${id} ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, facturar!"
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Venta en formato JSON:', JSON.stringify(venta, null, 2));
        this.quotationService.createProformaFactura(venta).subscribe(
          (response) => {

            Swal.fire({
              icon: 'success',
              title: 'Facturado',
              text: `Ha sido facturado correctamente`,
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
          },
          (error) => {
            Swal.fire('Error', error, 'error');
          }

        );


      }

    });
  }



cargarValores(id: number) {
  this.quotationService.cargarProformaId(id).subscribe((resp) => {
    // Verificar si resp es un objeto y convertirlo a un array si es necesario
    this.proformaEdit = Array.isArray(resp) ? resp : [resp];
   /*  this.profromaEditDetalle = this.proformaEdit.detalle;
    console.log('Valores:', this.proformaEdit.detalle); */
  });
}




  /* Generar PDF */

  generarPDF(proformaId: number) {
    this.quotationService.cargarProformaId(proformaId).subscribe((proforma) => {
      const pdfContent = this.crearContenidoPDF(proforma);
      pdfMake.createPdf(pdfContent).open();
    });
  }

  crearContenidoPDF(proforma: any) {
    const content = [];

    // Agregar el logo
    content.push({
      image: this.logoBase64, // Reemplaza con la ruta correcta de tu logo
      width: 150, // Ajusta el ancho del logo según sea necesario
      alignment: 'center',
      margin: [0, 0, 0, 10], // Margen inferior
    });

    content.push({ text: 'Pasaje la concepción y Panamericana E35, Tabacundo, Pichincha, Ecuador', alignment: 'center', style: 'parrafo' });
    content.push({ text: 'Teléfono: 0980414366 Correo: info@inveservicefgl.com ', alignment: 'center', style: 'parrafo' });
    content.push({ text: 'Cotización', alignment: 'center', style: 'header' });
    content.push({ text: `Estado: ${proforma.estado ? 'FACTURADO' : 'PROFORMA'}`, margin: [0, 0, 0, 10] });

    // Obtener el nombre del cliente usando el servicio
    const cliente = this.clientes.find(cliente => cliente.id_cliente === proforma.id_cliente);

    // Verificar si se encontró el cliente
    const clienteNombre = cliente ? cliente.razon_social : 'Cliente no encontrado';

    content.push({ text: `Cliente: ${clienteNombre}`, alignment: 'left', margin: [0, 0, 0, 10] });


    const datePipe = new DatePipe('en-US');
    const formattedFecha = datePipe.transform(proforma.fecha, 'dd-MMM-yyyy');
    content.push({ text: `Fecha: ${formattedFecha}`, margin: [0, 0, 0, 10] });


    if (proforma.detalle && Array.isArray(proforma.detalle)) {
      const detalle = this.crearDetallePDF(proforma.detalle);
      content.push({ text: 'Detalle de productos:', style: 'subheader', margin: [0, 10, 0, 5] });
      content.push(detalle);
    } else {
      content.push({ text: 'Detalle no disponible', style: 'subheader', margin: [0, 10, 0, 5] });
    }

    const subTotal = (proforma.total / 1.12);
    const calculoIva = proforma.total - subTotal;
    const subTotalFrom = (subTotal).toFixed(2);
    const calculoIvaFrom = (calculoIva).toFixed(2);


    content.push({
      columns: [
        { text: 'SubTotal:', bold: true, alignment: 'right' },
        { text: ` $ ${subTotalFrom}`, alignment: 'right', width: 80 }
      ]
    });
    content.push({
      columns: [
        { text: 'Descuento:', bold: true, alignment: 'right' },
        { text: ` $ ${proforma.descuento}`, alignment: 'right', width: 80 }
      ]
    });
    content.push({
      columns: [
        { text: 'IVA:', bold: true, alignment: 'right' },
        { text: ` $ ${calculoIvaFrom}`, alignment: 'right', width: 80 }
      ]
    });
    content.push({
      columns: [
        { text: 'Total:', bold: true, alignment: 'right' },
        { text: ` $ ${proforma.total}`, alignment: 'right', width: 80 }
      ]
    });


    return {
      content,
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 0, 0, 10] },
        parrafo: { fontSize: 10 },
        tableHeader: { fillColor: '#c7ecee', color: '#2c3e50', bold: true },
        tableRow: { margin: [0, 5, 0, 5] },
      },
    };
  }

  crearDetallePDF(detalle: Detalle[]) {
    const rows = [];
    rows.push([
      { text: 'Producto', style: 'tableHeader', alignment: 'left' },
      { text: 'Cantidad', style: 'tableHeader', alignment: 'right' },
      { text: 'Precio Unitario', style: 'tableHeader', alignment: 'right' },
      { text: 'Descuento', style: 'tableHeader', alignment: 'right' },
      { text: 'Subtotal', style: 'tableHeader', alignment: 'right' },
    ]);
    detalle.forEach((item) => {
      const subtotal = ((item.cantidad * item.precio_unitario) - item.descuento).toFixed(2);
      let itemPro;
      let name;
      if (item.item === 'APU') {
        itemPro = this.capitulo.find(capitulo => capitulo.id_capitulo === item.item_id);
        name = itemPro ? itemPro.nombre : 'Capitulo no encontrado ';
      } else {
        itemPro = this.productos.find(producto => producto.id_producto === item.item_id);
        name = itemPro ? itemPro.descripcion : 'Producto no encontrado ';
      }
      rows.push([
        { text: name, alignment: 'left' },
        { text: item.cantidad.toString(), alignment: 'right' },
        { text: `$ ${item.precio_unitario}`, alignment: 'right' },
        { text: `$ ${item.descuento}`, alignment: 'right' },
        { text: `$ ${subtotal}`, alignment: 'right' },
      ]);
    });

    return {
      table: {
        headerRows: 1,
        body: rows,
        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
      },
      layout: {
        fillColor: (rowIndex: number, node: any, columnIndex: number) => {
          return rowIndex === 0 ? '#3498db' : (rowIndex % 2 === 0 ? '#ecf0f1' : null);
        },
        hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 2 : 1,
        vLineWidth: (i: number, node: any) => 0,
      },
      style: 'tableRow',
    };
  }


}
