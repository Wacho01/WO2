import { useState, useEffect } from 'react';
import { 
  supabase, 
  testConnection, 
  type Category, 
  isSupabaseConfigured,
  handleSupabaseError
} from '../lib/supabase';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        // Return default categories when Supabase is not configured
        setCategories([
          { id: 'all', label: 'All', disabled: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'funforms', label: 'Fun Forms', disabled: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'colorcast', label: 'Color Cast', disabled: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'themed', label: 'Themed Essentials', disabled: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]);
        setLoading(false);
        return;
      }

      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest) {
        throw new Error('Unable to connect to Supabase. Please check your configuration and network connection.');
      }

      const { data, error: supabaseError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (supabaseError) {
        const errorInfo = handleSupabaseError(supabaseError);
        throw new Error(errorInfo.message);
      }

      setCategories(data || []);
    } catch (err) {
      const errorInfo = err instanceof Error ? handleSupabaseError(err) : { message: 'Failed to fetch categories' };
      const errorMessage = errorInfo.message || 'Failed to fetch categories';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refetch = () => {
    fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refetch
  };
};