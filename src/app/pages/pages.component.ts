import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { SidebarService } from '../services/sidebar.service';

// @ts-ignore
declare function costumInitFunction();
@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: []
})
export class PagesComponent implements OnInit {

    constructor(private settingsService: SettingsService,
                private sidebarService: SidebarService){}
    ngOnInit(): void {
      costumInitFunction();

     this.sidebarService.cargarMenu();

}
}
