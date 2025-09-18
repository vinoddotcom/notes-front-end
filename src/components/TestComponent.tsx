import React from 'react';

export default function TestComponent() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-primary">Styling Test</h1>
      <div className="flex gap-4 mt-4">
        <button className="btn btn-primary">Primary Button</button>
        <button className="btn btn-secondary">Secondary Button</button>
        <button className="btn btn-accent">Accent Button</button>
        <button className="btn btn-neutral">Neutral Button</button>
      </div>
      <div className="card w-96 bg-base-100 shadow-xl mt-4">
        <div className="card-body">
          <h2 className="card-title">Card Title</h2>
          <p>This is a test card to ensure DaisyUI styling is working.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Action</button>
          </div>
        </div>
      </div>
    </div>
  );
}
