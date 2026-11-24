import React from "react";

const GlassCard = ({ children, className = "", hover = true, glow = false, style = {}, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card ${glow ? "animate-pulse-glow" : ""} ${className}`}
      style={{
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
