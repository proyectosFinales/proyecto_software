import supabase from "../model/supabase"

export const fetchCategorias = async () => {
  const { data: categorias, error: categoriasError } = await supabase
    .from('Categoria')
    .select('*');
  if (categoriasError) throw categoriasError;

  return categorias;
};

export const addCategoria = async (nombre) => {
  const { data: newCategoria, error: newCategoriaError } = await supabase
    .from('Categoria')
    .insert({nombre: nombre})
    .select('*');
  if (newCategoriaError) throw newCategoriaError;

  return newCategoria[0];
}

export const editCategoria = async (nombre, id) => {
  const { error: updatedCategoriaError } = await supabase
    .from('Categoria')
    .update({nombre: nombre})
    .eq('categoria_id', id);
  if (updatedCategoriaError) throw updatedCategoriaError;
}

export const deleteCategoria = async (id) => {
  const { error } = await supabase
    .from('Categoria')
    .delete()
    .eq('categoria_id', id);
  if (error) throw error;
}