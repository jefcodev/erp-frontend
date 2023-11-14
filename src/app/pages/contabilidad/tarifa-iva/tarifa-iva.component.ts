import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { TarifaIVA } from '../../../models/contabilidad/tarifa-iva.model';
import { TarifaIVAService } from 'src/app/services/contabilidad/tarifa-iva.service';

@Component({
  selector: 'app-tarifa-iva',
  templateUrl: './tarifa-iva.component.html',
  styles: [
  ]
})

export class TarifaIVAComponent implements OnInit {

  public formSubmitted = false;
  public mostrarModal = false;

  tarifaIVAForm: FormGroup;
  tarifaIVAFormU: FormGroup;
  public tarifasIVA: TarifaIVA[] = [];
  public tarifaIVASeleccionado: TarifaIVA;

  // Paginación
  // public totalTarifasIVA: number = 0; abajo
  public itemsPorPagina = 10;
  public paginaActual = 1;
  public paginas: number[] = [];
  public mostrarPaginacion: boolean = false;
  public maximoPaginasVisibles = 5;

  // Búsqueda y filtrado
  public buscarTexto: string = '';
  public allTarifasIVA: TarifaIVA[] = [];
  public estadoSelect: string;

  public totalTarifasIVA: number = 0;

  public formasPagoAux: TarifaIVA[] = [];
  public totalTarifasIVAAux: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,

