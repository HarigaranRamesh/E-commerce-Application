import React from "react";

const GlassBadge = ({ children, variant = "blue", icon: Icon, className = "", style = {} }) => {
  const variantClass = `glass-badge-${variant}`;

  return (
    <span className={`glass-badge ${variantClass} ${className}`} style={style}>
      {Icon && <Icon size={13} />}
      {children}
    </span>
  );
};

export default GlassBadge;
