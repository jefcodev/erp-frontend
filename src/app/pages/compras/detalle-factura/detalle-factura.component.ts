import { Component, OnInit } from '@angular/core';

import { DetalleFactura } from 'src/app/models/compra/detalle-factura.model';
import { DetalleFacturaService } from 'src/app/services/compra/detalle-factura.service';

@Component({
  selector: 'app-detalle-factura',
  templateUrl: './detalle-factura.component.html',
  styles: [
  ]
})
export class DetalleFacturaComponent implements OnInit {

  public detalle_facturas: DetalleFactura[] = [];

  constructor(
    private detalleFacturaService: DetalleFacturaService,
  ) {

  }

  ngOnInit(): void {
    this.cargarDetalleFacturas();
  }

  cargarDetalleFacturas() {
    this.detalleFacturaService.loadDetalleFacturas()
      .subscribe(({ detalle_facturas }) => {
        this.detalle_facturas = detalle_facturas;
        console.log("Test (detalle_factura.component.ts) - cargarDetalleFacturas()")
        console.log(detalle_facturas)
      })
  }

}
