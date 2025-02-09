import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../shared/data-access/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  private storageBucket = 'Categorias';

  // Crear una nueva categoría
  async createCategoria(nombre: string, descripcion: string, foto: File) {
    console.log("Entró al service");

    // Subir la imagen
    const fotoUrl = await this.uploadFoto(foto);
    if (!fotoUrl) {
      console.error('No se pudo subir la imagen, abortando la creación de la categoría');
      return null;
    }

    // Insertar la nueva categoría con la URL de la imagen
    const { data, error } = await this._supabaseClient
      .from('Categorias')
      .insert([{ nombre, descripcion, foto: fotoUrl }])
      .select()
      .single(); // Para obtener solo un objeto en lugar de un array

    if (error) {
      console.error('Error al crear la categoría', error);
      return null;
    }
    return data;
  }

  private async uploadFoto(foto: File): Promise<string> {
    console.log("Entró al upload");
    const fileName = `categorias/${Date.now()}_${foto.name}`;

    // Verificar que el archivo es una imagen
    if (!foto.type.startsWith('image/')) {
      console.error('El archivo no es una imagen');
      return '';
    }

    // Subir la imagen
    const { data, error } = await this._supabaseClient
      .storage
      .from(this.storageBucket)
      .upload(fileName, foto);

    if (error) {
      console.error('Error al subir la foto', error);
      return '';
    }

    // Obtener la URL pública del archivo subido
    const { data: urlData } = this._supabaseClient
      .storage
      .from(this.storageBucket)
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      console.error('Error al obtener la URL pública de la imagen');
      return '';
    }

    return urlData.publicUrl;
  }


  // Obtener todas las categorías
  async getCategorias() {
    try {
      // Obtener usuario autenticado
      const { data: userData, error: userError } = await this._supabaseClient.auth.getUser();
      if (userError) throw new Error(`Error al obtener usuario: ${userError.message}`);

      console.log('Usuario autenticado:', userData?.user);

      // Obtener todas las categorías
      const { data: categorias, error: categoriasError } = await this._supabaseClient
        .from('Categorias')
        .select('*');

      if (categoriasError) throw new Error(`Error al obtener las categorías: ${categoriasError.message}`);

      // Generar URLs firmadas en paralelo
      const categoriasConFotos = await Promise.all(
        categorias.map(async (categoria) => {
          if (!categoria.foto) return categoria; // Aquí corregido: `foto` en minúsculas

          try {
            const { data: signedData, error: signedError } = await this._supabaseClient
              .storage
              .from(this.storageBucket)
              .createSignedUrl(categoria.foto, 60);

            if (signedError) {
              console.error("Error al generar la URL firmada", signedError);
              return categoria; // Retorna sin modificar la foto en caso de error
            }

            return { ...categoria, foto: signedData?.signedUrl || categoria.foto }; // `foto` en minúsculas
          } catch (e) {
            console.error("Error inesperado al firmar la URL:", e);
            return categoria;
          }
        })
      );

      console.log("Categorías obtenidas:", categoriasConFotos);
      return categoriasConFotos;

    } catch (error) {
      console.error("Error en getCategorias:", error);
      return [];
    }
  }


  // Eliminar una categoría y su imagen asociada
  async deleteCategoria(id: string) {
    try {
      // Obtener la categoría para recuperar la URL de la imagen antes de eliminarla
      const { data: categoria, error: fetchError } = await this._supabaseClient
        .from('Categorias')
        .select('foto')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error al obtener la categoría antes de eliminarla', fetchError);
        return null;
      }

      // Si la categoría tiene una imagen, eliminarla del bucket
      if (categoria?.foto) {
        const filePath = categoria.foto.split('/').pop(); // Extrae el nombre del archivo
        const { error: deleteFileError } = await this._supabaseClient
          .storage
          .from(this.storageBucket)
          .remove([filePath]);

        if (deleteFileError) {
          console.error('Error al eliminar la imagen del bucket', deleteFileError);
          return null;
        }
      }

      // Eliminar la categoría de la base de datos
      const { data, error } = await this._supabaseClient
        .from('Categorias')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar la categoría', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error inesperado en deleteCategoria:', error);
      return null;
    }
  }


  // Modificar una categoría existente
  async updateCategoria(id: string, nombre: string, descripcion: string, foto?: File) {
    try {
      let fotoUrl = undefined;

      if (foto) {
        // Si se proporciona una nueva foto, subimos la nueva imagen
        fotoUrl = await this.uploadFoto(foto);
        if (!fotoUrl) {
          console.error('No se pudo subir la nueva imagen');
          return null;
        }
      }

      // Actualizar la categoría en la base de datos
      const { data, error } = await this._supabaseClient
        .from('Categorias')
        .update({
          nombre,
          descripcion,
          foto: fotoUrl || undefined, // Si no hay nueva foto, dejamos el campo sin cambios
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar la categoría', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error inesperado al actualizar la categoría', error);
      return null;
    }
  }
}