    private tarifaIVAService: TarifaIVAService,

  ) {
    this.tarifaIVAForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(0)]],
      descripcion: ['', [Validators.required, Validators.minLength(0)]],
      porcentaje: ['', [Validators.required, Validators.minLength(0)]],
    });

    this.tarifaIVAFormU = this.fb.group({
      codigo: [''],
      descripcion: ['', [Validators.required, Validators.minLength(0)]],
      porcentaje: ['', [Validators.required, Validators.minLength(0)]],
    });
  }

  ngOnInit(): void {
    this.cargarTarifasIVA();
    this.cargarTarifasIVAAll();
  }

  cargarTarifasIVA() {
    const desde = (this.paginaActual - 1) * this.itemsPorPagina;
    this.tarifaIVAService.loadTarifasIVA(desde, this.itemsPorPagina)
      .subscribe(({ tarifas_iva, total }) => {
        this.tarifasIVA = tarifas_iva;
        this.totalTarifasIVA = total;
        this.calcularNumeroPaginas();
        this.mostrarPaginacion = this.totalTarifasIVA > this.itemsPorPagina;
      });
  }

  cargarTarifasIVAAll() {
    this.tarifaIVAService.loadTarifasIVAAll()
      .subscribe(({ tarifas_iva }) => {
        this.allTarifasIVA = tarifas_iva;
      });
  }

  cargarTarifaIVAPorId(id_tarifa_iva: any) {
    this.tarifaIVAService.loadTarifaIVAById(id_tarifa_iva)
      .subscribe(tarifa_iva => {
        const { codigo, descripcion, porcentaje } = tarifa_iva[0];
        this.tarifaIVASeleccionado = tarifa_iva[0];
        this.tarifaIVAFormU.setValue({ codigo, descripcion, porcentaje })
      })
  }

  crearTarifaIVA() {
    this.formSubmitted = true;
    if (this.tarifaIVAForm.invalid) {
      return;
    }
    // realizar posteo
    this.tarifaIVAService.createTarifaIVA(this.tarifaIVAForm.value).subscribe(
      res => {
        Swal.fire({
          icon: 'success',
          title: 'Tarifa IVA Creado',
          text: 'Tarifa IVA se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al crear la tarifa IVA.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }

  actualizarTarifaIVA() {
    this.formSubmitted = true;
    if (this.tarifaIVAFormU.invalid) {
      return;
    }
    const data = {
      ...this.tarifaIVAFormU.value,
      id_tarifa_iva: this.tarifaIVASeleccionado.id_tarifa_iva
    }
    this.tarifaIVAService.updateTarifaIVA(data).subscribe(
      res => {
        Swal.fire({
          icon: 'success',
          title: 'Tarifa IVA Actualizado',
          text: 'Tarifa IVA se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        //this.router.navigateByUrl(`/dashboard/tarifas_iva`)
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al actualizar la tarifa IVA.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }


  borrarTarifaIVA(tarifa_iva: TarifaIVA) {
    Swal.fire({
      title: '¿Borrar Tarifa IVA?',
      text: `Estas a punto de borrar a ${tarifa_iva.descripcion}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.tarifaIVAService.deleteTarifaIVA(tarifa_iva.id_tarifa_iva).subscribe(
          resp => {
            this.cargarTarifasIVA();
            Swal.fire({
              icon: 'success',
              title: 'Tarifa IVA Borrado',
              text: `${tarifa_iva.descripcion} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
          }, (err) => {
            const errorMessage = err.error?.msg || 'Se produjo un error al borrar la tarifa IVA.';
            Swal.fire('Error', errorMessage, 'error');
          }
        );
      }
    });
  }

  activarTarifaIVA(tarifa_iva: TarifaIVA) {
    Swal.fire({
      title: '¿Activar Tarifa IVA?',
      text: `Estas a punto de avtivar a ${tarifa_iva.descripcion}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.tarifaIVAService.deleteTarifaIVA(tarifa_iva.id_tarifa_iva).subscribe(
          resp => {
            this.cargarTarifasIVA();
            Swal.fire({
              icon: 'success',
              title: 'Tarifa IVA Activada',
              text: `${tarifa_iva.descripcion} ha sido activada correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
          }, (err) => {
            const errorMessage = err.error?.msg || 'Se produjo un error al activar la tarifa IVA.';
            Swal.fire('Error', errorMessage, 'error');
          }
        );
      }
    });
  }

  filtrarTarifasIVA() {
    if (!this.formasPagoAux || this.formasPagoAux.length === 0) {
      // Inicializar las variables auxiliares una sola vez
      this.formasPagoAux = this.tarifasIVA;
      this.totalTarifasIVAAux = this.totalTarifasIVA;
    }
    if (this.buscarTexto.trim() === '' && !this.estadoSelect) {
      // Restablecemos las variables principales con las auxiliares
      this.tarifasIVA = this.formasPagoAux;
      this.totalTarifasIVA = this.totalTarifasIVAAux;
    } else {
      // Reiniciamos variables
      this.totalTarifasIVA = 0;

      this.tarifasIVA = this.allTarifasIVA.filter((tarifaIVA) => {
        const regex = new RegExp(this.buscarTexto, 'i');

        const pasaFiltro = (
          (tarifaIVA.codigo === parseInt(this.buscarTexto) ||
            tarifaIVA.descripcion.match(regex) !== null ||
            tarifaIVA.porcentaje === parseFloat(this.buscarTexto)) &&
          (!this.estadoSelect || tarifaIVA.estado === (this.estadoSelect === 'true'))
        );
        return pasaFiltro;
      });
    }
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalTarifasIVA / this.itemsPorPagina);
  }

  calcularNumeroPaginas() {
    if (this.totalTarifasIVA === 0 || this.itemsPorPagina <= 0) {
      this.paginas = [];
      return;
    }
    const totalPaginas = Math.ceil(this.totalTarifasIVA / this.itemsPorPagina);
    const halfVisible = Math.floor(this.maximoPaginasVisibles / 2);
    let startPage = Math.max(1, this.paginaActual - halfVisible);
    let endPage = Math.min(totalPaginas, startPage + this.maximoPaginasVisibles - 1);
    if (endPage - startPage + 1 < this.maximoPaginasVisibles) {
      startPage = Math.max(1, endPage - this.maximoPaginasVisibles + 1);
    }
    this.paginas = Array(endPage - startPage + 1).fill(0).map((_, i) => startPage + i);
  }

  changeItemsPorPagina() {
    this.cargarTarifasIVA();
    this.paginaActual = 1;
  }

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.cargarTarifasIVA();
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
      this.router.navigate(['/dashboard/tarifas-iva']);
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
