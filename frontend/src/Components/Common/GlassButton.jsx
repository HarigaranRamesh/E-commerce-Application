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
    sm: { padding: "8px 16px", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "1px", borderRadius: "0px" },
    md: { padding: "12px 24px", fontSize: "0.88rem", textTransform: "uppercase", letterSpacing: "1.2px", borderRadius: "0px" },
    lg: { padding: "14px 30px", fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "1.4px", borderRadius: "0px" },
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
