import React from 'react';
import { Mail, Phone, MapPin, Sparkles, CreditCard, Globe, Facebook, Instagram } from 'lucide-react';

interface CrmProfileProps {
    customer: {
        name: string;
        company: string;
        email: string;
        phone: string;
        address: string;
        website: string;
        totalBilled: string;
        totalPaid: string;
        facebook?: string;
        instagram?: string;
    };
    onEdit: () => void;
}

export const CrmProfile: React.FC<CrmProfileProps> = ({ customer, onEdit }) => {
    return (
        <div className="h-full bg-white dark:bg-zinc-800 p-6 flex flex-col border-r border-slate-200 dark:border-zinc-700">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-base font-semibold text-slate-800 dark:text-zinc-100 m-0">Profile</h2>
                <button
                    onClick={onEdit}
                    className="text-blue-600 dark:text-blue-400 bg-transparent border-none cursor-pointer text-sm font-medium hover:underline"
                >
                    Edit
                </button>
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl font-semibold mb-4">
                    {customer.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-1 m-0">{customer.name}</h3>
                <p className="text-slate-500 dark:text-zinc-400 m-0">{customer.company}</p>
            </div>

            <div className="flex gap-4 mb-8">
                <StatCard label="Total Billed" value={customer.totalBilled} />
                <StatCard label="Total Paid" value={customer.totalPaid} color="text-green-700 dark:text-green-500" />
            </div>

            <div className="mb-8">
                <h4 className="text-xs font-semibold text-slate-400 dark:text-zinc-500 mb-4 uppercase tracking-wider">Contact Info</h4>
                <ContactItem icon={<Mail size={16} />} text={customer.email} />
                <ContactItem icon={<Phone size={16} />} text={customer.phone} />
                <ContactItem icon={<Globe size={16} />} text={customer.website} />
                <ContactItem icon={<MapPin size={16} />} text={customer.address} />
                {customer.facebook && <ContactItem icon={<Facebook size={16} />} text={customer.facebook} />}
                {customer.instagram && <ContactItem icon={<Instagram size={16} />} text={customer.instagram} />}
            </div>

            <div className="mt-auto">
                <button className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg font-semibold cursor-pointer flex items-center justify-center gap-2 mb-6 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <CreditCard size={18} />
                    Setup Direct Debit
                </button>

                <div className="flex justify-end">
                    <button className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white border-none flex items-center justify-center shadow-md cursor-pointer transition-colors">
                        <Sparkles size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color = 'text-slate-800 dark:text-zinc-100' }: { label: string, value: string, color?: string }) => (
    <div className="flex-1 bg-slate-50 dark:bg-zinc-700/50 p-4 rounded-lg text-center">
        <div className="text-xs text-slate-500 dark:text-zinc-400 mb-1">{label}</div>
        <div className={`text-lg font-semibold ${color}`}>{value}</div>
    </div>
);

const ContactItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-center gap-3 mb-3 text-slate-700 dark:text-zinc-300 text-sm">
        <div className="text-slate-400 dark:text-zinc-500">{icon}</div>
        <span>{text}</span>
    </div>
);
