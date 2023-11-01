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
  public ocultarModal: boolean = true;

  public clienteForm: FormGroup;
  public clienteFormU: FormGroup;
  public clientes: Cliente[] = [];
  public clienteSeleccionado: Cliente;
  public totalClientes: number = 0;

  // Paginación
  itemsPorPagina = 10;
  paginaActual = 1;
  paginas: number[] = [];
  mostrarPaginacion: boolean = false;
  maximoPaginasVisibles = 5;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private router: Router,
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
          title: 'Cliente creado',
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
              title: 'Cliente borrado',
              text: `${cliente.razon_social} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
          }, (err) => {
            const errorMessage = err.error?.msg || 'Se produjo un error al borrar el cliente.';
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

  cerrarModal() {
    this.ocultarModal = true;
  }

}
