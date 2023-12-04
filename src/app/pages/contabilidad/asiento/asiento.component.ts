import { Component, OnInit, ElementRef, ViewChild, HostListener, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
//import { SweetAlertIcon } from 'sweetalert2';
import { formatDate, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

// Service
import { AsientoService } from 'src/app/services/contabilidad/asiento.service';
import { DetalleAsientoService } from 'src/app/services/contabilidad/detalle-asiento.service';
import { CuentaService } from 'src/app/services/contabilidad/cuenta.service';

// Models
import { Asiento } from '../../../models/contabilidad/asiento.model';
import { DetalleAsiento } from '../../../models/contabilidad/detalle-asiento.model';
import { Cuenta } from 'src/app/models/contabilidad/cuenta.model';

// Agrega la interfaz o clase para el detalle del asiento
interface DetalleAsientoFormInterface {
  cuenta: number;
  descripcion: string;
  documento: string;
  documentod: string;
  debe: number;
  haber: number;
}

@Component({
  selector: 'app-asiento',
  templateUrl: './asiento.component.html',
  styles: [
  ]
})

export class AsientoComponent implements OnInit {

  public formSubmitted = false;
  public mostrarModal: boolean = true;
  public fechaActual: string;

  // Datos recuperados
  public asientos: Asiento[] = [];
  public allCuentas: Cuenta[] = [];

  // Modal Create Asiento
  public asientoForm: FormGroup;
  public detalleAsientoForm: FormGroup;
  public detalleAsientoFormInterface: DetalleAsientoFormInterface[] = [];
  public validacionDetallesRequeridos = false;
  public sumaTotalDebe: number = 0;
  public sumaTotalHaber: number = 0;
  public diferencia: number = 0;

  // Modal Update Asiento
  public asientoFormU: FormGroup;
  public asientoSeleccionado: Asiento;
  public detalles_asientos: DetalleAsiento[] = [];
  public id_asiento: number;
  public total_debe: number;
  public total_haber: number;
  public estado: boolean;

  // Paginación
  //public totalAsientos: number = 0; abajo
  public itemsPorPagina = 10;
  public paginaActual = 1;
  public paginas: number[] = [];
  public mostrarPaginacion: boolean = false;
  public maximoPaginasVisibles = 5;

  // Búsqueda y filtrado
  public buscarTexto: string = '';
  public allAsientos: Asiento[] = [];
  public fechaInicio: string;
  public fechaFin: string;
  public estadoSelect: string;

  public totalAsientos: number = 0;

  public asientosAux: Asiento[] = [];
  public totalAsientosAux: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,

    // Services
    private cuentaService: CuentaService,
    private asientoService: AsientoService,
    private detalleAsientoService: DetalleAsientoService,

    // Filtrado de asientos
    private datePipe: DatePipe,

  ) {
    this.asientoForm = this.fb.group({
      id_asiento: [''],
      fecha_asiento: ['', Validators.required],
      referencia: ['', [Validators.required, Validators.minLength(1)]],
      documento: ['', [Validators.required, Validators.minLength(1)]],
      observacion: [''],
    });

    this.asientoFormU = this.fb.group({
      //id_asiento: [''],
      fecha_asiento: ['', Validators.required],
      referencia: ['', [Validators.required, Validators.minLength(1)]],
      documento: ['', [Validators.required, Validators.minLength(1)]],
      observacion: [''],
    });

    this.detalleAsientoForm = this.fb.group({
      detalles: this.fb.array([]),
    });

  }

  ngOnInit(): void {
    this.cargarCuentasAll();
    this.cargarAsientos();
    this.cargarAsientosAll();

    const fechaActual = new Date();
    this.fechaActual = formatDate(fechaActual, 'd-M-yyyy', 'en-US', 'UTC-5');
  }

  // Método para cargar todas cuentas
  cargarCuentasAll() {
    this.cuentaService.loadCuentasAll()
      .subscribe(({ cuentas }) => {
        this.allCuentas = cuentas;
      });
  }

  // Método para cargar asientos paginados en Table Data Asiento
  cargarAsientos() {
    const desde = (this.paginaActual - 1) * this.itemsPorPagina;
    console.log("DESDE: ", desde)
    console.log("LIMIT", this.itemsPorPagina)
    this.asientoService.loadAsientos(desde, this.itemsPorPagina)
      .subscribe(({ asientos, totalAsientos }) => {
        this.asientos = asientos;
        this.totalAsientos = totalAsientos;
        this.calcularNumeroPaginas();
        this.mostrarPaginacion = this.totalAsientos > this.itemsPorPagina;
      });
  }

  // Método para cargar todas asientos en Table Data Asiento
  cargarAsientosAll() {
    this.asientoService.loadAsientosAll()
      .subscribe(({ asientos, totalAsientos }) => {
        this.allAsientos = asientos;
        this.totalAsientos = totalAsientos;
      });
  }

  // Método para borrar asiento en Table Date Asiento
  borrarAsiento(asiento: Asiento) {
    Swal.fire({
      title: '¿Borrar Asiento?',
      text: `Estas a punto de borrar a ${asiento.referencia}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.asientoService.deleteAsiento(asiento.id_asiento)
          .subscribe(resp => {
            this.cargarAsientos();
            Swal.fire({
              icon: 'success',
              title: 'Asiento Borrado',
              text: `${asiento.referencia} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar el asiento.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
          );
      }
    });
  }

  // Método para filtrar asientos en Table Date Asiento
  filtrarAsientos() {
    if (!this.asientosAux || this.asientosAux.length === 0) {
      // Inicializar las variables auxiliares una sola vez
      this.asientosAux = this.asientos;
      this.totalAsientosAux = this.totalAsientos;
    }
    if (this.buscarTexto.trim() === '' && !this.estadoSelect && (!this.fechaInicio || !this.fechaFin)) {
      // Restablecemos las variables principales con las auxiliares
      this.asientos = this.asientosAux;
      this.totalAsientos = this.totalAsientosAux;
    } else {
      // Reiniciamos variables
      this.totalAsientos = 0;

      this.asientos = this.allAsientos.filter((asiento) => {
        const regex = new RegExp(this.buscarTexto, 'i');
        const fechaAsiento = this.datePipe.transform(new Date(asiento.fecha_asiento), 'yyyy-MM-dd');

        console.log('🟩 ')
        console.log('asiento.estado ', asiento.estado)
        console.log(' this.estadoSelect ', this.estadoSelect)

        const pasaFiltro = (
          (asiento.id_asiento.toString().includes(this.buscarTexto) ||
            asiento.referencia.match(regex) !== null ||
            asiento.documento.match(regex) !== null) &&
          (!this.estadoSelect || asiento.estado === (this.estadoSelect === 'true')) &&
          (!this.fechaInicio || fechaAsiento >= this.fechaInicio) &&
          (!this.fechaFin || fechaAsiento <= this.fechaFin)
        );
        return pasaFiltro;
      });
    }
  }

  // Método para borrar fecha fin en Table Date Asiento
  borrarFechaFin() {
    this.fechaFin = null; // O establece el valor predeterminado deseado
    this.filtrarAsientos();
  }

  // Método para borrar fecha inicio en Table Date Asiento
  borrarFechaInicio() {
    this.fechaInicio = null; // O establece el valor predeterminado deseado
    this.filtrarAsientos();
  }

  // Método para obtener total páginas en Table Date Asiento
  get totalPaginas(): number {
    return Math.ceil(this.totalAsientos / this.itemsPorPagina);
  }

  // Método para calcular número de páginas en Table Date Asiento
  calcularNumeroPaginas() {
    if (this.totalAsientos === 0 || this.itemsPorPagina <= 0) {
      this.paginas = [];
      return;
    }
    const totalPaginas = Math.ceil(this.totalAsientos / this.itemsPorPagina);
    const halfVisible = Math.floor(this.maximoPaginasVisibles / 2);
    let startPage = Math.max(1, this.paginaActual - halfVisible);
    let endPage = Math.min(totalPaginas, startPage + this.maximoPaginasVisibles - 1);
    if (endPage - startPage + 1 < this.maximoPaginasVisibles) {
      startPage = Math.max(1, endPage - this.maximoPaginasVisibles + 1);
    }
    this.paginas = Array(endPage - startPage + 1).fill(0).map((_, i) => startPage + i);
  }

  // Método para cambiar items en Table Date Asiento
  changeItemsPorPagina() {
    this.cargarAsientos();
    this.paginaActual = 1;
  }

  // Método para cambiar página en Table Date Asiento
  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.cargarAsientos();
    }
  }

  // Método para obtener mínimo en Table Date Asiento
  getMinValue(): number {
    const minValue = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    return minValue;
  }

  // Método para obtener máximo en Table Date Asiento
  getMaxValue(): number {
    const maxValue = this.paginaActual * this.itemsPorPagina;
    return maxValue;
  }

  // Método para crear asiento en Modal Create Asiento
  crearAsiento() {
    this.formSubmitted = true;
    this.validacionDetallesRequeridos = true;

    if (this.detalleAsientoFormInterface.length < 2) {
      //alert("Se requieren al menos dos detalles para guardar el asiento contable.");
      return;
    }

    if (this.asientoForm.invalid) {
      console.log("Validar Formulario", this.asientoForm.value);
      return;
    }

    // Obtener los detalles del formulario
    this.obtenerDetallesForm()

    // Validar si todas las filas tienen contenido
    if (!this.validarContenidoFilas()) {
      alert('Todos los campos de la tabla deben estar llenos.');
      // Puedes manejar la lógica adicional aquí
      return;
    }

    // Calcular la suma total de "Debe" y "Haber"
    const sumaTotalDebe = this.detalleAsientoFormInterface.reduce((total, detalle) => total + detalle.debe, 0);
    const sumaTotalHaber = this.detalleAsientoFormInterface.reduce((total, detalle) => total + detalle.haber, 0);

    // Calcular la diferencia
    const diferencia = sumaTotalDebe - sumaTotalHaber;

    // Validar si la suma de "Debe" es igual a la suma de "Haber" o si la diferencia es cero
    if (sumaTotalDebe !== sumaTotalHaber || diferencia !== 0) {
      alert('La suma total de "Debe" debe ser igual a la suma total de "Haber" o la diferencia debe ser cero.');
      // Puedes manejar la lógica adicional aquí
      return;
    }

    this.asientoService.createAsiento(this.asientoForm.value).subscribe(
      (res: any) => {
        const asientoId = res.id_asiento; // Obtener el ID del asiento guardado
        console.log('ASIENTOID')
        console.log(asientoId)
        console.log('DETALLES ASIENTO 222222')
        console.log(this.detalleAsientoFormInterface)
        // Crear los detalles y asociarlos al asiento
        const detalles = [];
        for (const detalle of this.detalleAsientoFormInterface) {
          const nuevoDetalle: DetalleAsiento = {
            id_asiento: asientoId,
            id_cuenta: detalle.cuenta,
            descripcion: detalle.descripcion,
            documento: null,
            documentod: detalle.documentod,
            debe: detalle.debe,
            haber: detalle.haber
          };
          detalles.push(nuevoDetalle);
        }
        console.log('DETALLES CON ID_ASIENTO')
        console.log(detalles)
        this.detalleAsientoService.createDetalleAsientoArray(detalles).subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Asiento Creado',
              text: 'El asiento se han creado correctamente.',
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
            this.cerrarModal();
          }, (err) => {
            const errorMessage = err.error?.msg || 'Se produjo un error al crear el asiento.';
            Swal.fire('Error', errorMessage, 'error');
          }
        );
        //this.recargarComponente();
      },
      (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al crear el asiento 2.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }

  // Método para validar el contendo en la tabla en Modal Create Asiento
  validarContenidoFilas(): boolean {
    return this.detalleAsientoFormInterface.every(detalle =>
      detalle.cuenta !== null &&
      detalle.descripcion !== null &&
      detalle.documentod !== null &&
      detalle.debe !== null &&
      detalle.haber !== null
    );
  }

  // Método para obtener detalles en Modal Create Asiento
  obtenerDetallesForm() {
    const formValues = this.detalleAsientoForm.getRawValue();

    // Obtener el número de detalles
    const numDetalles2 = Object.keys(formValues).filter(key => key.startsWith('cuenta_')).length;

    // Reiniciar el arreglo detalleAsiento2
    this.detalleAsientoFormInterface = [];

    for (let i = 0; i < numDetalles2; i++) {
      const nuevoDetalle: DetalleAsientoFormInterface = {
        cuenta: formValues[`cuenta_${i}`],
        descripcion: formValues[`descripcion_${i}`],
        documentod: formValues[`documentod_${i}`],
        documento: null,
        debe: formValues[`debe_${i}`],
        haber: formValues[`haber_${i}`]
      };
      this.detalleAsientoFormInterface.push(nuevoDetalle);
    }
    //this.detalleAsientoForm.reset();
  }

  // Método agregar detalle en Modal Create Asiento
  agregarDetalleForm(): void {
    this.formSubmitted = true;
    if (this.detalleAsientoForm.invalid) {
      console.log('RETURN')
      return;
    }

    const nuevoDetalle: DetalleAsientoFormInterface = {
      cuenta: null,
      descripcion: null,
      documento: null,
      documentod: null,
      debe: null,
      haber: null
    };

    // Crear instancias de FormControl para cada propiedad del detalle
    const cuentaControl = new FormControl(nuevoDetalle.cuenta);
    const descripcionControl = new FormControl(nuevoDetalle.descripcion);
    const documentodControl = new FormControl(nuevoDetalle.documentod);
    const debeControl = new FormControl(nuevoDetalle.debe);
    const haberControl = new FormControl(nuevoDetalle.haber);

    // Agregar los controles al formulario
    this.detalleAsientoForm.addControl('cuenta_' + this.detalleAsientoFormInterface.length, cuentaControl);
    this.detalleAsientoForm.addControl('descripcion_' + this.detalleAsientoFormInterface.length, descripcionControl);
    this.detalleAsientoForm.addControl('documentod_' + this.detalleAsientoFormInterface.length, documentodControl);
    this.detalleAsientoForm.addControl('debe_' + this.detalleAsientoFormInterface.length, debeControl);
    this.detalleAsientoForm.addControl('haber_' + this.detalleAsientoFormInterface.length, haberControl);

    nuevoDetalle.cuenta = cuentaControl.value;
    nuevoDetalle.descripcion = descripcionControl.value;
    nuevoDetalle.documentod = documentodControl.value;
    nuevoDetalle.debe = debeControl.value;
    nuevoDetalle.haber = haberControl.value;

    // Agregar el detalle al arreglo
    this.detalleAsientoFormInterface.push(nuevoDetalle);
  }

  // Método para eliminar detalle en Modal Create Asiento
  eliminarDetalle(index: number): void {
    this.detalleAsientoForm.removeControl('cuenta_' + index);
    this.detalleAsientoForm.removeControl('descripcion_' + index);
    this.detalleAsientoForm.removeControl('documentod_' + index);
    this.detalleAsientoForm.removeControl('debe_' + index);
    this.detalleAsientoForm.removeControl('haber_' + index);
    this.detalleAsientoFormInterface.splice(index, 1);
  }

  // Método para actualizar en Modal Create Asiento
  actualizarTotalDebe() {
    this.sumaTotalDebe = 0;
    for (let i = 0; i < this.detalleAsientoFormInterface.length; i++) {
      const debeControl = this.detalleAsientoForm.get(`debe_${i}`);
      if (debeControl) {
        const debe = debeControl.value || 0;
        this.sumaTotalDebe += debe;
      }
      console.log(this.sumaTotalDebe)
    }
  }

  // Método para actualizar en Modal Create Asiento
  actualizarTotalHaber() {
    this.sumaTotalHaber = 0;
    for (let i = 0; i < this.detalleAsientoFormInterface.length; i++) {
      const haberControl = this.detalleAsientoForm.get(`haber_${i}`);
      if (haberControl) {
        const haber = haberControl.value || 0;
        this.sumaTotalHaber += haber;
      }
      console.log(this.sumaTotalHaber)
    }
  }

  // Método para actualizar en Modal Create Asiento
  actualizarDiferencia() {
    this.diferencia = this.sumaTotalDebe - this.sumaTotalHaber;
    console.log("debe", this.sumaTotalDebe)
    console.log("haber", this.sumaTotalHaber)
    console.log("diferencias", this.diferencia)
  }

  // Método para actualizar asiento en Modal Update Asiento
  actualizarAsiento() {
    if (this.asientoFormU.invalid) {
      return;
    }
    const data = {
      ...this.asientoFormU.value,
      id_asiento: this.asientoSeleccionado.id_asiento
    }

    // realizar posteo
    this.asientoService.updateAsiento(data)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Asiento Actualizado',
          text: 'Asiento se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        //this.router.navigateByUrl(`/dashboard/asientos`)
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al actualizar el asiento.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  // Método para cargar detalles asiento por id asiento en Modal Update Asiento
  cargarDetallesAsientoByIdAsiento(id_asiento: any) {
    this.detalleAsientoService.loadDetallesAsientoByIdAsiento(id_asiento)
      .subscribe(({ detalles_asientos, total_debe, total_haber }) => {
        this.detalles_asientos = detalles_asientos;
        this.total_debe = total_debe;
        this.total_haber = total_haber;
        console.log("detalles_asientos: ", detalles_asientos)
        console.log("total_debe: ", total_debe)
        console.log("total_haber: ", total_haber)
      })
  }

  // Método para cargar asiento en Modal Update Asiento
  cargarAsientoPorId(id_asiento: any) {
    this.asientoService.loadAsientoById(id_asiento)
      .subscribe(asiento => {
        const { id_asiento, fecha_asiento, referencia, documento, observacion, estado } = asiento[0];
        this.asientoSeleccionado = asiento[0];
        this.id_asiento = id_asiento;
        this.estado = estado;
        console.log("Estado", estado)
        this.asientoFormU.setValue({ fecha_asiento, referencia, documento, observacion })
        this.asientoFormU.get('fecha_asiento').setValue(this.datePipe.transform(fecha_asiento, 'yyyy-MM-dd'));
      });
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
      this.router.navigate(['/dashboard/asientos']);
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
