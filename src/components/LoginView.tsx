import React from 'react';
import { Sparkles, ShieldAlert, ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
  onBackToShop: () => void;
  isLoading: boolean;
  error?: string | null;
}

export function LoginView({ onLogin, onBackToShop, isLoading, error }: LoginViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 animate-soft-fade-in" id="login-container">
      <div className="max-w-md w-full bg-white rounded-[40px] luxury-shadow border border-soft p-8 sm:p-10 text-center relative overflow-hidden">
        
        {/* Soft decorative background glow */}
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-cozzy-pink/60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-cozzy-rose/40 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo Ornament */}
          <div className="w-14 h-14 rounded-full bg-cozzy-pink border border-soft flex items-center justify-center mb-6 luxury-shadow">
            <Sparkles className="w-6 h-6 text-cozzy-taupe" />
          </div>

          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8d6e63] font-bold mb-2 block">
            Approved Creators Only
          </span>
          
          <h2 className="serif text-3xl text-cozzy-cocoa tracking-wide mb-3">
            Artisan Sanctuary <br />
            <span className="italic font-light text-2xl text-cozzy-taupe">workshop login</span>
          </h2>
          
          <p className="text-xs text-cozzy-cocoa/70 max-w-xs font-light leading-relaxed mb-8">
            Welcome, artisan. Please sign in with your verified Google account to manage products, categories, features, and incoming orders.
          </p>

          {error && (
            <div className="w-full bg-red-50 text-red-800 text-xs px-4 py-3 rounded-2xl border border-red-100 flex items-start gap-2 mb-6 text-left">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Authentication issue</span>
                <p className="opacity-95 leading-relaxed mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Luxury Google Authentication Buttons */}
          <button
            onClick={onLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-cozzy-cocoa text-white hover:bg-cozzy-taupe active:scale-[0.98] px-6 py-4 rounded-full text-xs uppercase tracking-widest font-semibold font-sans mb-4 transition-all luxury-shadow cursor-pointer disabled:opacity-40"
            id="google-login-btn"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Entering workspace...</span>
              </div>
            ) : (
              <>
                {/* Visual SVG for Google 'G' icon with custom soft luxury styling */}
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.86-4.53-6-4.53z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <button
            onClick={onBackToShop}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-cozzy-taupe font-semibold hover:text-cozzy-cocoa transition-colors"
            id="back-to-shop-btn"
          >
            <ArrowLeft className="w-3.1 h-3.1" />
            <span>Return to Boutique</span>
          </button>

        </div>
      </div>
    </div>
  );
}

interface UnauthorizedViewProps {
  currentUserEmail: string | null;
  onLogout: () => void;
  onBackToShop: () => void;
}

export function UnauthorizedView({ currentUserEmail, onLogout, onBackToShop }: UnauthorizedViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 animate-soft-fade-in" id="unauthorized-container">
      <div className="max-w-md w-full bg-[#fdf2f0] rounded-[40px] border border-cozzy-rose shadow-cozzy-rose p-8 sm:p-10 text-center relative overflow-hidden">
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-white border border-cozzy-rose flex items-center justify-center mb-6 luxury-shadow">
            <ShieldAlert className="w-6 h-6 text-cozzy-taupe" />
          </div>

          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8d6e63] font-bold mb-2 block">
            Access Restrained
          </span>
          
          <h2 className="serif text-2xl text-cozzy-cocoa tracking-wide mb-3">
            Artisan Authentication <br />
            <span className="italic font-light text-xl text-cozzy-taupe">denied</span>
          </h2>
          
          <p className="text-xs text-cozzy-cocoa/75 max-w-sm font-light leading-relaxed mb-6">
            Your authenticated Google address is (<span className="font-semibold text-cozzy-cocoa">{currentUserEmail || 'unknown'}</span>). 
            Access to this portal is restricted to the master creator email address (<span className="underline font-medium">cozzyspace1@gmail.com</span>).
          </p>

          <div className="w-full flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 bg-cozzy-cocoa hover:bg-cozzy-taupe text-white active:scale-[0.98] px-5 py-3.5 rounded-full text-[10px] uppercase tracking-widest font-semibold transition-all cursor-pointer shadow-sm"
              id="switch-account-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>
            
            <button
              onClick={onBackToShop}
              className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-cozzy-pink text-cozzy-cocoa hover:text-cozzy-taupe border border-soft active:scale-[0.98] px-5 py-3.5 rounded-full text-[10px] uppercase tracking-widest font-semibold transition-all cursor-pointer shadow-xs"
              id="unauth-return-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go to Shop</span>
            </button>
          </div>

          <p className="text-[9px] text-cozzy-taupe/80 tracking-widest font-light font-mono uppercase">
            COZZY WORKSHOP VERIFIER v1.4
          </p>
        </div>
      </div>
    </div>
  );
}

interface LuxuryLoaderProps {
  message?: string;
}

export function LuxuryLoader({ message = "Loading the artisan sanctuary..." }: LuxuryLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8" id="luxury-loader">
      <div className="relative flex items-center justify-center w-16 h-16 mb-4">
        {/* Soft elegant pulse rings */}
        <div className="absolute inset-0 rounded-full border-2 border-cozzy-rose/60 animate-ping opacity-75" />
        <div className="absolute w-10 h-10 rounded-full border border-cozzy-taupe/30" />
        <CheckCircle2 className="absolute w-6 h-6 text-cozzy-taupe animate-[pulse_2s_infinite]" />
      </div>
      <p className="text-xs text-cozzy-taupe font-serif italic tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
}
