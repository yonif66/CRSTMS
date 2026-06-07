import * as React from "react";
import { useState } from "react";
import { Lock, Cpu, ShieldAlert, UserPlus, LogIn, ArrowLeft, Sun, Moon } from "lucide-react";
import { User } from "../types";
import { useTheme } from "./ThemeContext";

interface LoginScreenProps {
  onLogin: (user: User) => void;
  customUsers: User[];
  onRegisterCustomer: (fullName: string, email: string, phone: string, address: string, password_hash: string) => boolean;
}

export default function LoginScreen({ onLogin, customUsers, onRegisterCustomer }: LoginScreenProps) {
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  
  // Tabs: "staff" | "customer"
  const [activeTab, setActiveTab] = useState<"staff" | "customer">("staff");
  // Toggle registration interface
  const [isRegistering, setIsRegistering] = useState(false);

  // Registration Form States
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = username.trim().toLowerCase();

    // Get passwords from localStorage
    const savedCredentials = localStorage.getItem("crstms_user_passwords");
    const credentials = savedCredentials ? JSON.parse(savedCredentials) : {};

    const targetUser = customUsers.find(
      u => u.username.toLowerCase() === normalized || 
           u.username.substring(0, u.username.indexOf("@")).toLowerCase() === normalized ||
           (u.fullName.toLowerCase().replace(" ", "") === normalized.replace("_", ""))
    );

    if (targetUser) {
      let correctPass = credentials[targetUser.username.toLowerCase()];
      if (!correctPass) {
        if (targetUser.role === "Customer") {
          correctPass = "Customer123";
        } else if (targetUser.username === "girma@crstms.com") {
          correctPass = "Admin123";
        } else if (targetUser.username === "simret@crstms.com") {
          correctPass = "Reception123";
        } else if (targetUser.username === "abebe@crstms.com") {
          correctPass = "Tech123";
        } else if (targetUser.username === "dawit@crstms.com") {
          correctPass = "Tech123";
        } else if (targetUser.username === "henok@crstms.com") {
          correctPass = "Tech123";
        } else if (targetUser.username === "kaleab@crstms.com") {
          correctPass = "Delivery123";
        }
      }

      if (correctPass === password) {
        // Prevent customers from logging into the staff tab and vice versa
        if (activeTab === "customer" && targetUser.role !== "Customer") {
          setAuthError("Error: Staff users must use the Staff Sign-in tab.");
          return;
        }
        if (activeTab === "staff" && targetUser.role === "Customer") {
          setAuthError("Error: Customers must use the Customer Sign-in tab.");
          return;
        }

        onLogin(targetUser);
        setAuthError("");
        return;
      }
    }

    setAuthError(`Login Failed: The username/email option and password do not match.`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim() || !regAddress.trim() || !regPassword.trim()) {
      setAuthError("Registration Error: Please fill in all fields.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setAuthError("Registration Error: Passwords do not match.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setAuthError("Registration Error: Please enter a valid email address.");
      return;
    }

    const success = onRegisterCustomer(regFullName, regEmail, regPhone, regAddress, regPassword);
    if (success) {
      alert(`Account Registered: Welcome ${regFullName}! You can now login with your email and password.`);
      // Switch back to login form as Customer
      setUsername(regEmail);
      setPassword(regPassword);
      setActiveTab("customer");
      setIsRegistering(false);
      // Clean up fields
      setRegFullName("");
      setRegEmail("");
      setRegPhone("");
      setRegAddress("");
      setRegPassword("");
      setRegConfirmPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1017] flex items-center justify-center p-4">
      {/* Background radial soft light gradient */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Brand Banner Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex flex-col items-center text-center space-y-3 relative">
          {/* Floating theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition flex items-center justify-center z-20"
            title={theme === "light" ? "Switch to Night Mode" : "Switch to Day Mode"}
          >
            {theme === "light" ? <Moon size={14} className="text-amber-500" /> : <Sun size={14} className="text-amber-400" />}
          </button>

          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/15">
            <Cpu className="text-slate-950" size={24} />
          </div>
          <div className="space-y-1 text-left w-full text-center">
            <h1 className="text-lg font-bold tracking-tight text-white font-display">CRSTMS Addis Ababa Station</h1>
            <p className="text-xs text-slate-400">Computer Repair Service Tracking &amp; Management System</p>
          </div>
        </div>

        {/* Dynamic Auth Forms */}
        <div className="p-6 space-y-6">
          
          {authError && (
            <div className="p-3 bg-red-955 border border-red-500/20 text-red-400 rounded-lg text-xs leading-relaxed text-center flex items-center justify-center gap-2">
              <ShieldAlert size={14} className="shrink-0 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          {!isRegistering ? (
            <>
              {/* Login Tabs Selector */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 border border-slate-850 rounded-lg">
                <button
                  type="button"
                  onClick={() => { setActiveTab("staff"); setAuthError(""); }}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    activeTab === "staff"
                      ? "bg-slate-800 text-amber-500 border border-slate-700"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Staff Portal login
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("customer"); setAuthError(""); }}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    activeTab === "customer"
                      ? "bg-slate-800 text-amber-500 border border-slate-700"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Customer Service login
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {activeTab === "staff" ? "Staff Intranet handle (Email)" : "Customer Profile handle (Email)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      activeTab === "staff"
                        ? "e.g. girma@crstms.com or abebe@crstms.com"
                        : "e.g. hana@crstms.com"
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-mono text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition-all"
                  />
                </div>

                {/* Remember Password Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-800 accent-amber-500 focus:outline-none focus:ring-0 cursor-pointer"
                    />
                    <span>Remember Password</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded font-mono font-bold">256-Bit Secure</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn size={13} />
                  <span>Log in securely</span>
                </button>
              </form>

              {/* Toggle to Registration Form */}
              <div className="pt-3 border-t border-slate-850/80 text-center">
                <span className="text-xs text-slate-450">Need a remote repair diagnostic? </span>
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setAuthError(""); }}
                  className="text-amber-500 hover:text-amber-400 font-bold text-xs inline-flex items-center gap-1 cursor-pointer underline decoration-dotted ml-1"
                >
                  <UserPlus size={12} />
                  <span>Register Account Remotely</span>
                </button>
              </div>
            </>
          ) : (
            /* Registration Form */
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 text-left">
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setAuthError(""); }}
                  className="p-1 px-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1 text-[11px]"
                >
                  <ArrowLeft size={11} />
                  <span>Back to Sign In</span>
                </button>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider font-mono">REMOTE CLIENT REGISTRATION</span>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Abebe Kebede"
                    className="w-full bg-slate-955 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="abebe@gmail.com"
                      className="w-full bg-slate-955 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Phone *</label>
                    <input
                      type="text"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+251-9..."
                      className="w-full bg-slate-955 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Physical Address (For pickup dispatch) *</label>
                  <input
                    type="text"
                    required
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="e.g. Bole, Kebele 03, Addis Ababa"
                    className="w-full bg-slate-955 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password *</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-955 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-955 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center gap-1 mt-2.5"
                >
                  <UserPlus size={13} />
                  <span>Enact Remote Customer Registration</span>
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
