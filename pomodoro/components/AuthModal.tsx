"use client";

import { useState } from "react";
import Modal, { ModalSection, ModalDivider } from "./Modal";
import { Button } from "./Button";
import { useAuthStore } from "@/store/useAuth";
import { FcGoogle } from "react-icons/fc";
import { IoMailOutline, IoLockClosedOutline, IoPersonOutline } from "react-icons/io5";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "signin" | "signup";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const { signIn, signUp, signInWithGoogle, isLoading, error, clearError } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

    try {
      if (mode === "signin") {
        await signIn(email, password);
        onClose();
      } else {
        if (password !== confirmPassword) {
            // Manually setting error in store might be tricky if store doesn't expose a setError, 
            // but we can use local state or just console error for now if store implies server errors.
            // However, Looking at useAuthStore, it has an 'error' state but only 'clearError' action.
            // We'll just throw an error or alert for now, or maybe the store allows handling it gracefully.
            // Actually, best to just return early and maybe show a local error?
            // "Password match" is a client validation.
            alert("Passwords do not match"); 
            return;
        }
        await signUp(email, password, firstName, lastName);
        setSuccessMessage("Please check your email to confirm your account.");
      }
    } catch (err) {
      // Error is handled in store
    }
  };

  const handleGoogleSignIn = async () => {
    try {
        await signInWithGoogle();
        // Redirect usually happens here, so onClose might not be needed immediately
    } catch (err) {
        // Error handled in store
    }
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    clearError();
    setSuccessMessage(null);
  };

  return (
    <Modal
      title={mode === "signin" ? "Welcome Back" : "Create Account"}
      isOpen={isOpen}
      onClose={onClose}
      width="w-96"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <div className="flex gap-2">
            <div className="relative flex-1">
                <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" />
                <input
                type="text"
                placeholder="First Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 outline-none focus:border-white/30 transition-colors text-text placeholder:text-text/30"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                />
            </div>
            <div className="relative flex-1">
                <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" />
                <input
                type="text"
                placeholder="Last Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 outline-none focus:border-white/30 transition-colors text-text placeholder:text-text/30"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                />
            </div>
          </div>
        )}

        <div className="relative">
          <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 outline-none focus:border-white/30 transition-colors text-text placeholder:text-text/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 outline-none focus:border-white/30 transition-colors text-text placeholder:text-text/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {mode === "signup" && (
            <div className="relative">
            <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" />
            <input
                type="password"
                placeholder="Confirm Password"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 outline-none focus:border-white/30 transition-colors text-text placeholder:text-text/30"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
            />
            </div>
        )}

        {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">
                {error}
            </div>
        )}
        
        {successMessage && (
            <div className="text-green-400 text-sm text-center bg-green-400/10 py-2 rounded-lg">
                {successMessage}
            </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          variant="glass"
          className="w-full justify-center py-2 mt-2"
        >
          {isLoading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
        </Button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-text/30 text-sm">Or continue with</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <Button
        type="button"
        onClick={handleGoogleSignIn}
        variant="glassPlain"
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-black hover:bg-gray-100 border-none"
      >
        <FcGoogle size={20} />
        <span className="text-black">Google</span>
      </Button>

      <div className="text-center mt-2">
        <p className="text-text/50 text-sm">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={toggleMode}
            className="text-primary hover:text-primary/80 font-medium ml-1 outline-none"
          >
            {mode === "signin" ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </Modal>
  );
}
