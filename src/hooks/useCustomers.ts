import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Customer, ActivityLog } from '../types';
import { useAuth } from '../AuthContext';

export const useCustomers = () => {
  const { session } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'user_id' | 'activityLog'>) => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({ ...customer, user_id: session.user.id })
        .select()
        .single();

      if (error) throw error;
      if (data) setCustomers((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    try {
      const { activityLog, ...rest } = updatedCustomer;
      const { data, error } = await supabase
        .from('customers')
        .update(rest)
        .eq('id', updatedCustomer.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === data.id ? { ...c, ...data } : c))
        );
      }
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', customerId);
      if (error) throw error;
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setCustomers, // Exposed for optimistic updates if needed
  };
};
