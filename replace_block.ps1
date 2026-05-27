$f = 'src\pages\AdminDashboard.jsx'
$lines = Get-Content $f -Encoding UTF8

# Block occupies lines 1171..1504 (1-indexed) = indices 1170..1503 (0-indexed)
$startIdx = 1170
$endIdx   = 1503

$newBlock = @'
  // Admin Login / Recovery Pages
  if (!isAdminAuthenticated) {

    const bg = 'min-h-screen w-full bg-gradient-to-br from-[#001f4d] via-[#0a1b3f] to-[#0d2057] flex flex-col items-center justify-center p-6';
    const blob1 = 'fixed top-[-120px] left-[-120px] w-96 h-96 rounded-full bg-[#b5945b]/10 blur-3xl pointer-events-none';
    const blob2 = 'fixed bottom-[-100px] right-[-100px] w-80 h-80 rounded-full bg-[#003580]/30 blur-3xl pointer-events-none';

    // LOGIN PAGE
    if (loginMode === 'login') {
      return (
        <div className={bg}>
          <div className={blob1} />
          <div className={blob2} />
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#b5945b] via-[#f0d080] to-[#b5945b]" />
              <div className="p-8">
                <div className="text-center mb-7">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#b5945b] to-[#d4af7a] rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-3">
                    <span className="font-serif text-white font-bold text-2xl">N</span>
                  </div>
                  <h1 className="font-serif text-xl tracking-widest uppercase font-bold text-[#003580]">Nirvana Resorts</h1>
                  <p className="text-[10px] text-[#003580]/50 tracking-[0.25em] uppercase mt-1">Management Portal</p>
                </div>
                {loginError && (
                  <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center">{loginError}</div>
                )}
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">Email Address</label>
                    <input
                      type="email" required
                      value={loginUsername}
                      onChange={e => setLoginUsername(e.target.value)}
                      placeholder="gokulnath96880@gmail.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003580] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">Password</label>
                      <button type="button" onClick={() => { setLoginError(''); setLoginMode('forgot'); }}
                        className="text-[9px] uppercase tracking-wider text-[#b5945b] hover:text-[#003580] font-bold transition-colors cursor-pointer">
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'} required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003580] focus:bg-white transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#003580] transition-colors cursor-pointer p-1">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmittingLogin}
                    className="w-full bg-[#003580] hover:bg-[#002560] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2">
                    {isSubmittingLogin ? 'Authenticating...' : <><span>Login to Portal</span><ChevronRight className="h-4 w-4" /></>}
                  </button>
                </form>
                <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
                  <button onClick={() => setView('home')}
                    className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#003580] font-bold transition-colors cursor-pointer block mx-auto">
                    Back to Main Site
                  </button>
                  <p className="text-[9px] text-gray-300 uppercase tracking-widest">2026 Nirvana Backwater Retreat &amp; Spa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ACCOUNT RECOVERY PAGE
    if (loginMode === 'forgot') {
      return (
        <div className={bg}>
          <div className={blob1} />
          <div className={blob2} />
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#b5945b] via-[#f0d080] to-[#b5945b]" />
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
                    <svg className="w-6 h-6 text-[#b5945b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <h1 className="font-serif text-lg tracking-wider uppercase font-bold text-[#003580]">Account Recovery</h1>
                  <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Step 1 of 3</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <div className="w-8 h-1.5 rounded-full bg-[#b5945b]" />
                    <div className="w-4 h-1.5 rounded-full bg-gray-200" />
                    <div className="w-4 h-1.5 rounded-full bg-gray-200" />
                  </div>
                </div>
                {loginError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center">{loginError}</div>
                )}
                <form onSubmit={handleForgotSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">Handler Email</label>
                    <input
                      type="email" required
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="gokulnath96880@gmail.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003580] focus:bg-white transition-all"
                    />
                  </div>
                  <button type="submit" disabled={isSubmittingLogin}
                    className="w-full bg-[#003580] hover:bg-[#002560] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all duration-200 cursor-pointer">
                    {isSubmittingLogin ? 'Sending OTP...' : 'Send Verification Code'}
                  </button>
                </form>
                <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
                  <button onClick={() => { setLoginError(''); setLoginMode('login'); }}
                    className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#003580] font-bold transition-colors cursor-pointer block mx-auto">
                    Back to Login
                  </button>
                  <p className="text-[9px] text-gray-300 uppercase tracking-widest">2026 Nirvana Backwater Retreat &amp; Spa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // OTP VERIFICATION PAGE
    if (loginMode === 'otp') {
      return (
        <div className={bg}>
          <div className={blob1} />
          <div className={blob2} />
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#b5945b] via-[#f0d080] to-[#b5945b]" />
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
                    <svg className="w-6 h-6 text-[#b5945b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h1 className="font-serif text-lg tracking-wider uppercase font-bold text-[#003580]">OTP Verification</h1>
                  <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Step 2 of 3</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <div className="w-4 h-1.5 rounded-full bg-[#b5945b]/40" />
                    <div className="w-8 h-1.5 rounded-full bg-[#b5945b]" />
                    <div className="w-4 h-1.5 rounded-full bg-gray-200" />
                  </div>
                </div>
                {loginError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center">{loginError}</div>
                )}
                <div className="mb-5 flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-[#003580] flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-[#003580] font-semibold truncate">OTP sent to <span className="font-bold">{resetEmail}</span></p>
                </div>
                <form onSubmit={handleOtpSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">6-Digit Code</label>
                    <input
                      type="text" required maxLength={6} inputMode="numeric"
                      value={resetOtp}
                      onChange={e => setResetOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="------"
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-2xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#b5945b] focus:bg-white tracking-[0.6em] text-center font-mono font-bold transition-all"
                    />
                    <p className="text-[10px] text-gray-400 text-center">Valid for 5 minutes</p>
                  </div>
                  <button type="submit" disabled={isSubmittingLogin || resetOtp.length !== 6}
                    className="w-full bg-[#003580] hover:bg-[#002560] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all duration-200 cursor-pointer">
                    {isSubmittingLogin ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button type="button"
                    onClick={() => { setLoginError(''); setResetOtp(''); setLoginMode('forgot'); }}
                    className="w-full text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#003580] font-bold py-1 transition-colors cursor-pointer">
                    Resend / Change Email
                  </button>
                </form>
                <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
                  <button onClick={() => { setLoginError(''); setLoginMode('login'); }}
                    className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#003580] font-bold transition-colors cursor-pointer block mx-auto">
                    Back to Login
                  </button>
                  <p className="text-[9px] text-gray-300 uppercase tracking-widest">2026 Nirvana Backwater Retreat &amp; Spa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // CHANGE CREDENTIALS PAGE
    if (loginMode === 'reset') {
      return (
        <div className={bg}>
          <div className={blob1} />
          <div className={blob2} />
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#b5945b] via-[#f0d080] to-[#b5945b]" />
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
                    <svg className="w-6 h-6 text-[#b5945b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h1 className="font-serif text-lg tracking-wider uppercase font-bold text-[#003580]">Change Credentials</h1>
                  <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Step 3 of 3</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <div className="w-4 h-1.5 rounded-full bg-[#b5945b]/40" />
                    <div className="w-4 h-1.5 rounded-full bg-[#b5945b]/40" />
                    <div className="w-8 h-1.5 rounded-full bg-[#b5945b]" />
                  </div>
                </div>
                <div className="mb-5 flex items-center justify-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Identity Verified</p>
                </div>
                {loginError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center">{loginError}</div>
                )}
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">Admin Username</label>
                    <input
                      type="text" required
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003580] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'} required minLength={6}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003580] focus:bg-white transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#003580] transition-colors cursor-pointer p-1">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'} required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003580] focus:bg-white transition-all"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#003580] transition-colors cursor-pointer p-1">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmittingLogin}
                    className="w-full bg-gradient-to-r from-[#003580] to-[#0a1b3f] hover:from-[#002560] hover:to-[#003580] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all duration-200 cursor-pointer mt-2">
                    {isSubmittingLogin ? 'Saving...' : 'Save and Login'}
                  </button>
                </form>
                <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
                  <button onClick={() => { setLoginError(''); setLoginMode('login'); }}
                    className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#003580] font-bold transition-colors cursor-pointer block mx-auto">
                    Back to Login
                  </button>
                  <p className="text-[9px] text-gray-300 uppercase tracking-widest">2026 Nirvana Backwater Retreat &amp; Spa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
'@

$out = [System.Collections.Generic.List[string]]::new()
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($i -eq $startIdx) {
        # Insert new block
        foreach ($newLine in ($newBlock -split "`n")) {
            $out.Add($newLine.TrimEnd("`r"))
        }
    }
    if ($i -lt $startIdx -or $i -gt $endIdx) {
        $out.Add($lines[$i])
    }
}

[System.IO.File]::WriteAllLines((Resolve-Path $f), $out, [System.Text.UTF8Encoding]::new($false))
Write-Host "Done. Lines: $($out.Count)"
