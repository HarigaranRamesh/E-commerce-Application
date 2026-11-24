import React from "react";

const GlassButton = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  icon: Icon,
  type = "button",
  ...props
}) => {
  const baseClass = variant === "primary" ? "btn-glass-primary" : "btn-glass";

  const sizeStyles = {
    sm: { padding: "8px 16px", fontSize: "0.85rem" },
    md: { padding: "11px 22px", fontSize: "0.95rem" },
    lg: { padding: "14px 30px", fontSize: "1.05rem" },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClass} ${className}`}
      style={sizeStyles[size]}
      {...props}
    >
      {Icon && <Icon size={size === "sm" ? 15 : size === "lg" ? 20 : 17} />}
      {children}
    </button>
  );
};

export default GlassButton;
