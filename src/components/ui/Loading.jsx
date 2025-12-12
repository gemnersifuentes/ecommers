import React from 'react';

export const Loader = ({ size = 16, className = "" }) => {
  return (
    <div className={`inline-block ${className}`}>
      <div
        className="animate-spin rounded-full border-2 border-t-transparent border-orange-500"
        style={{
          width: `${size}px`,
          height: `${size}px`
        }}
      />
    </div>
  );
};

export default Loader;
