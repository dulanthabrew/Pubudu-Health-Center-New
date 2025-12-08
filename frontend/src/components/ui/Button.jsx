import React from "react";

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}) => {
  const baseStyle =
    "h-12 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary:
      "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800",
    outline:
      "border-2 border-slate-200 hover:border-blue-500 text-slate-600 hover:text-blue-500",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
