import React, { useEffect, useState } from 'react';
import { Bot, LogIn, LogOut, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'darshan@example.com';

interface HeaderProps {
    session: any;
}

export function Header({ session }: HeaderProps) {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (session?.user?.email === ADMIN_EMAIL) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }, [session]);

    const handleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f0f0f]/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-purple-600">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="leading-none">
                        <h1 className="text-lg font-bold text-white">n8n Blog</h1>
                        <p className="text-xs text-gray-400">by Darshan</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            {isAdmin && (
                                <span className="hidden sm:flex items-center gap-1 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 border border-purple-500/20">
                                    <Shield className="h-3 w-3" />
                                    Admin
                                </span>
                            )}
                            <div className="flex items-center gap-3">
                                <img
                                    src={session.user.user_metadata.avatar_url}
                                    alt={session.user.email}
                                    className="h-8 w-8 rounded-full border border-white/10 hidden sm:block"
                                />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="group relative flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
                        >
                            <LogIn className="h-4 w-4" />
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
