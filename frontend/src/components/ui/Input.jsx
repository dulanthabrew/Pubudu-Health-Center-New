import React from "react";

const Input = ({ icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-3.5 text-slate-400" size={20} />
    )}
    <input
      {...props}
      className={`w-full h-12 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
        Icon ? "pl-10 pr-4" : "px-4"
      }`}
    />
  </div>
);

export default Input;
