import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, CompanyInfo } from '../types';
import { useAuth } from '../AuthContext';

export const useProfile = () => {
    const { session } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({ name: '', address: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!session) return;
        try {
            setLoading(true);
            const { data, error } = await supabase.from('profiles').select('*').single();
            if (error) throw error;
            if (data) {
                setProfile(data);
                setCompanyInfo({
                    name: data.company_name || 'Your Company Inc.',
                    address: data.company_address || '123 Business Rd',
                    email: data.company_email || 'contact@yourcompany.com',
                    abn: data.company_abn || '',
                    logo: data.company_logo || '',
                });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const updateProfile = async (updateData: Partial<Profile>) => {
        if (!session) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', session.user.id)
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setProfile(data);
                // Update company info if relevant fields changed
                if (
                    updateData.company_name ||
                    updateData.company_address ||
                    updateData.company_email ||
                    updateData.company_abn ||
                    updateData.company_logo
                ) {
                    setCompanyInfo({
                        name: data.company_name || companyInfo.name,
                        address: data.company_address || companyInfo.address,
                        email: data.company_email || companyInfo.email,
                        abn: data.company_abn || companyInfo.abn,
                        logo: data.company_logo || companyInfo.logo,
                    });
                }
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        companyInfo,
        loading,
        error,
        updateProfile,
        setCompanyInfo, // For local updates if needed
    };
};
