import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';
import { ProductosService } from './services/productos.service';
import { CategoriasService } from '../categorias/services/categorias.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  productos: any[] = [];
  categorias: any[] = []; // Lista de categorías para el select
  nuevoProducto: any = { nombre: '', descripcion: '', categoria_id: '', foto: null };
  isEditMode: boolean = false;
  productoEditando: any = null;
  categoriaSeleccionada: string = ''; // Para filtrar productos por categoría

  constructor(
    private productosService: ProductosService,
    private categoriasService: CategoriasService 
  ) {}

  ngOnInit(): void {
    this.loadProductos();
    this.loadCategorias();
  }

  loadProductos() {
    this.productosService.getProductos(this.categoriaSeleccionada).then((productos) => {
      this.productos = productos;
    });
  }
  loadCategorias() {
    this.categoriasService.getCategorias()
      .then((categorias) => {
        this.categorias = categorias;
      })
      .catch((error) => {
        console.error('Error al cargar las categorías:', error);
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.nuevoProducto.foto = file;
    }
  }

  resetForm() {
    this.nuevoProducto = { nombre: '', descripcion: '', categoria_id: '', foto: null };
    this.isEditMode = false;
    this.productoEditando = null;
  }

  updateProducto() {
    if (this.productoEditando) {
      this.productosService.updateProducto(
        this.productoEditando.id,
        this.nuevoProducto.nombre,
        this.nuevoProducto.descripcion,
        this.nuevoProducto.categoria_id,
        this.nuevoProducto.foto
      ).then(() => {
        this.loadProductos();
        this.resetForm();
        this.closeEditModal();
      });
    }
  }

  editProducto(producto: any) {
    this.isEditMode = true;
    this.productoEditando = producto;
    this.nuevoProducto = { ...producto };
  }

  deleteProducto(id: string) {
    this.productosService.deleteProducto(id).then(() => {
      this.loadProductos();
    });
  }

  createProducto() {
    this.productosService.createProducto(
      this.nuevoProducto.nombre,
      this.nuevoProducto.descripcion,
      this.nuevoProducto.categoria_id,
      this.nuevoProducto.foto
    ).then(() => {
      this.loadProductos();
      this.resetForm();
      this.closeCreateModal();
    });
  }

  // Filtrar productos por categoría
  filtrarPorCategoria() {
    this.loadProductos();
  }

  // Métodos para abrir y cerrar modales
  openCreateModal() {
    document.getElementById('createProductoModal')!.classList.remove('hidden');
  }

  closeCreateModal() {
    document.getElementById('createProductoModal')!.classList.add('hidden');
  }

  openEditModal(producto: any) {
    this.editProducto(producto);
    document.getElementById('editProductoModal')!.classList.remove('hidden');
  }

  closeEditModal() {
    document.getElementById('editProductoModal')!.classList.add('hidden');
  }

  getCategoriaNombre(categoriaId: string): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  }
}
