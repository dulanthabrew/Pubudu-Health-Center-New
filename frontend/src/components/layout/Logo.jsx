import React from "react";

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      {/* Make sure 'logo.png' is placed in your project's 'public' folder.
        If you put it in 'src/assets', you would import it like: import logo from '../../assets/logo.png';
      */}
      <img
        src="/logo.png"
        alt="Pubudu Medical Center"
        className="h-20 w-auto object-contain"
      />
      <h1 className="text-xl font-bold text-slate-900 tracking-tight">
        Pubudu Medical Center
      </h1>
    </div>
  );
};

export default Logo;
