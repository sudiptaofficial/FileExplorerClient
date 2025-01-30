import React from 'react';

const FileItem = ({ file, onRightClick }) => {
  return (
    <div
      className="col-md-2 text-center"
      onContextMenu={(e) => onRightClick(e, file)}
    >
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">{file.name}</h5>
          <p className="card-text">{file.type}</p>
        </div>
      </div>
    </div>
  );
};

export default FileItem;