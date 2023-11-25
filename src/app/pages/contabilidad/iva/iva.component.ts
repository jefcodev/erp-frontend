import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { IVA } from 'src/app/models/contabilidad/iva.model';
import { IVAService } from 'src/app/services/contabilidad/iva.service';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-iva',
  templateUrl: './iva.component.html',
  styles: [
  ]
})
export class IVAComponent implements OnInit {
  public iva: IVA[] = [];
  public selectedMonth: string = ''; // Mes seleccionado
  public months: string[] = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'PRIMER_SEMESTRE', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE', 'SEGUNDO_SEMESTRE', 'ANUAL'];

  constructor(
    private fb: FormBuilder,
    private IVAService: IVAService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.cargarIVA();
  }

  cargarIVA() {
    this.IVAService.loadIVA()
      .subscribe(({ iva }) => {
        this.iva = iva;
        console.log('this.iva: ', this.iva)
      })
  }


  generatePDF() {
    // Crear el contenido del PDF
    const content = [

      // Título grande
      {
        text: 'Impuesto al Valor Agregado',
        style: 'bigTitle',
        alignment: 'center',
        fontSize: 18,
        margin: [0, 0, 0, 10], // Ajusta los márgenes según tu preferencia
      },

      // Tabla
      {
        table: {
          headerRows: 1,
          /*widths: [
            'auto', '*', 
            'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto',
            'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto',
            
          ],
          */
          body: [
            // Encabezados de columna
            [
              { text: 'ORIGINAL SUBIDAS AL SRI', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'ENERO', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'FEBRERO', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'MARZO', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'ABRIL', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'MAYO', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'JUNIO', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'PRIMER SEMESTRE', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'JULIO', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'AGOSTO', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'SEPTIEMBRE', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'OCTUBRE', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'NOVIEMBRE', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'DICIEMBRE', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'SEGUNDO SEMESTRE', style: 'tableHeader0', colSpan: 2 },
              { text: '', style: 'tableHeader0' },
              { text: 'ANUAL', style: 'tableHeader0', colSpan: 2 },
              { text: 'EJE', style: 'tableHeader0' },
            ],
            [
              { text: 'CATEGORÍA', style: 'tableHeader' },
              { text: 'CASILLERO', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
              { text: 'BASE', style: 'tableHeader' },
              { text: 'IVA', style: 'tableHeader' },
            ],
            // Filas de datos
            ...this.iva.map(er => [
              { text: er.categoria || '', style: 'tableCell' },
              { text: er.casillero || '', style: 'tableCell' },
              { text: this.formatNumber(er.base_enero), style: 'tableCell' },
              { text: this.formatNumber(er.iva_enero), style: 'tableCell' },
              { text: this.formatNumber(er.base_febrero), style: 'tableCell' },
              { text: this.formatNumber(er.iva_febrero), style: 'tableCell' },
              { text: this.formatNumber(er.base_marzo), style: 'tableCell' },
              { text: this.formatNumber(er.iva_marzo), style: 'tableCell' },
              { text: this.formatNumber(er.base_abril), style: 'tableCell' },
              { text: this.formatNumber(er.iva_abril), style: 'tableCell' },
              { text: this.formatNumber(er.base_mayo), style: 'tableCell' },
              { text: this.formatNumber(er.iva_mayo), style: 'tableCell' },
              { text: this.formatNumber(er.base_junio), style: 'tableCell' },
              { text: this.formatNumber(er.iva_junio), style: 'tableCell' },
              { text: this.formatNumber(er.base_primer_semestre), style: 'tableCell' },
              { text: this.formatNumber(er.iva_primer_semestre), style: 'tableCell' },
              { text: this.formatNumber(er.base_julio), style: 'tableCell' },
              { text: this.formatNumber(er.iva_julio), style: 'tableCell' },
              { text: this.formatNumber(er.base_agosto), style: 'tableCell' },
              { text: this.formatNumber(er.iva_agosto), style: 'tableCell' },
              { text: this.formatNumber(er.base_septiembre), style: 'tableCell' },
              { text: this.formatNumber(er.iva_septiembre), style: 'tableCell' },
              { text: this.formatNumber(er.base_octubre), style: 'tableCell' },
              { text: this.formatNumber(er.iva_octubre), style: 'tableCell' },
              { text: this.formatNumber(er.base_noviembre), style: 'tableCell' },
              { text: this.formatNumber(er.iva_noviembre), style: 'tableCell' },
              { text: this.formatNumber(er.base_diciembre), style: 'tableCell' },
              { text: this.formatNumber(er.iva_diciembre), style: 'tableCell' },
              { text: this.formatNumber(er.base_segundo_semestre), style: 'tableCell' },
              { text: this.formatNumber(er.iva_segundo_semestre), style: 'tableCell' },
              { text: this.formatNumber(er.base_anual), style: 'tableCell' },
              { text: this.formatNumber(er.iva_anual), style: 'tableCell' },
            ])
          ]
        },
        layout: {
          defaultBorder: false
        }
      },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 760, y2: 5, lineWidth: 1 }] }, // Separador

    ];

    // Estilos personalizados
    const styles = {
      tableHeader0: {
        bold: true,
        alignment: 'center',
        fillColor: '#e9ecef',
        //fillColor: '#f2f2f2',
        margin: [0, 5, 0, 0],
        font: 'Roboto',
        fontSize: 3.6, // Ajusta el tamaño de la fuente según sea necesario
      },
      tableHeader: {
        bold: true,
        alignment: 'center',
        fillColor: '#e9ecef',
        //fillColor: '#f2f2f2',
        margin: [0, 0, 0, 5],
        font: 'Roboto',
        fontSize: 3.6, // Ajusta el tamaño de la fuente según sea necesario
      },
      tableCell: {
        fontSize: 3.6, // Ajusta el tamaño de la fuente según sea necesario
        alignment: 'right',
      },
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
          text: 'Impuesto al Valor Agregado',
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
            alignment: 'right', margin: [10, 10],
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
      pageOrientation: 'landscape',  // Agregar esta línea para establecer la orientación horizontal
    };

    // Agregar estilos personalizados al objeto options

    // Generar el documento PDF
    const pdfDocGenerator = pdfMake.createPdf(options);

    // Descargar el PDF
    pdfDocGenerator.download('IVA.pdf');
  }

  formatNumber(value: any): string {
    // Intentar convertir el valor a un número
    const numericValue = Number(value);

    // Verificar si la conversión fue exitosa y el valor es un número
    if (!isNaN(numericValue) && typeof numericValue === 'number') {
      return numericValue.toFixed(2);
    } else {
      // Si la conversión falla o el valor no es un número, devolver una cadena vacía o cualquier otro valor predeterminado
      return '';
    }
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

    // Generar el archivo de Excel
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crear un Blob con los datos del archivo de Excel
    const excelBlob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Descargar el archivo de Excel
    saveAs(excelBlob, 'IVA.xlsx');
  }

}
