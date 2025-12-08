import React from "react";
import { Stethoscope } from "lucide-react";

const Logo = () => (
  <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
      <Stethoscope size={18} />
    </div>
    Pubudu<span className="text-blue-500">Medical</span>
  </div>
);

export default Logo;
