
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EstadoResultado, SumaIEG } from 'src/app/models/contabilidad/estado-resultado.model';
import { EstadoResultadoService } from 'src/app/services/contabilidad/estado-resultado.service';
import { formatDate } from '@angular/common';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs

import { writeFile } from 'xlsx';
import * as XLSX from 'xlsx';
//import * as TableExport from 'tableexport';
//import * as TableExport from 'tableexport/dist/js/tableexport.min.js';
import { saveAs } from 'file-saver';
//import XLSXStyle from 'xlsx-style';

interface LoadEstadoResultado {
  estado_resultado: EstadoResultado[];// ver
  suma_ieg: SumaIEG[];
}

@Component({
  selector: 'app-estado-resultado',
  templateUrl: './estado-resultado.component.html',
  styles: [
  ]
})
export class EstadoResultadoComponent implements OnInit {
  public estado_resultado: EstadoResultado[] = [];
  public suma_ieg: SumaIEG[] = [];
  public formSubmitted = false;
  public ocultarModal: boolean = true;
  balanceGeneralForm: FormGroup;
  ingreso: number;
  egreso: number;
  gasto: number;
  utilidad_bruta: number;
  utilidad_neta: number;

  // Búsqueda y filtrado
  public buscarTexto: string = '';
  //public allFacturas: Factura[] = [];
  //public fechaInicio: string;
  //public fechaFin: string;
  public estadoPagoSelect: string;

  //public fechaInicio = '2023-10-01'; // Puedes ajustar estas fechas según tus necesidades
  //public fechaFin = '2023-12-31';
  public fechaInicio: string; // Puedes ajustar estas fechas según tus necesidades
  public fechaFin: string;

  constructor(
    private fb: FormBuilder,
    private estadoResultadoService: EstadoResultadoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.fechaInicio = '2023-01-01';
    this.fechaFin = '2023-12-31';
    this.cargarSumaIEG();
    this.cargarEstadoResultado();
    //this.cargarEstadoResultado2();
    //this.cargarSumaIEG2();
  }

  cargarEstadoResultado() {
    this.estadoResultadoService.loadEstadoResultado(this.fechaInicio, this.fechaFin)
      .subscribe(({ estado_resultado }) => {
        this.estado_resultado = estado_resultado;
      });
  }

  cargarSumaIEG() {
    this.estadoResultadoService.loadSumaIEG(this.fechaInicio, this.fechaFin)
      .subscribe(({ suma_ieg }) => {
        console.log("Suma Ingreso, Egreso, Gasto");
        console.log(suma_ieg);
        const suma = suma_ieg[0];

        // Utiliza el operador de fusión nula (??) para proporcionar cero si el valor es nulo o indefinido.
        this.ingreso = parseFloat(suma.ingresos) ?? 0;
        this.egreso = parseFloat(suma.egresos) ?? 0;
        this.gasto = parseFloat(suma.gastos) ?? 0;

        // Verifica las operaciones de utilidad_bruta y utilidad_neta
        console.log("Ingreso", this.ingreso);
        console.log("Egreso", this.egreso);
        console.log("Gasto", this.gasto);

        // Calcula la utilidad_bruta
        this.utilidad_bruta = this.ingreso - this.egreso; // signo cambiado
        console.log("Utilidad Bruta", this.utilidad_bruta);

        // Calcula la utilidad_neta
        this.utilidad_neta = this.ingreso - (this.gasto + this.egreso);
        console.log("Utilidad neta", this.utilidad_neta);
      });
  }

  filtrarEstadoResultado() {
    this.ingreso = 0;
    this.egreso = 0;
    this.gasto = 0;
    this.utilidad_bruta = 0;
    this.utilidad_neta = 0;
    // Asegúrate de manejar las fechas de inicio y fin y luego carga el estado de resultados.
    this.cargarSumaIEG();
    this.cargarEstadoResultado();
  }

  // Método para borrar fecha fin en Table Date Factura
  borrarFechaFin() {
    this.fechaFin = null; // O establece el valor predeterminado deseado
    this.filtrarEstadoResultado();
  }

