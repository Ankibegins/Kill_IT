import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-soft p-4 md:p-6 lg:p-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

