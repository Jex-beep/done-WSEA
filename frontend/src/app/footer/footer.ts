import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../site-info';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  site = SITE;
  year = new Date().getFullYear();
}
