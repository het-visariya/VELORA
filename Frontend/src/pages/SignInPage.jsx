import { useState, useEffect } from 'react';
import bgImage from '../assets/dashboard_bg.png';
import authApi from '../api/auth.api';

function Icon({ icon, className = '', style = { fontSize: '1.25rem' } }) {
  return <iconify-icon icon={icon} class={className} style={style}></iconify-icon>;
}

export default function SignInPage({ onSignIn, onBack }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [strength, setStrength] = useState({ score: 0, label: '', color: '' });
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialProvider, setSocialProvider] = useState(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialCode, setSocialCode] = useState('');
  const [socialPhase, setSocialPhase] = useState('entry');
  const [socialMessage, setSocialMessage] = useState('');

  const validatePassword = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const labels = ['', 'WEAK', 'FAIR', 'GOOD', 'STRONG'];
    const colors = ['', 'bg-red-500/50', 'bg-amber-500/50', 'bg-blue-500/50', 'bg-white/50'];

    setStrength({ score, label: labels[score], color: colors[score] });
  };

  useEffect(() => {
    validatePassword(password);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (strength.score < 3) {
        setError('Insecure Password');
        return;
      }
    }

    if (email && password) {
      try {
        const response = isSignUp
          ? await authApi.register(name, email, password)
          : await authApi.login(email, password);
        const signedInUser = response.data?.user;
        onSignIn(signedInUser?.name || name, signedInUser?.email || email);
      } catch (err) {
        setError(err.message || 'Authentication failed');
      }
    }
  };

  const startSocialLogin = (provider) => {
    setError('');
    setSocialProvider(provider);
    setSocialEmail('');
    setSocialCode('');
    setSocialPhase('entry');
    setSocialMessage('');
  };

  const sendSocialCode = async () => {
    setError('');
    setSocialLoading(true);

    try {
      const response = socialProvider === 'google'
        ? await authApi.sendGoogleCode(socialEmail)
        : await authApi.sendAppleCode(socialEmail);
      const message = response.message || `Code sent to ${socialEmail}`;
      setSocialMessage(response.debugCode
        ? `${message} Debug code: ${response.debugCode}`
        : message);
      setSocialPhase('verify');
    } catch (err) {
      setError(err.message || 'Unable to send confirmation code');
    } finally {
      setSocialLoading(false);
    }
  };

  const verifySocialLoginCode = async () => {
    setError('');
    setSocialLoading(true);

    try {
      const response = await authApi.verifySocialCode(socialProvider, socialEmail, socialCode);
      const signedInUser = response.data?.user;
      onSignIn(signedInUser?.name, signedInUser?.email);
    } catch (err) {
      setError(err.message || 'Invalid confirmation code');
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black selection:bg-white selection:text-black">
      {/* Background with layered parallax-like effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-black z-10 opacity-60"></div>
        <img 
          src={bgImage} 
          alt="Fashion Background" 
          className="w-full h-full object-cover scale-110 blur-[2px] opacity-40 grayscale contrast-125 brightness-[0.4] animate-slow-zoom"
        />
        <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-white/[0.03] rounded-full blur-[150px] animate-pulse"></div>
      </div>

      {/* Main UI */}
      <div className="relative z-10 w-full max-w-sm px-4">
        <button 
          onClick={onBack}
          className="group mb-12 flex items-center gap-3 text-[0.6rem] font-bold tracking-[0.4em] uppercase text-neutral-500 hover:text-white transition-all duration-500"
        >
          <Icon icon="solar:arrow-left-linear" className="group-hover:-translate-x-2 transition-transform" />
          <span>Exit Archive</span>
        </button>

        <div className="relative">
          {/* Decorative Border Glow */}
          <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 to-transparent rounded-sm blur-[1px]"></div>
          
          <div className="relative bg-black/60 backdrop-blur-3xl p-10 md:p-12 border border-white/5 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]">
            
            <div className="mb-12 overflow-hidden">
              <h2 className="text-2xl font-light tracking-[0.3em] uppercase text-white mb-3 animate-slide-right">
                {isSignUp ? 'REGISTER' : 'SIGN IN'}
              </h2>
              <div className="h-[1px] w-12 bg-white/40 animate-grow-width"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="text-[0.6rem] text-red-400 font-bold tracking-[0.2em] uppercase animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Fields with staggered animation */}
                <div className="space-y-1 group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <label className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-neutral-600 group-focus-within:text-white transition-colors">Identity</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-transparent border-b border-white/10 py-2 text-[0.7rem] text-white placeholder-neutral-800 focus:outline-none focus:border-white/60 transition-all tracking-widest"
                    required={isSignUp}
                  />
                </div>

                <div className="space-y-1 group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <label className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-neutral-600 group-focus-within:text-white transition-colors">Access</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-transparent border-b border-white/10 py-2 text-[0.7rem] text-white placeholder-neutral-800 focus:outline-none focus:border-white/60 transition-all tracking-widest"
                    required
                  />
                </div>

                <div className="space-y-1 group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                  <div className="flex justify-between items-center">
                    <label className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-neutral-600 group-focus-within:text-white transition-colors">Cipher</label>
                    {!isSignUp && (
                      <button type="button" className="text-[0.5rem] tracking-[0.2em] text-neutral-700 hover:text-white transition-colors uppercase">Lost Key?</button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent border-b border-white/10 py-2 text-[0.7rem] text-white placeholder-neutral-800 focus:outline-none focus:border-white/60 transition-all tracking-widest"
                    required
                  />
                  
                  {isSignUp && password && (
                    <div className="pt-2 animate-fade-in">
                      <div className="flex justify-between text-[0.45rem] tracking-[0.3em] text-neutral-600 uppercase mb-1">
                        <span>STRENGTH</span>
                        <span className="text-white">{strength.label}</span>
                      </div>
                      <div className="h-[1px] w-full bg-white/5">
                        <div 
                          className={`h-full transition-all duration-500 ${strength.color}`} 
                          style={{ width: `${(strength.score / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <div className="space-y-1 group animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <label className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-neutral-600 group-focus-within:text-white transition-colors">Verify</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full bg-transparent border-b border-white/10 py-2 text-[0.7rem] text-white placeholder-neutral-800 focus:outline-none focus:border-white/60 transition-all tracking-widest"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="pt-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <button 
                  type="submit"
                  className="w-full bg-white text-black py-4 text-[0.6rem] font-black tracking-[0.5em] uppercase hover:bg-neutral-200 transition-all flex justify-center items-center gap-3 group"
                >
                  {isSignUp ? 'INITIALIZE' : 'AUTHORIZE'}
                  <Icon icon="solar:arrow-right-linear" className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-white/5 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <div className="space-y-6">
                {!socialProvider ? (
                  <>
                    <p className="text-[0.55rem] tracking-[0.3em] uppercase text-neutral-500 text-center">Or sign in with</p>
                    <div className="grid gap-4">
                      <button
                        type="button"
                        onClick={() => startSocialLogin('google')}
                        className="flex items-center justify-center gap-3 w-full bg-white/10 border border-white/10 text-white py-3 rounded-xl uppercase tracking-[0.35em] text-[0.65rem] hover:bg-white/15 transition-all"
                      >
                        <Icon icon="logos:google-icon" style={{ fontSize: '1.2rem' }} />
                        Continue with Google
                      </button>
                      <button
                        type="button"
                        onClick={() => startSocialLogin('apple')}
                        className="flex items-center justify-center gap-3 w-full bg-white/10 border border-white/10 text-white py-3 rounded-xl uppercase tracking-[0.35em] text-[0.65rem] hover:bg-white/15 transition-all"
                      >
                        <Icon icon="logos:apple" style={{ fontSize: '1.2rem' }} className="filter brightness-0 invert" />
                        Continue with Apple
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-[0.55rem] tracking-[0.3em] uppercase text-neutral-400">Continue with {socialProvider === 'google' ? 'Google' : 'Apple'}</p>
                      <p className="mt-3 text-sm text-neutral-400">Enter the email to which we should send your confirmation code.</p>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[0.55rem] uppercase tracking-[0.3em] text-neutral-500">Email address</label>
                      <input
                        type="email"
                        value={socialEmail}
                        onChange={(e) => setSocialEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-500 rounded-xl focus:outline-none focus:border-white/40 transition-all"
                        disabled={socialPhase === 'verify'}
                      />

                      {socialPhase === 'verify' && (
                        <>
                          <label className="block text-[0.55rem] uppercase tracking-[0.3em] text-neutral-500">Confirmation code</label>
                          <input
                            type="text"
                            value={socialCode}
                            onChange={(e) => setSocialCode(e.target.value)}
                            placeholder="123456"
                            className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-500 rounded-xl focus:outline-none focus:border-white/40 transition-all"
                          />
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={socialPhase === 'entry' ? sendSocialCode : verifySocialLoginCode}
                      disabled={socialLoading || !socialEmail || (socialPhase === 'verify' && !socialCode)}
                      className="w-full bg-white text-black py-3 text-[0.65rem] font-semibold uppercase rounded-xl hover:bg-neutral-200 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {socialLoading
                        ? 'Processing…'
                        : socialPhase === 'entry'
                          ? `Send code to ${socialProvider === 'google' ? 'Google' : 'Apple'} email`
                          : `Verify ${socialProvider === 'google' ? 'Google' : 'Apple'} code`}
                    </button>

                    {socialMessage && (
                      <div className="text-sm text-emerald-300 text-center">{socialMessage}</div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSocialProvider(null);
                        setSocialEmail('');
                        setSocialCode('');
                        setSocialPhase('entry');
                        setSocialMessage('');
                        setError('');
                      }}
                      className="w-full text-[0.55rem] tracking-[0.4em] text-neutral-500 hover:text-white transition-all uppercase border-b border-transparent hover:border-white/20 pb-1"
                    >
                      Cancel social sign in
                    </button>
                  </div>
                )}

                <button 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="w-full text-[0.55rem] tracking-[0.4em] text-neutral-500 hover:text-white transition-all uppercase border-b border-transparent hover:border-white/20 pb-1"
                >
                  {isSignUp ? 'ALREADY REGISTERED?' : 'NEW ARCHIVE MEMBER?'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
