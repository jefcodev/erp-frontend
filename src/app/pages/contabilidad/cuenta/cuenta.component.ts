import { Component, OnInit, ElementRef, ViewChild, HostListener, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SweetAlertIcon } from 'sweetalert2';
import { formatDate, DatePipe } from '@angular/common';
import { switchMap, concatMap } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

// Models
import { Cuenta } from '../../../models/contabilidad/cuenta.model';

// Services
import { CuentaService } from '../../../services/contabilidad/cuenta.service';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.component.html',
  styles: [
  ]
})

export class CuentaComponent implements OnInit {

  public formSubmitted = false;
  public mostrarModal: boolean = true;

  // Datos recuperados
  public cuentas: Cuenta[] = [];

  // Modal Create Cuenta
  cuentaForm: FormGroup;

  // Modal Update Cuenta
  public cuentaSeleccionada: Cuenta;
  public cuentaFormU: FormGroup;

  // Paginación
  //public totalCuentas: number = 0; abajo
  public itemsPorPagina = 10;
  public paginaActual = 1;
  public paginas: number[] = [];
  public mostrarPaginacion: boolean = false;
  public maximoPaginasVisibles = 5;

  // Búsqueda y filtrado
  public buscarTexto: string = '';
  public allCuentas: Cuenta[] = [];
  public estadoSelect: string;

  public totalCuentas: number = 0;

  public cuentasAux: Cuenta[] = [];
  public totalCuentasAux: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,

    // Services
    private cuentaService: CuentaService,

