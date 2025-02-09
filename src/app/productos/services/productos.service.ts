import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../shared/data-access/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  private storageBucket = 'Productos';

  
  async getProductos(categoria_id?: string) {
    try {
      // Obtener usuario autenticado
      const { data: userData, error: userError } = await this._supabaseClient.auth.getUser();
      if (userError) throw new Error(`Error al obtener usuario: ${userError.message}`);
  
      console.log('Usuario autenticado:', userData?.user);
  
      let query = this._supabaseClient.from('Productos').select('*');
  
      if (categoria_id) {
        query = query.eq('categoria_id', categoria_id);
      }
  
      const { data: productos, error: productosError } = await query;
  
      if (productosError) throw new Error(`Error al obtener los productos: ${productosError.message}`);
  
      // Generar URLs firmadas en paralelo
      const productosConFotos = await Promise.all(
        productos.map(async (producto) => {
          if (!producto.foto) return producto;
  
          const { data: signedData, error: signedError } = await this._supabaseClient
            .storage
            .from(this.storageBucket)
            .createSignedUrl(producto.foto, 60);
  
          if (signedError || !signedData?.signedUrl) {
            console.warn("No se pudo generar la URL firmada. Usando URL original.");
            return producto;
          }
  
          return { ...producto, foto: signedData.signedUrl };
        })
      );
  
      console.log("Productos obtenidos:", productosConFotos);
      return productosConFotos;
  
    } catch (error) {
      console.error("Error en getProductos:", error);
      return [];
    }
  }
  


  private async uploadFoto(foto: File): Promise<string> {
    console.log("Entró al upload");
    const fileName = `prouctos/${Date.now()}_${foto.name}`;

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


  async updateProducto(id: string, nombre: string, descripcion: string, categoria_id: string, foto?: File) {
    try {
      let fotoUrl: string | undefined;
  
      if (foto) {
        fotoUrl = await this.uploadFoto(foto);
        if (!fotoUrl) {
          console.error('No se pudo subir la nueva imagen');
          return null;
        }
      }
  
      // Construcción del objeto con los campos a actualizar
      const updateData: any = { nombre, descripcion, categoria_id };
      if (fotoUrl) updateData.foto = fotoUrl; // Solo actualizar la foto si se proporciona una nueva
  
      const { data, error } = await this._supabaseClient
        .from('Productos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
  
      if (error) {
        console.error('Error al actualizar el producto', error);
        return null;
      }
  
      return data;
    } catch (error) {
      console.error('Error inesperado al actualizar el producto', error);
      return null;
    }
  }
  


  async createProducto(nombre: string, descripcion: string, categoria_id: string, foto: File) {
    console.log("Entró al service");
  
    // Subir la imagen
    const fotoUrl = await this.uploadFoto(foto);
    if (!fotoUrl) {
      console.error('No se pudo subir la imagen, abortando la creación del producto');
      return null;
    }
  
    // Insertar el nuevo producto con la URL de la imagen y la categoría asociada
    const { data, error } = await this._supabaseClient
      .from('Productos')
      .insert([{ nombre, descripcion, categoria_id, foto: fotoUrl }])
      .select()
      .single();
  
    if (error) {
      console.error('Error al crear el producto', error);
      return null;
    }
  
    return data;
  }




  // Eliminar una categoría y su imagen asociada
  async deleteProducto(id: string) {
    try {
      // Obtener la categoría para recuperar la URL de la imagen antes de eliminarla
      const { data: producto, error: fetchError } = await this._supabaseClient
        .from('Productos')
        .select('foto')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error al obtener la categoría antes de eliminarla', fetchError);
        return null;
      }

      // Si la categoría tiene una imagen, eliminarla del bucket
      if (producto?.foto) {
        const filePath = producto.foto.split('/').pop(); // Extrae el nombre del archivo
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
        .from('Productos')
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
}
