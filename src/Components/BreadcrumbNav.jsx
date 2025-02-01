// src/components/BreadcrumbNav.js
import React from "react";
import { Breadcrumb } from "react-bootstrap";

const BreadcrumbNav = ({ path, onNavigate }) => {
  return (
    <Breadcrumb>
      <Breadcrumb.Item
        onClick={() => onNavigate(-1)}
        style={{ cursor: "pointer" }}
      >
        Home
      </Breadcrumb.Item>
      {path.map((folder, index) => (
        <Breadcrumb.Item
          key={folder._id}
          onClick={() => onNavigate(index)}
          style={{ cursor: "pointer" }}
        >
          {folder.name}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default BreadcrumbNav;


// import React from "react";
// import { Breadcrumb } from "react-bootstrap";

// const BreadcrumbNav = ({ path, navigateBack }) => {
//   return (
//     <Breadcrumb>
//       <Breadcrumb.Item onClick={() => navigateBack(-1)} style={{ cursor: "pointer" }}>
//         Home
//       </Breadcrumb.Item>
//       {path.map((folder, index) => (
//         <Breadcrumb.Item key={folder.id} onClick={() => navigateBack(index)} style={{ cursor: "pointer" }}>
//           {folder.name}
//         </Breadcrumb.Item>
//       ))}
//     </Breadcrumb>
//   );
// };

// export default BreadcrumbNav;