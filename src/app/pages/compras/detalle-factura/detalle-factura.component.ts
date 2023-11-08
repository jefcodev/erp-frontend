/*import { Component, OnInit } from '@angular/core';

import { DetalleFactura } from 'src/app/models/compra/detalle-factura.model';
import { DetalleFacturaService } from 'src/app/services/compra/detalle-factura.service';

@Component({
  selector: 'app-detalle-factura',
  templateUrl: './detalle-factura.component.html',
  styles: [
  ]
})
export class DetalleFacturaComponent implements OnInit {

  public detalles_factura: DetalleFactura[] = [];

  constructor(
    private detalleFacturaService: DetalleFacturaService,
  ) {

  }

  ngOnInit(): void {
    this.cargarDetalleFacturas();
  }

  cargarDetalleFacturas() {
    this.detalleFacturaService.loadDetalleFacturas()
      .subscribe(({ detalles_factura }) => {
        this.detalles_factura = detalles_factura;
      })
  }


}
*/