    // Filtrado de cuentas
    //private datePipe: DatePipe,

  ) {
    this.cuentaForm = this.fb.group({
      id_cuenta: [''], // Add this line to include the 'id_cuenta' field
      codigo: ['', [Validators.required, Validators.minLength(1)]],
      descripcion: ['', [Validators.required, Validators.minLength(1)]],
      cuenta_padre: ['', [Validators.required, Validators.minLength(1)]],
    });

    this.cuentaFormU = this.fb.group({
      //id_cuenta: [''], // Add this line to include the 'id_cuenta' field
      codigo: ['', [Validators.required, Validators.minLength(1)]],
      descripcion: ['', [Validators.required, Validators.minLength(1)]],
      cuenta_padre: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit(): void {
    this.cargarCuentas();
    this.cargarCuentasAll();
  }

  cargarCuentas() {
    const desde = (this.paginaActual - 1) * this.itemsPorPagina;
    console.log("DESDE: ", desde)
    console.log("LIMIT", this.itemsPorPagina)
    this.cuentaService.loadCuentas(desde, this.itemsPorPagina)
      .subscribe(({ cuentas, totalCuentas }) => {
        this.cuentas = cuentas;
        this.totalCuentas = totalCuentas;
        this.calcularNumeroPaginas();
        this.mostrarPaginacion = this.totalCuentas > this.itemsPorPagina;
      });
  }

  // Método para cargar todas cuentas
  cargarCuentasAll() {
    this.cuentaService.loadCuentasAll()
      .subscribe(({ cuentas, totalCuentas }) => {
        this.allCuentas = cuentas;
        this.totalCuentas = totalCuentas;
      });
  }

  cargarCuentaPorId(id_cuenta: any) {
    this.cuentaService.loadCuentaById(id_cuenta)
      .subscribe(cuenta => {
        const { codigo, descripcion, cuenta_padre } = cuenta[0];
        this.cuentaSeleccionada = cuenta[0];
        this.cuentaFormU.setValue({ codigo, descripcion, cuenta_padre })
      })
  }

  cargarCodigo(codigo: any) {
    this.cuentaService.loadCuentaByCodigo(codigo)
      .subscribe(cuenta => {
        if (Array.isArray(cuenta) && cuenta.length > 0) {
          const { codigo, descripcion, cuenta_padre } = cuenta[0];
          const parts = codigo.split(".");
          const lastPart = parseInt(parts[parts.length - 1], 10);
          const newLastPart = lastPart + 1;

          parts[parts.length - 1] = newLastPart.toString();

          const newCodigo = parts.join(".");

          this.cuentaForm.controls['codigo'].setValue(newCodigo);
        } else {
          console.error("No se encontró ninguna cuenta con el código especificado.");
          this.cuentaForm.controls['codigo'].setValue(codigo + ".1");
        }
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al cargar la cuenta.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');

      });
  }

  cargarCuentaPadre(cuentaId: any) {
    const value = (event.target as HTMLSelectElement).value;
    this.cuentaService.loadCuentaById(value)
      .subscribe(cuenta => {
        const { codigo, descripcion, cuenta_padre } = cuenta[0];
        this.cuentaForm.controls['cuenta_padre'].setValue(codigo);
        this.cargarCodigo(codigo)
      });
  }


  // Método para filtrar cuentas en Table Date Cuenta
  filtrarCuentas() {
    if (!this.cuentasAux || this.cuentasAux.length === 0) {
      // Inicializar las variables auxiliares una sola vez
      this.cuentasAux = this.cuentas;
      this.totalCuentasAux = this.totalCuentas;
    }
    if (this.buscarTexto.trim() === '' && !this.estadoSelect) {
      // Restablecemos las variables principales con las auxiliares
      this.cuentas = this.cuentasAux;
      this.totalCuentas = this.totalCuentasAux;
    } else {
      // Reiniciamos variables
      this.totalCuentas = 0;

      this.cuentas = this.allCuentas.filter((cuenta) => {
        const regex = new RegExp(this.buscarTexto, 'i');

        const pasaFiltro = (
          (cuenta.codigo.match(regex) !== null || cuenta.descripcion.match(regex) !== null) &&
          (!this.estadoSelect || cuenta.estado === (this.estadoSelect === 'true'))
        );
        return pasaFiltro;
      });
    }
  }

  // Método para obtener total páginas en Table Date Cuenta
  get totalPaginas(): number {
    return Math.ceil(this.totalCuentas / this.itemsPorPagina);
  }

  // Método para calcular número de páginas en Table Date Cuenta
  calcularNumeroPaginas() {
    if (this.totalCuentas === 0 || this.itemsPorPagina <= 0) {
      this.paginas = [];
      return;
    }
    const totalPaginas = Math.ceil(this.totalCuentas / this.itemsPorPagina);
    const halfVisible = Math.floor(this.maximoPaginasVisibles / 2);
    let startPage = Math.max(1, this.paginaActual - halfVisible);
    let endPage = Math.min(totalPaginas, startPage + this.maximoPaginasVisibles - 1);
    if (endPage - startPage + 1 < this.maximoPaginasVisibles) {
      startPage = Math.max(1, endPage - this.maximoPaginasVisibles + 1);
    }
    this.paginas = Array(endPage - startPage + 1).fill(0).map((_, i) => startPage + i);
  }

  // Método para cambiar items en Table Date Cuenta
  changeItemsPorPagina() {
    this.cargarCuentas();
    this.paginaActual = 1;
  }

  // Método para cambiar página en Table Date Cuenta
  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.cargarCuentas();
    }
  }

  // Método para obtener mínimo en Table Date Cuenta
  getMinValue(): number {
    const minValue = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    return minValue;
  }

  // Método para obtener máximo en Table Date Cuenta
  getMaxValue(): number {
    const maxValue = this.paginaActual * this.itemsPorPagina;
    return maxValue;
  }

  crearCuenta() {
    this.formSubmitted = true;
    if (this.cuentaForm.invalid) {
      return;
    }
    // realizar posteo
    this.cuentaService.createCuenta(this.cuentaForm.value)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Cuenta Creada',
          text: 'Cuenta se ha creada correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al crear la cuenta.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    //this.recargarComponente();
  }

  actualizarCuenta() {
    this.formSubmitted = true;
    if (this.cuentaFormU.invalid) {
      return;
    }
    const data = {
      ...this.cuentaFormU.value,
      id_cuenta: this.cuentaSeleccionada.id_cuenta
    }

    this.cuentaService.updateCuenta(data)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Cuenta Actualizada',
          text: 'Cuenta se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        //this.router.navigateByUrl(`/dashboard/cuentas`)
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        let errorMessage = 'Se produjo un error al actualizar la cuenta.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  borrarCuenta(cuenta: Cuenta) {
    Swal.fire({
      title: '¿Borrar Cuenta?',
      text: `Estas a punto de borrar ${cuenta.codigo} - ${cuenta.descripcion}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.cuentaService.deleteCuenta(cuenta.id_cuenta)
          .subscribe(resp => {
            this.cargarCuentas();
            Swal.fire({
              icon: 'success',
              title: 'Cuenta Borrada',
              text: `${cuenta.codigo} - ${cuenta.descripcion} ha sido borrada correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar la cuenta.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
          );
      }
    });
  }

  activarCuenta(cuenta: Cuenta) {
    Swal.fire({
      title: '¿Activar Cuenta?',
      text: `Estas a punto de activar ${cuenta.codigo} - ${cuenta.descripcion}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.cuentaService.deleteCuenta(cuenta.id_cuenta).subscribe(
          () => {
            this.cargarCuentas();
            Swal.fire({
              icon: 'success',
              title: 'Cuenta Activada',
              text: `${cuenta.codigo} - ${cuenta.descripcion} ha sido activada correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
          }, (err) => {
            const errorMessage = err.error?.msg || 'Se produjo un error al activar la cuenta.';
            Swal.fire('Error', errorMessage, 'error');
          }
        );
      }
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
      this.router.navigate(['/dashboard/cuentas']);
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
