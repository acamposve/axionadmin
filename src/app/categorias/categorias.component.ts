import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriasService } from './services/categorias.service';
import { HeaderComponent } from "../shared/header/header.component";

@Component({
  selector: 'app-categorias',
  imports: [FormsModule, CommonModule, HeaderComponent],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})

export class CategoriasComponent implements OnInit {
  categorias: any[] = [];
  nuevaCategoria: any = { nombre: '', descripcion: '', foto: null };
  isEditMode: boolean = false;
  categoriaEditando: any = null;

  constructor(private categoriasService: CategoriasService) {}

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias() {
    this.categoriasService.getCategorias().then((categorias) => {
      this.categorias = categorias;
    });
  }

  createCategoria() {
    this.categoriasService.createCategoria(
      this.nuevaCategoria.nombre,
      this.nuevaCategoria.descripcion,
      this.nuevaCategoria.foto
    ).then(() => {
      this.loadCategorias();
      this.resetForm();
      this.closeCreateModal();
    });
  }

  editCategoria(categoria: any) {
    this.isEditMode = true;
    this.categoriaEditando = categoria;
    this.nuevaCategoria = { ...categoria };
  }

  updateCategoria() {
    if (this.categoriaEditando) {
      this.categoriasService.updateCategoria(
        this.categoriaEditando.id,
        this.nuevaCategoria.nombre,
        this.nuevaCategoria.descripcion,
        this.nuevaCategoria.foto
      ).then(() => {
        this.loadCategorias();
        this.resetForm();
        this.closeEditModal();
      });
    }
  }

  deleteCategoria(id: string) {
    this.categoriasService.deleteCategoria(id).then(() => {
      this.loadCategorias();
    });
  }

  resetForm() {
    this.nuevaCategoria = { nombre: '', descripcion: '', foto: null };
    this.isEditMode = false;
    this.categoriaEditando = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.nuevaCategoria.foto = file;
    }
  }

  // Métodos para abrir y cerrar modales
  openCreateModal() {
    document.getElementById('createCategoriaModal')!.classList.remove('hidden');
  }

  closeCreateModal() {
    document.getElementById('createCategoriaModal')!.classList.add('hidden');
  }

  openEditModal(categoria: any) {
    this.editCategoria(categoria);
    document.getElementById('editCategoriaModal')!.classList.remove('hidden');
  }

  closeEditModal() {
    document.getElementById('editCategoriaModal')!.classList.add('hidden');
  }
}
