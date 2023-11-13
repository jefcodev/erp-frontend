import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Cliente } from '../../../models/venta/cliente.model';
import { ClienteService } from 'src/app/services/venta/cliente.service';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styles: []
})

export class ClienteComponent implements OnInit {

  public formSubmitted = false;
  public mostrarModal = false;

  public clienteForm: FormGroup;
  public clienteFormU: FormGroup;
  public clientes: Cliente[] = [];
  public clienteSeleccionado: Cliente;

  // Paginación
  // public totalClientes: number = 0; abajo
  public itemsPorPagina = 10;
  public paginaActual = 1;
  public paginas: number[] = [];
  public mostrarPaginacion: boolean = false;
  public maximoPaginasVisibles = 5;

  // Búsqueda y filtrado
  public buscarTexto: string = '';
  public allClientes: Cliente[] = [];
  public estadoSelect: string;

  public totalClientes: number = 0;

  public clientesAux: Cliente[] = [];
  public totalClientesAux: number = 0;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clienteService: ClienteService,
    private renderer: Renderer2,
  ) {
    this.clienteForm = this.fb.group({
      identificacion: ['1007671628', [Validators.required, Validators.minLength(3)]],
      razon_social: ['ALEX LANCHIMBA', [Validators.required, Validators.minLength(3)]],
      direccion: ['Quito', [Validators.required, Validators.minLength(3)]],
      telefono: ['0978812129', [Validators.required, Validators.minLength(3)]],
      email: ['ailanchimbaa@utn.edu.ec', [Validators.required, Validators.email]],
    });

    this.clienteFormU = this.fb.group({
      identificacion: ['', [Validators.required, Validators.minLength(3)]],
      razon_social: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarClientesAll();
  }

  cargarClientes() {
    const desde = (this.paginaActual - 1) * this.itemsPorPagina;
    this.clienteService.loadClientes(desde, this.itemsPorPagina)
      .subscribe(({ clientes, total }) => {
        this.clientes = clientes;
        this.totalClientes = total;
        this.calcularNumeroPaginas();
        this.mostrarPaginacion = this.totalClientes > this.itemsPorPagina;
      });
  }

  cargarClientesAll() {
    this.clienteService.loadClientesAll()
      .subscribe(({ clientes }) => {
        this.allClientes = clientes;
      });
  }

  cargarClientePorId(id_cliente: any) {
    this.clienteService.loadClienteById(id_cliente)
      .subscribe(cliente => {
        const { identificacion, razon_social, direccion, telefono, email } = cliente[0];
        this.clienteSeleccionado = cliente[0];
        this.clienteFormU.setValue({ identificacion, razon_social, direccion, telefono, email })
      })
  }

  crearCliente() {
    this.formSubmitted = true;
    if (this.clienteForm.invalid) {
      return;
    }
    this.clienteService.createCliente(this.clienteForm.value).subscribe(
      () => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente Creado',
          text: 'Cliente se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al crear el cliente.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }

  actualizarCliente() {
    this.formSubmitted = true;
    if (this.clienteFormU.invalid) {
      return;
    }
    const data = {
      ...this.clienteFormU.value,
      id_cliente: this.clienteSeleccionado.id_cliente
    }
    this.clienteService.updateCliente(data).subscribe(
      () => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente actualizado',
          text: 'Cliente se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al actualizar el cliente.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }

  filtrarClientes() {
    if (!this.clientesAux || this.clientesAux.length === 0) {
      // Inicializar las variables auxiliares una sola vez
      this.clientesAux = this.clientes;
      this.totalClientesAux = this.totalClientes;
    }
    if (this.buscarTexto.trim() === '' && !this.estadoSelect) {
      // Restablecemos las variables principales con las auxiliares
      this.clientes = this.clientesAux;
      this.totalClientes = this.totalClientesAux;
    } else {
      // Reiniciamos variables
      this.totalClientes = 0;

      this.clientes = this.allClientes.filter((cliente) => {
        const regex = new RegExp(this.buscarTexto, 'i');

        const pasaFiltro = (
          (cliente.razon_social.toLowerCase().includes(this.buscarTexto.toLowerCase()) ||
            cliente.identificacion.includes(this.buscarTexto) ||
            cliente.direccion.match(regex) !== null ||
            cliente.telefono.includes(this.buscarTexto) ||
            cliente.email.includes(this.buscarTexto)) &&
          (!this.estadoSelect || cliente.estado === (this.estadoSelect === 'true'))
        );
        return pasaFiltro;
      });
    }
  }

  borrarCliente(cliente: Cliente) {
    Swal.fire({
      title: '¿Borrar Cliente?',
      text: `Estas a punto de borrar a ${cliente.razon_social}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.clienteService.deleteCliente(cliente.id_cliente).subscribe(
          () => {
            this.cargarClientes();
            Swal.fire({
              icon: 'success',
              title: 'Cliente Borrado',
              text: `${cliente.razon_social} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
          }, (err) => {
            const errorMessage = err.error?.msg || 'Se produjo un error al borrar el cliente.';
            Swal.fire('Error', errorMessage, 'error');
          }
        );
      }
    });
  }

  activarCliente(cliente: Cliente) {
    Swal.fire({
      title: '¿Activar Cliente?',
      text: `Estas a punto de activar a ${cliente.razon_social}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.clienteService.deleteCliente(cliente.id_cliente).subscribe(
          () => {
            this.cargarClientes();
            Swal.fire({
              icon: 'success',
              title: 'Cliente Activado',
              text: `${cliente.razon_social} ha sido activado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
          }, (err) => {
            const errorMessage = err.error?.msg || 'Se produjo un error al activar el cliente.';
            Swal.fire('Error', errorMessage, 'error');
          }
        );
      }
    });
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalClientes / this.itemsPorPagina);
  }

  calcularNumeroPaginas() {
    const totalPaginas = Math.ceil(this.totalClientes / this.itemsPorPagina);
    const halfVisible = Math.floor(this.maximoPaginasVisibles / 2);
    let startPage = Math.max(1, this.paginaActual - halfVisible);
    let endPage = Math.min(totalPaginas, startPage + this.maximoPaginasVisibles - 1);
    if (endPage - startPage + 1 < this.maximoPaginasVisibles) {
      startPage = Math.max(1, endPage - this.maximoPaginasVisibles + 1);
    }
    this.paginas = Array(endPage - startPage + 1).fill(0).map((_, i) => startPage + i);
  }

  changeItemsPorPagina() {
    this.cargarClientes();
    this.paginaActual = 1;
  }

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.cargarClientes();
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

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/clientes']);
    });
  }

  campoNoValido(campo: string, form: FormGroup): boolean {
    if (form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }

  convertirAMayusculas(event: any) {
    const inputValue = event.target.value;
    const upperCaseValue = inputValue.toUpperCase();
    event.target.value = upperCaseValue;
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
