import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BalanceGeneral, SumaAPP } from 'src/app/models/contabilidad/balance-general';
import { BalanceGeneralService } from 'src/app/services/contabilidad/balance-general.service';
import { EstadoResultadoService } from 'src/app/services/contabilidad/estado-resultado.service';
import { formatDate } from '@angular/common';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs
import * as XLSX from 'xlsx';

import { saveAs } from 'file-saver';

@Component({
  selector: 'app-balance-general',
  templateUrl: './balance-general.component.html',
  styles: [
  ]
})
export class BalanceGeneralComponent implements OnInit {
  public balance_general: BalanceGeneral[] = [];
  public suma_app: SumaAPP[] = [];
  public formSubmitted = false;
  public ocultarModal: boolean = true;
  balanceGeneralForm: FormGroup;
  total_activo: number;
  total_pasivo: number;
  patrimonio: number;
  resultado_ejercicio: number;
  total_patrimonio: number;
  pasivo_patrimonio: number;

  //estado de resultado
  total_ingreso: number;
  total_egreso: number;
  total_gasto: number;
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
    private balanceGeneralService: BalanceGeneralService,
    private estadoResultadoService: EstadoResultadoService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.fechaInicio = '2023-01-01';
    this.fechaFin = '2023-12-31';
    this.cargarSumaIEG();
    this.cargarSumaAPP();
    this.cargarBalanceGeneral();
  }

  cargarBalanceGeneral() {
    this.balanceGeneralService.loadBalanceGeneral(this.fechaInicio, this.fechaFin)
      .subscribe(({ balance_general }) => {
        this.balance_general = balance_general;
        console.log(balance_general)
      })
  }

  cargarSumaAPP() {
    this.cargarSumaIEG()
    console.log("HOLA: ", this.resultado_ejercicio)
    this.balanceGeneralService.loadSumaAPP(this.fechaInicio, this.fechaFin)
      .subscribe(({ suma_app }) => {
        console.log("Activo, Pasivo, Patrimonio");
        console.log(suma_app);
        const suma = suma_app[0];
        this.total_activo = parseFloat(suma.activo);
        this.total_pasivo = parseFloat(suma.pasivo);
        this.patrimonio = parseFloat(suma.patrimonio);
        this.total_patrimonio = this.patrimonio + this.resultado_ejercicio;
        this.pasivo_patrimonio = this.total_pasivo + this.total_patrimonio;
        console.log("Total Activo", this.total_activo);
        console.log("Total Pasivo", this.total_pasivo);
        console.log("Patrimonio", this.patrimonio);
        console.log("Resultado Ejercicio", this.resultado_ejercicio);
        console.log("Total Patrimonio", this.total_patrimonio);
        console.log("Pasivo + Patrimonio", this.pasivo_patrimonio);
      });
  }

  ingreso: number;
  egreso: number;
  gasto: number;

  cargarSumaIEG() {
    this.estadoResultadoService.loadSumaIEG(this.fechaInicio, this.fechaFin)
      .subscribe(({ suma_ieg }) => {
        console.log("Ingreso, Egreso, Gasto");
        console.log(suma_ieg);
        const suma = suma_ieg[0];
        this.total_ingreso = parseFloat(suma.ingresos);
        this.total_egreso = parseFloat(suma.egresos);
        this.total_gasto = parseFloat(suma.gastos);
        this.utilidad_bruta = this.total_ingreso - this.total_egreso;
        this.utilidad_neta = this.utilidad_bruta + this.total_gasto;
        console.log("Ingreso", this.total_ingreso);
        console.log("Egreso", this.total_egreso);
        console.log("Gasto", this.total_gasto);
        console.log("Utilidad Bruta", this.utilidad_bruta);
        console.log("Utilidad neta", this.utilidad_neta);
        this.resultado_ejercicio = this.utilidad_neta;
        console.log("HOLA 2", this.resultado_ejercicio)
      });
  }

  filtrarEstadoResultado() {
    this.total_activo = 0;
    this.total_pasivo = 0;
    this.resultado_ejercicio = 0;
    this.patrimonio = 0;
    //this.total_patrimonio = 0;
    /*
    this.total_ingreso = 0;
    this.total_egreso = 0;
    this.total_gasto = 0;
    this.utilidad_bruta = 0;
    this.utilidad_neta = 0;
     */
    this.pasivo_patrimonio = 0;


    // Asegúrate de manejar las fechas de inicio y fin y luego carga el estado de resultados.
    this.cargarSumaIEG();
    this.cargarSumaAPP();
    this.cargarBalanceGeneral();
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
        text: 'Informe de Balance General',
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
            ...this.balance_general.map(er => [er.codigo, er.descripcion, { text: er.saldo, alignment: 'right' }])
          ]
        },
        layout: {
          defaultBorder: false
        }
      },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 1 }] }, // Separador
      // Espaciador invisible
      { text: '', margin: [0, 10] },
      // Total Activo
      {
        columns: [
          { text: 'Total Activo: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.total_activo || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },
      // Total Pasivo
      {
        columns: [
          { text: 'Total Pasivo: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.total_pasivo || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },
      // Patrimonio
      {
        columns: [
          { text: 'Patrimonio: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.patrimonio || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },
      // Resultado del Ejercicio
      {
        columns: [
          { text: 'Resultado Ejercicio: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.resultado_ejercicio || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },
      // Total Patrimonio Neto
      {
        columns: [

          { text: 'Total Patrimonio: ', alignment: 'right', bold: true },
          { text: '$ ' + (this.total_patrimonio || 0).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right' }
        ]
      },


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
        { text: 'Balance General', style: 'headerText', margin: [10, 10] },
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
    pdfDocGenerator.download('balance_general.pdf');
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
    const totalActivo = parseFloat((this.total_activo || 0).toFixed(2));
    const totalPasivo = parseFloat((this.total_pasivo || 0).toFixed(2));
    const patrimonio = parseFloat((this.patrimonio || 0).toFixed(2));
    const resultadoEjercicio = parseFloat((this.resultado_ejercicio || 0).toFixed(2));
    const totalPatrimonio = parseFloat((this.total_patrimonio || 0).toFixed(2));

    // Crear una nueva hoja de cálculo para los datos adicionales
    const dataSheet = XLSX.utils.aoa_to_sheet([
      ['', '', ''],
      ['Total Activo:', totalActivo, ''],
      ['Total Pasivo:', totalPasivo, ''],
      ['Patrimonio:', patrimonio, ''],
      ['Resultado Ejercicio:', resultadoEjercicio, ''],
      ['Total Patrimonio:', totalPatrimonio, ''],
    ]);

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Datos Adicionales');

    // Generar el archivo de Excel
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crear un Blob con los datos del archivo de Excel
    const excelBlob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Descargar el archivo de Excel
    saveAs(excelBlob, 'balance_general.xlsx');
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

}
