import { Component, OnInit } from '@angular/core';
import { CategoriasServiceService } from './categorias-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-categorias',
  imports: [FormsModule, CommonModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent implements OnInit {
  categorias: any[] = [];
  nuevaCategoria = { nombre: '', descripcion: '', foto: null as File | null };

  constructor(private categoriaservice: CategoriasServiceService) {}

  ngOnInit(): void {
    this.loadCategorias();
  }



  // Cargar todas las categorías
  async loadCategorias() {
    this.categorias = await this.categoriaservice.getCategorias();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.nuevaCategoria.foto = file;
    }
  }
  async createCategoria() {
    console.log("boton presionado");
    const { nombre, descripcion, foto } = this.nuevaCategoria;
    if (!foto) {
      alert('Por favor, sube una foto.');
      return;
    }
    const result = await this.categoriaservice.createCategoria(nombre, descripcion, foto);
    if (result) {
      this.loadCategorias(); // Recargar categorías después de agregar
      this.nuevaCategoria = { nombre: '', descripcion: '', foto: null }; // Limpiar campos
    }
  }

  // Eliminar una categoría
  async deleteCategoria(id: string) {
    const result = await this.categoriaservice.deleteCategoria(id);
    if (result) {
      this.loadCategorias(); // Recargar categorías después de eliminar
    }
  }


  


}
