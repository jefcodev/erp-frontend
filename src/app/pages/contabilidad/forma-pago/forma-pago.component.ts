import { Component, OnInit, Renderer2 } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { FormaPago } from '../../../models/contabilidad/forma-pago.model';
import { FormaPagoService } from 'src/app/services/contabilidad/forma-pago.service';

@Component({
  selector: 'app-forma-pago',
  templateUrl: './forma-pago.component.html',
  styles: [
  ]
})

export class FormaPagoComponent implements OnInit {

  public formSubmitted = false;
  public mostrarModal = false;

  public formasPago: FormaPago[] = [];
  public formaPagoSeleccionado: FormaPago;
  public ocultarModal: boolean = true;

  formaPagoForm: FormGroup;
  formaPagoFormU: FormGroup;

  // Paginación
  // public totalFormasPago: number = 0; abajo
  public itemsPorPagina = 10;
  public paginaActual = 1;
  public paginas: number[] = [];
  public mostrarPaginacion: boolean = false;
  public maximoPaginasVisibles = 5;

  // Búsqueda y filtrado
  public buscarTexto: string = '';
  public allFormasPago: FormaPago[] = [];
  public estadoSelect: string;

  public totalFormasPago: number = 0;

  public formasPagoAux: FormaPago[] = [];
  public totalFormasPagoAux: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,

    private formaPagoService: FormaPagoService,
  ) {
    this.formaPagoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.formaPagoFormU = this.fb.group({
      codigo: [''],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.cargarFormasPago();
    this.cargarFormasPagoAll();
  }

  cargarFormasPago() {
    const desde = (this.paginaActual - 1) * this.itemsPorPagina;
    this.formaPagoService.loadFormasPago(desde, this.itemsPorPagina)
      .subscribe(({ formas_pago, total }) => {
        this.formasPago = formas_pago;
        this.totalFormasPago = total;
        this.calcularNumeroPaginas();
        this.mostrarPaginacion = this.totalFormasPago > this.itemsPorPagina;
      });
  }

  cargarFormasPagoAll() {
    this.formaPagoService.loadFormasPagoAll()
      .subscribe(({ formas_pago }) => {
        this.allFormasPago = formas_pago;
      });
  }

  cargarFormaPagoPorId(id_forma_pago: any) {
    this.formaPagoService.loadFormaPagoById(id_forma_pago)
      .subscribe(forma_pago => {
        const { codigo, descripcion } = forma_pago[0];
        this.formaPagoSeleccionado = forma_pago[0];
        this.formaPagoFormU.setValue({ codigo, descripcion })
      })
  }

  crearFormaPago() {
    this.formSubmitted = true;
    if (this.formaPagoForm.invalid) {
      return;
    }
    this.formaPagoService.createFormaPago(this.formaPagoForm.value).subscribe(
      res => {
        Swal.fire({
          icon: 'success',
          title: 'Forma de Pago creado',
          text: 'Forma de Pago se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al crear la forma de pago.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }

  actualizarFormaPago() {
    this.formSubmitted = true;
    if (this.formaPagoFormU.invalid) {
      return;
    }
    const data = {
      ...this.formaPagoFormU.value,
      id_forma_pago: this.formaPagoSeleccionado.id_forma_pago
    }
    this.formaPagoService.updateFormaPago(data).subscribe(
      res => {
        Swal.fire({
          icon: 'success',
          title: 'Forma de Pago actualizado',
          text: 'Forma de Pago se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al actualizar la forma de pago.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }

  borrarFormaPago(forma_pago: FormaPago) {
    Swal.fire({
      title: '¿Borrar Forma de Pago?',
      text: `Estas a punto de borrar a ${forma_pago.descripcion}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.formaPagoService.deleteFormaPago(forma_pago.id_forma_pago).subscribe(
          resp => {
            this.cargarFormasPago();
            Swal.fire({
              icon: 'success',
              title: 'Forma de Pago Borrado',
              text: `${forma_pago.codigo} ${forma_pago.descripcion} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente()
          }, (err) => {
            const errorMessage = err.error?.msg || 'Se produjo un error al borrar la forma de pago.';
            Swal.fire('Error', errorMessage, 'error');
          }
        );
      }
    });
  }

  activarFormaPago(formaPago: FormaPago) {
    Swal.fire({
      title: '¿Activar Forma de Pago?',
      text: `Estas a punto de activar a ${formaPago.codigo} - ${formaPago.descripcion}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.formaPagoService.deleteFormaPago(formaPago.id_forma_pago).subscribe(
          () => {
            this.cargarFormasPago();
            Swal.fire({
              icon: 'success',
              title: 'Forma de Pago Activado',
              text: `${formaPago.codigo} - ${formaPago.descripcion} ha sido activado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
          }, (err) => {
            const errorMessage = err.error?.msg || 'Se produjo un error al activar la forma de pago.';
            Swal.fire('Error', errorMessage, 'error');
          }
        );
      }
    });
  }

  // Método para filtrar cuentas en Table Date Cuenta
  filtrarFormasPago() {
    if (!this.formasPagoAux || this.formasPagoAux.length === 0) {
      // Inicializar las variables auxiliares una sola vez
      this.formasPagoAux = this.formasPago;
      this.totalFormasPagoAux = this.totalFormasPago;
    }
    if (this.buscarTexto.trim() === '' && !this.estadoSelect) {
      // Restablecemos las variables principales con las auxiliares
      this.formasPago = this.formasPagoAux;
      this.totalFormasPago = this.totalFormasPagoAux;
    } else {
      // Reiniciamos variables
      this.totalFormasPago = 0;

      this.formasPago = this.allFormasPago.filter((formaPago) => {
        const regex = new RegExp(this.buscarTexto, 'i');

        const pasaFiltro = (
          (formaPago.codigo.match(regex) !== null ||
            formaPago.descripcion.match(regex) !== null) &&
          (!this.estadoSelect || formaPago.estado === (this.estadoSelect === 'true'))
        );
        return pasaFiltro;
      });
    }
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalFormasPago / this.itemsPorPagina);
  }

  calcularNumeroPaginas() {
    if (this.totalFormasPago === 0 || this.itemsPorPagina <= 0) {
      this.paginas = [];
      return;
    }
    const totalPaginas = Math.ceil(this.totalFormasPago / this.itemsPorPagina);
    const halfVisible = Math.floor(this.maximoPaginasVisibles / 2);
    let startPage = Math.max(1, this.paginaActual - halfVisible);
    let endPage = Math.min(totalPaginas, startPage + this.maximoPaginasVisibles - 1);
    if (endPage - startPage + 1 < this.maximoPaginasVisibles) {
      startPage = Math.max(1, endPage - this.maximoPaginasVisibles + 1);
    }
    this.paginas = Array(endPage - startPage + 1).fill(0).map((_, i) => startPage + i);
  }

  changeItemsPorPagina() {
    this.cargarFormasPago();
    this.paginaActual = 1;
  }

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.cargarFormasPago();
    }
  }

  getMinValue(): number {
    const minValue = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    return minValue;
  }

  getMaxValue(): number {
    const maxValue = this.paginaActual * this.itemsPorPagina;
    return maxValue;
  }

  convertirAMayusculas(event: any) {
    const inputValue = event.target.value;
    const upperCaseValue = inputValue.toUpperCase();
    event.target.value = upperCaseValue;
  }

  campoNoValido(campo: string, form: FormGroup): boolean {
    if (form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/formas-pago']);
    });
  }


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
