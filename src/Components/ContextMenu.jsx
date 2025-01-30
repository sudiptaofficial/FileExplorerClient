import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';

const ContextMenu = ({ x, y, onAction }) => {
  const handleAction = (action) => {
    onAction(action);
  };

  return (
    <div
      style={{ position: 'absolute', top: y, left: x }}
      className="bg-white border shadow-sm p-2"
    >
      <button className="btn btn-sm btn-block" onClick={() => handleAction('rename')}>Rename</button>
      <button className="btn btn-sm btn-block" onClick={() => handleAction('delete')}>Delete</button>
    </div>
  );
};

export default ContextMenu;