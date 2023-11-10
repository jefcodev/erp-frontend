import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApuService } from 'src/app/services/apus/apu.service';
import { Apu } from 'src/app/models/apus/apu.model';
import Swal from 'sweetalert2';
import { UnitService } from 'src/app/services/inventory/unit.service';
import { Unit } from 'src/app/models/inventory/unit.model';
import { ProductoService } from 'src/app/services/inventario/producto.service';
import { Producto } from 'src/app/models/inventario/producto.model';

@Component({
  selector: 'app-apu',
  templateUrl: './apu.component.html',
  styles: [
  ]
})
export class ApuComponent implements OnInit {

  /* Llenar dattos */
  filasMateriales: any[] = [];
  filasEquipos: any[] = [];
  filasManoObra: any[] = [];

  /* Cargar dartos */
  unidades: Unit[] = [];
  productos: Producto[]=[];
  herramientas : Producto []=[];

  public metros: number;
  constructor(private apuService: ApuService,
    private unidadesService: UnitService,
    private productoService: ProductoService,) { }

  ngOnInit(): void {
     this.cargarUnidades();
     this.cargarProductos();
     this.cargarProductosHerramientas();
     console.log('Productos: '+ this.cargarProductos());

  }

  /* Add & Delete Filas Materiales */
  addFilaMateriales() {
    this.filasMateriales.push({ codigo: '', descripcion: '', cantidad: null, unidad: '', desperdicio: null, precio: null, total: null });
  }
  deleteFilaMateriales(index: number) {
    if (this.filasMateriales.length >= 1) {
      this.filasMateriales.splice(index, 1);
    }
  }

  /* Add & Delete Filas Equipos */
  addFilaEquipos() {
    this.filasEquipos.push({ descripcion: '', cantidad: null, unidad: '', precio: null, total: null });
  }
  deleteFilaEquipos(index: number) {
    if (this.filasEquipos.length >= 1) {
      this.filasEquipos.splice(index, 1);
    }
  }

  /* Add & Delete Filas Mano de Obra */
  addFilaManoObra() {
    this.filasManoObra.push({ descripcion: '', cantidad: null, unidad: '', precio: null, total: null });
  }
  deleteFilaManoObra(index: number) {
    if (this.filasManoObra.length >= 1) {
      this.filasManoObra.splice(index, 1);
    }
  }




  /* Cargar datos */

  cargarProductos() {
    this.productoService.loadProductosMateriales()
      .subscribe(({ productos }) => {
        this.productos = productos;
      })
  }
  cargarProductosHerramientas() {
    this.productoService.loadProductosHerramientas()
      .subscribe(({ productos }) => {
        this.herramientas = productos;
      })
  }

  cargarUnidades() {
    this.unidadesService.cargarUnits()
      .subscribe((unidades: Unit[]) => {
        this.unidades = unidades;
      });



  }

  crearApu() {
    const apu: Apu = {
      codigo: 'CAP-010',
      nombre: 'Invernadero APU Front',
      descripcion: 'Prueba de Invernadero APU Front',
      materiales: this.filasMateriales,
      equipos: this.filasEquipos,
      mano_obra: this.filasManoObra,
    };

    this.apuService.createApu(apu).subscribe(
      (response) => {

        Swal.fire({
          icon: 'success',
          title: 'Creado correctamente',
          text: `Analisis de Precios Unitarios creado correctamente.`,
          showConfirmButton: false,
          timer: 1500
        });
      },
      (error) => {
        Swal.fire('Error', error, 'error');
      }
    );
  }

}
