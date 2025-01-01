import React from 'react';

interface Props {
  children: React.ReactNode;
}

export function IPhoneFrame({ children }: Props) {
  return (
    <div className="iphone-container">
      <div className="iphone">
        <div className="iphone-inner">
          <div className="iphone-notch">
            <div className="iphone-speaker"></div>
            <div className="iphone-camera"></div>
          </div>
          <div className="iphone-screen">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 