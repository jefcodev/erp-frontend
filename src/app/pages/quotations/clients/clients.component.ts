import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

//Model
import { Client } from 'src/app/models/inventory/client.model';
import { GroupClient } from 'src/app/models/inventory/group-clients.model';

//Service
import { ClientService } from 'src/app/services/inventory/client.service';
import { GroupClientsService } from 'src/app/services/inventory/group-clients.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styles: [
  ]
})
export class ClientsComponent implements OnInit {

  //Modelos
  public clients: Client[] = [];
  public groupClients: GroupClient[]=[];
  
  public cargando: boolean = true;


  // Model Cliente 
  public ci : string;
  public name : string;
  public lastname:string;
  public address : string;
  public phone: string;
  public email: string;
  public id_group_cli : number;
  
  constructor(
    private clientService: ClientService,
    private groupClientsService : GroupClientsService,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.cargarClients();
    this.cargarGroupClients();

  }

  cargarClients() {
  this.cargando = true;
    this.clientService.cargarClients()
      .subscribe(clients => {
        this.clients = clients;
        this.cargando = false;
      });
  }
  
  cargarGroupClients(){
    this.groupClientsService.cargarGroupsClient()
      .subscribe(
        groupClients => {
          this.groupClients = groupClients;
        }
      );

  }

  createClient(){
   const client ={
    ci:this.ci,
    name: this.name,
    lastname:this.lastname,
    address:this.address,
    phone: this.phone,
    email: this.email,
    id_group_cli: this.id_group_cli
   };
  this.clientService.createClient(client)
  .subscribe(
    response =>{
      console.log(response);
          Swal.fire({
            icon: 'success',
            title: 'Creado',
            text: 'Cliente creado correctamente',
            showConfirmButton: false,
            timer: 1500
          })

    }, error =>{
      console.error(error)
    }
  )
  }
}
