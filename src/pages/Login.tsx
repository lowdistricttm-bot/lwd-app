"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';

const Login = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-6 pt-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-12">
            <Logo className="h-12 mx-auto mb-8" variant="white" />
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Bentornato</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Accedi al tuo account Low District</p>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 p-8 md:p-10">
            <Auth
              supabaseClient={supabase}
              providers={[]}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#dc2626',
                      brandAccent: '#ffffff',
                      inputBackground: 'transparent',
                      inputText: 'white',
                      inputBorder: '#27272a',
                      inputPlaceholder: '#52525b',
                    },
                    borderWidths: {
                      buttonBorderWidth: '0px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '0px',
                      buttonBorderRadius: '0px',
                      inputBorderRadius: '0px',
                    }
                  }
                },
                className: {
                  button: 'font-black uppercase italic tracking-widest py-4',
                  input: 'font-bold uppercase text-xs tracking-widest py-4',
                  label: 'font-black uppercase text-[10px] tracking-[0.2em] text-zinc-500 mb-2',
                }
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Password',
                    button_label: 'Accedi Ora',
                    loading_button_label: 'Verifica in corso...',
                    social_provider_text: 'Accedi con {{provider}}',
                    link_text: 'Hai già un account? Accedi',
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Password',
                    button_label: 'Crea Account',
                    link_text: 'Non hai un account? Registrati',
                  }
                }
              }}
              theme="dark"
            />
          </div>

          <p className="text-center mt-8 text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
            Accedendo accetti i nostri termini di servizio <br /> e la privacy policy del District.
          </p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Login;