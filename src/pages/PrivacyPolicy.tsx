import React from 'react';
import { Shield, Lock, Calendar, Globe } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-6 shadow-lg shadow-blue-600/20">
                        <Shield size={24} />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
                    <p className="text-lg text-slate-600 dark:text-zinc-400">Effective Date: December 19, 2025</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                    <div className="p-8 md:p-12 space-y-10">

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Globe className="text-blue-500" size={24} />
                                Introduction
                            </h2>
                            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                                Welcome to Invoicy CRM. We are committed to protecting your personal information and your right to privacy.
                                This Privacy Policy explains what information we collect, how we use it, and your rights in relation to it.
                                By using our application, you agree to the collection and use of information in accordance with this policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Calendar className="text-purple-500" size={24} />
                                Google User Data
                            </h2>
                            <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-slate-100 dark:border-zinc-800">
                                <p className="text-slate-700 dark:text-zinc-300 font-medium mb-3">
                                    Our application requests access to your Google Calendar data (specifically the <code>calendar.events</code> scope).
                                    Here is exactly how we use this data:
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5"></div>
                                        <span className="text-slate-600 dark:text-zinc-400">
                                            <strong>Display:</strong> We fetch your calendar events to display them within your CRM dashboard, allowing you to see your schedule alongside your business tasks.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5"></div>
                                        <span className="text-slate-600 dark:text-zinc-400">
                                            <strong>Creation:</strong> We allow you to create, edit, and delete events on your Google Calendar directly from our application interface to prevent double-booking.
                                        </span>
                                    </li>
                                </ul>
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-zinc-700">
                                    <p className="text-sm text-slate-500 dark:text-zinc-500 italic">
                                        We do <strong>not</strong> use your Google Calendar data for advertising purposes. We do <strong>not</strong> sell your data to third parties.
                                        The data is only transferred to your client application for your own usage.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Lock className="text-emerald-500" size={24} />
                                Data Storage and Security
                            </h2>
                            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mb-4">
                                We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process.
                                Your data is stored securely using Supabase (PostgreSQL), which provides industry-standard encryption and security protocols.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                                If you have questions or comments about this policy, or if you would like to revoke access to your data, you may contact us at:
                            </p>
                            <div className="mt-4 text-slate-800 dark:text-zinc-200 font-medium">
                                support@invoicy-crm.com
                            </div>
                        </section>

                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-950/50 p-6 text-center border-t border-slate-200 dark:border-zinc-800">
                        <p className="text-sm text-slate-500">
                            &copy; {new Date().getFullYear()} Invoicy CRM. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