  // Método para borrar fecha inicio en Table Date Factura
  borrarFechaInicio() {
    this.fechaInicio = null; // O establece el valor predeterminado deseado
    this.filtrarEstadoResultado();
  }


  generatePDF() {
    // Crear el contenido del PDF
    const content = [

      // Título grande
      {
        text: 'Informe de Estado de Resultado',
        style: 'bigTitle',
        alignment: 'center',
        fontSize: 18,
        margin: [0, 0, 0, 10], // Ajusta los márgenes según tu preferencia
      },

      // Tabla
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto'],
          body: [
            // Encabezados de columna
            [
              { text: 'Código', style: 'tableHeader' },
              { text: 'Descripción', style: 'tableHeader' },
              { text: 'Saldo', style: 'tableHeader' }
            ],
            // Filas de datos
            ...this.estado_resultado.map(er => [
              er.codigo,
              er.descripcion,
              { text: er.saldo, alignment: 'right' }])
          ]
        },
        layout: {
          defaultBorder: false
        }
      },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 1 }] }, // Separador
      // Espaciador invisible
      { text: '', margin: [0, 10] },
      // Total Ingreso
      {
        columns: [
          { text: 'Total Ingreso: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.ingreso || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },
      // Total Egreso
      {
        columns: [
          { text: 'Total Egreso: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.egreso || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },
      // Utilidad Bruta
      {
        columns: [
          { text: 'Utilidad Bruta: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.utilidad_bruta || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },
      // Total Gasto
      {
        columns: [

          { text: 'Total Gasto: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.gasto || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },
      // Utilidad Neta
      {
        columns: [
          { text: 'Utilidad Neta: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.utilidad_neta || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      }

    ];

    // Estilos personalizados
    const styles = {
      tableHeader: {
        bold: true,
        alignment: 'center',
        fillColor: '#e9ecef',
        //fillColor: '#f2f2f2',
        margin: [0, 5, 0, 5],
        font: 'Roboto'
      }
    };

    // Definir las fuentes utilizadas en el documento
    const fonts = {
      Arial: {
        normal: 'Arial.ttf',
        bold: 'Arial-Bold.ttf',
        italics: 'Arial-Italic.ttf',
        bolditalics: 'Arial-BoldItalic.ttf'
      },
      Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Bold.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-BoldItalic.ttf'
      }
    };

    // Encabezado del documento
    const header = {
      columns: [
        {
          text: 'Estado de Resultado',
          style: 'headerText',
          margin: [10, 10],
          fontSize: 10, // Ajusta el tamaño de la fuente según sea necesario
        },
        //{ text: new Date().toLocaleString('es', { dateStyle: 'medium', timeStyle: 'medium' }), style: 'headerDate', alignment: 'right', margin: [10, 10] }
        {
          text: '' + formatDate(new Date()),
          style: 'headerDate',
          alignment: 'right',
          margin: [10, 10],
          fontSize: 10, // Ajusta el tamaño de la fuente según sea necesario
        },
      ]
    };

    // Pie de página del documento
    const footer = function (currentPage, pageCount) {
      return {
        columns: [
          {
            text: 'Página ' + currentPage.toString() + ' de ' + pageCount,
            alignment: 'right',
            margin: [10, 10],
            fontSize: 10, // Ajusta el tamaño de la fuente según sea necesario
          },
          //{ text: 'Pie de página', alignment: 'right', margin: [10, 10] }
        ]
      };
    };

    // Función para formatear la fecha
    function formatDate(date) {
      const year = date.getFullYear();
      const month = padZero(date.getMonth() + 1);
      const day = padZero(date.getDate());
      const hours = padZero(date.getHours());
      const minutes = padZero(date.getMinutes());
      const seconds = padZero(date.getSeconds());

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // Función para agregar ceros a la izquierda si es necesario
    function padZero(value) {
      return value < 10 ? '0' + value : value;
    }


    // Estilos personalizados para el encabezado
    const headerStyles = {
      headerText: {
        font: 'Times New Roman',
        fontSize: 8,
        bold: true
      },
      headerDate: {
        font: 'Times New Roman',
        fontSize: 8
      }
    };

    // Definir las opciones del documento PDF
    const options = {
      content: content,
      styles: styles,
      fonts: fonts,
      header: header,
      footer: footer,
    };

    // Agregar estilos personalizados al objeto options

    // Generar el documento PDF
    const pdfDocGenerator = pdfMake.createPdf(options);

    // Descargar el PDF
    pdfDocGenerator.download('estado_resultado.pdf');
  }


  generatePDF3() { // original

    // Crear el contenido del PDF
    const content = [
      // Tabla
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto'],
          body: [
            // Encabezados de columna
            [
              { text: 'Código', style: 'tableHeader' },
              { text: 'Descripción', style: 'tableHeader' },
              { text: 'Saldo', style: 'tableHeader' }
            ],
            // Filas de datos
            ...this.estado_resultado.map(er => [er.codigo, er.descripcion, { text: er.saldo, alignment: 'right' }])
          ]
        },
        layout: {
          defaultBorder: false
        }
      },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 1 }] }, // Separador
      // Espaciador invisible
      { text: '', margin: [0, 10] },
      // Total Ingreso
      {
        columns: [
          { text: 'Total Ingreso: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.ingreso || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },
      // Total Egreso
      {
        columns: [
          { text: 'Total Egreso: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.egreso || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },
      // Utilidad Bruta
      {
        columns: [
          { text: 'Utilidad Bruta: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.utilidad_bruta || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },
      // Total Gasto
      {
        columns: [

          { text: 'Total Gasto: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.gasto || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },
      // Utilidad Neta
      {
        columns: [
          { text: 'Utilidad Neta: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.utilidad_neta || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      }

    ];

    // Estilos personalizados
    const styles = {
      tableHeader: {
        bold: true,
        alignment: 'center',
        fillColor: '#e9ecef',
        //fillColor: '#f2f2f2',
        margin: [0, 5, 0, 5],
        font: 'Roboto'
      }
    };

    // Definir las fuentes utilizadas en el documento
    const fonts = {
      Arial: {
        normal: 'Arial.ttf',
        bold: 'Arial-Bold.ttf',
        italics: 'Arial-Italic.ttf',
        bolditalics: 'Arial-BoldItalic.ttf'
      },
      Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Bold.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-BoldItalic.ttf'
      }
    };

    // Definir las opciones del documento PDF
    const options = {
      content: content,
      styles: styles,
      fonts: fonts,
    };

    // Generar el documento PDF
    const pdfDocGenerator = pdfMake.createPdf(options);

    // Descargar el PDF
    pdfDocGenerator.download('estado_resultado.pdf');
  }


  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/estado-resultado']);
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

  exportToExcel() {
    // Crear el libro de trabajo de Excel
    const workbook = XLSX.utils.book_new();

    // Crear la hoja de cálculo principal
    const worksheet = XLSX.utils.table_to_sheet(document.getElementById('demo-foo-addrow'));

    // Recorrer las celdas de la hoja de cálculo y cambiar el tipo de celda a "Texto" para las celdas de la columna de código
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
      const cellValue = worksheet[cellAddress]?.v;
      if (typeof cellValue === 'number') {
        const code = cellValue.toFixed(0); // Redondear el código a un número entero
        const updatedCode = code.replace(/\./g, '.0.'); // Agregar ".0" entre los componentes del código
        worksheet[cellAddress].t = 's'; // Cambiar el tipo de celda a "Texto"
        worksheet[cellAddress].v = updatedCode; // Asignar el código actualizado a la celda
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Obtén los valores dinámicos sin formato
    const totalIngreso = parseFloat((this.ingreso || 0).toFixed(2));
    const totalEgreso = parseFloat((this.egreso || 0).toFixed(2));
    const utilidadBruta = parseFloat((this.utilidad_bruta || 0).toFixed(2));
    const totalGasto = parseFloat((this.gasto || 0).toFixed(2));
    const utilidadNeta = parseFloat((this.utilidad_neta || 0).toFixed(2));

    // Crear una nueva hoja de cálculo para los datos adicionales
    const dataSheet = XLSX.utils.aoa_to_sheet([
      ['', '', ''],
      ['Total Ingreso:', totalIngreso, ''],
      ['Total Egreso:', totalEgreso, ''],
      ['Utilidad Bruta:', utilidadBruta, ''],
      ['Total Gasto:', totalGasto, ''],
      ['Utilidad Neta:', utilidadNeta, ''],
    ]);

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Datos Adicionales');

    // Generar el archivo de Excel
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crear un Blob con los datos del archivo de Excel
    const excelBlob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Descargar el archivo de Excel
    saveAs(excelBlob, 'estado_resultado.xlsx');
  }

  exportToExcel12() {
    // Crear el libro de trabajo de Excel
    const workbook = XLSX.utils.book_new();

    // Crear la hoja de cálculo principal
    const worksheet = XLSX.utils.table_to_sheet(document.getElementById('demo-foo-addrow'));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Obtén los valores dinámicos sin formato
    const totalIngreso = parseFloat((this.ingreso || 0).toFixed(2));
    const totalEgreso = parseFloat((this.egreso || 0).toFixed(2));
    const utilidadBruta = parseFloat((this.utilidad_bruta || 0).toFixed(2));
    const totalGasto = parseFloat((this.gasto || 0).toFixed(2));
    const utilidadNeta = parseFloat((this.utilidad_neta || 0).toFixed(2));

    // Crear una nueva hoja de cálculo para los datos adicionales
    const dataSheet = XLSX.utils.aoa_to_sheet([
      ['', '', ''],
      ['Total Ingreso:', totalIngreso, ''],
      ['Total Egreso:', totalEgreso, ''],
      ['Utilidad Bruta:', utilidadBruta, ''],
      ['Total Gasto:', totalGasto, ''],
      ['Utilidad Neta:', utilidadNeta, ''],
    ]);

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Datos Adicionales');

    // Generar el archivo de Excel
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crear un Blob con los datos del archivo de Excel
    const excelBlob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Descargar el archivo de Excel
    saveAs(excelBlob, 'estado_resultado.xlsx');
  }



  exportToExcel11() {
    // Crear el libro de trabajo de Excel
    const workbook = XLSX.utils.book_new();

    // Crear la hoja de cálculo principal
    const worksheet = XLSX.utils.table_to_sheet(document.getElementById('demo-foo-addrow'));
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Obtén los datos adicionales de la tabla
    const totalIngreso = document.querySelectorAll('.total-label')[0]?.textContent;
    const totalEgreso = document.querySelectorAll('.total-label')[1]?.textContent;
    const utilidadBruta = document.querySelectorAll('.total-label')[2]?.textContent;
    const totalGasto = document.querySelectorAll('.total-label')[3]?.textContent;
    const utilidadNeta = document.querySelectorAll('.total-label')[4]?.textContent;

    // Crear una nueva hoja de cálculo para los datos adicionales
    const dataSheet = XLSX.utils.aoa_to_sheet([
      ['', '', ''],
      [totalIngreso, '234324', ''],
      [totalEgreso, '', '88'],
      [utilidadBruta, '454', 'wer'],
      [totalGasto, '324234', 'wew'],
      [utilidadNeta, '', ''],
    ]);
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Datos Adicionales');

    // Generar el archivo de Excel
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crear un Blob con los datos del archivo de Excel
    const excelBlob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Descargar el archivo de Excel
    saveAs(excelBlob, 'estado_resultado.xlsx');
  }

  /*
    exportToExcel2() {
      const table = document.getElementById('demo-foo-addrow');
      const tableExport = new TableExport(table);
   
      const exportData = tableExport.getExportData();
      const xlsxData = exportData.demoFooAddrow.xlsx;
   
      const blob = new Blob([xlsxData.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'estado_resultado.xlsx');
    }
  */




}