import React, { useState, useEffect } from 'react';
import { Shield, Lock, Calendar, Globe, FileText, Scale } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const LegalDocs: React.FC = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

    useEffect(() => {
        if (location.pathname.includes('/terms')) {
            setActiveTab('terms');
        } else {
            setActiveTab('privacy');
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-6 shadow-lg shadow-blue-600/20">
                        {activeTab === 'privacy' ? <Shield size={24} /> : <Scale size={24} />}
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Legal Center</h1>
                    <p className="text-lg text-slate-600 dark:text-zinc-400">
                        Effective Date: December 19, 2025
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 flex shadow-sm">
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'privacy'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                        >
                            Privacy Policy
                        </button>
                        <button
                            onClick={() => setActiveTab('terms')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'terms'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                        >
                            Terms of Service
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                    <div className="p-8 md:p-12 space-y-10">

                        {activeTab === 'privacy' ? (
                            <>
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
                                        Your data is securely stored focused on business continuity and privacy.
                                    </p>
                                </section>
                            </>
                        ) : (
                            <>
                                <section>
                                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                        <FileText className="text-blue-500" size={24} />
                                        Terms of Service
                                    </h2>
                                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                                        By accessing and using Invoicy CRM, you accept and agree to be bound by the terms and provision of this agreement.
                                        In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-white">1. Use of Service</h3>
                                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mb-4">
                                        You agree to use this CRM solely for lawful business purposes. You are responsible for all content you post and activity that occurs under your account.
                                        You may not use the Service for any illegal or unauthorized purpose.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-white">2. Google Calendar Integration</h3>
                                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mb-4">
                                        Our service integrates with Google Calendar. By connecting your Google account, you grant us permission to access, read, write, and delete calendar events as per your actions within the application.
                                        We are not responsible for any data loss on Google's platform, although we take every precaution to ensure safe synchronization.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-white">3. Limitation of Liability</h3>
                                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mb-4">
                                        In no event shall Invoicy CRM, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-white">4. Termination</h3>
                                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mb-4">
                                        We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                                    </p>
                                </section>
                            </>
                        )}

                        <section className="pt-8 border-t border-slate-100 dark:border-zinc-800">
                            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                                if you have any questions about these Terms or our Privacy Policy, please contact us at:
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

export default LegalDocs;
