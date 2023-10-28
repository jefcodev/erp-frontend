
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EstadoResultado, SumaIEG } from 'src/app/models/contabilidad/estado-resultado';
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

  constructor(
    private fb: FormBuilder,
    private estadoResultadoService: EstadoResultadoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.cargarEstadoResultado();
    this.cargarSumaIEG();
  }

  cargarEstadoResultado() {
    this.estadoResultadoService.loadEstadoResultado()
      .subscribe(({ estado_resultado }) => {
        this.estado_resultado = estado_resultado;
      })
  }

  cargarSumaIEG() {
    this.estadoResultadoService.loadSumaIEG()
      .subscribe(({ suma_ieg }) => {
        console.log("Suma Ingreso, Egreso, Gasto");
        console.log(suma_ieg);
        const suma = suma_ieg[0];
        this.ingreso = parseFloat(suma.ingreso);
        this.egreso = parseFloat(suma.egreso);
        this.gasto = parseFloat(suma.gasto);
        this.utilidad_bruta = this.ingreso + this.egreso;
        this.utilidad_neta = this.utilidad_bruta + this.gasto;
        console.log("Ingreso", this.ingreso);
        console.log("Egreso", this.egreso);
        console.log("Gasto", this.gasto);
        console.log("Utilidad Bruta", this.utilidad_bruta);
        console.log("Utilidad neta", this.utilidad_neta);
      });
  }


  generatePDF() {
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
      fonts: fonts
    };

    // Generar el documento PDF
    const pdfDocGenerator = pdfMake.createPdf(options);

    // Descargar el PDF
    pdfDocGenerator.download('estado_resultado.pdf');
  }

  generatePDF2() {
    // Crear el contenido del PDF
    const documentDefinition = {
      content: [
        { text: 'Estado de Resultados', style: 'header' },
        { text: 'Total Activo: $516.750,00', style: 'content' },
        { text: 'Total Pasivo: $-25.000,00', style: 'content' },
        { text: 'Resultado Ejercicio: $8.250,00', style: 'content' },
        { text: 'Total Patrimonio: $-491.749,75', style: 'content' },
        { text: 'Total Pasivo + Patrimonio: $-516.749,75', style: 'content' }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          marginBottom: 20
        },
        content: {
          fontSize: 14,
          marginBottom: 10
        }
      }
    };

    // Generar el PDF
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download('estado_resultados.pdf');
  }



  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/balance-general']);
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