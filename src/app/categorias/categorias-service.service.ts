import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../shared/data-access/supabase.service';
import { createClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class CategoriasServiceService {
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  private storageBucket = 'categorias';




  
// Crear una nueva categoría


  async createCategoria(nombre: string, descripcion: string, foto: File) {
    console.log("entro al service");
    // Subir la imagen
    const fotoUrl = await this.uploadFoto(foto);

    // Insertar la nueva categoría con la URL de la imagen
    const { data, error } = await this._supabaseClient
      .from('Categorias')
      .insert([{ nombre, descripcion, foto: fotoUrl }]);

    if (error) {
      console.error('Error al crear la categoría', error);
      return null;
    }
    return data;
  }

  private async uploadFoto(foto: File): Promise<string> {
    console.log("entro al upload");
    const fileName = `categorias/${Date.now()}_${foto.name}`;
  
    // Verificar que el archivo es una imagen
    if (!foto.type.startsWith('image/')) {
      console.error('El archivo no es una imagen');
      return '';
    }
  
    // Subir la imagen
    const { data, error } = await this._supabaseClient
      .storage
      .from('categorias') // El nombre del bucket
      .upload(fileName, foto);
  
    if (error) {
      console.error('Error al subir la foto', error);
      return '';
    }
  
    // Obtener la URL pública del archivo subido
    const { data: urlData } = await this._supabaseClient
      .storage
      .from('categorias')
      .getPublicUrl(fileName);
  
    if (!urlData) {
      console.error('Error al obtener la URL pública de la imagen');
      return '';
    }
  
    return urlData.publicUrl;
  }
  

  // Obtener todas las categorías
  async getCategorias() {


    

    const user = await this._supabaseClient.auth.getUser();
    console.log('Usuario autenticado:', user);


    const { data, error } = await this._supabaseClient.from('Categorias').select('*');
    if (error) {
      console.log('Error al obtener las categorías', error);
      return [];
    }
    for (let categoria of data) {
      if (categoria.Foto) { // Solo si hay una foto guardada
        const { data: signedData, error } = await this._supabaseClient
          .storage
          .from("categorias")
          .createSignedUrl(categoria.Foto, 60); // URL válida por 60 segundos
    
        if (error) {
          console.error("Error al generar la URL firmada", error);
          continue; // Salta al siguiente
        }
    
        categoria.Foto = signedData?.signedUrl || categoria.Foto;
      }
    }

    console.log("data existente", data);
    return data;
  }

  // Eliminar una categoría
  async deleteCategoria(id: string) {
    const { data, error } = await this._supabaseClient
      .from('Categorias')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar la categoría', error);
      return null;
    }
    return data;
  }
}