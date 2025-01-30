import React, { useState } from "react";
import { Button, ListGroup, Dropdown, Form, Modal } from "react-bootstrap";
import BreadcrumbNav from "../Components/BreadcrumbNav";

const initialData = [
  {
    id: 1,
    name: "account",
    type: "folder",
    children: [
      {
        id: 6,
        name: "invoices",
        type: "folder",
        children: [
          { id: 16, name: "2023", type: "folder", children: [
            { id: 26, name: "January.pdf", type: "file" },
            { id: 27, name: "February.pdf", type: "file" }
          ] },
          { id: 17, name: "2024", type: "folder", children: [] }
        ]
      },
      { id: 7, name: "tax-report.pdf", type: "file" }
    ]
  },
  {
    id: 2,
    name: "apps",
    type: "folder",
    children: [
      {
        id: 8,
        name: "calendar",
        type: "folder",
        children: [
          { id: 18, name: "events", type: "folder", children: [
            { id: 28, name: "event-list.xlsx", type: "file" },
            { id: 29, name: "birthday.ics", type: "file" }
          ] }
        ]
      },
      { id: 9, name: "todo.txt", type: "file" }
    ]
  },
  {
    id: 3,
    name: "widgets",
    type: "folder",
    children: [
      {
        id: 10,
        name: "dashboard",
        type: "folder",
        children: [
          { id: 19, name: "charts", type: "folder", children: [
            { id: 30, name: "sales-chart.png", type: "file" },
            { id: 31, name: "profit-trend.csv", type: "file" }
          ] }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "assets",
    type: "folder",
    children: [
      { id: 11, name: "images", type: "folder", children: [
        { id: 20, name: "logos", type: "folder", children: [
          { id: 32, name: "company-logo.png", type: "file" }
        ] },
        { id: 21, name: "backgrounds", type: "folder", children: [] }
      ] }
    ]
  },
  {
    id: 5,
    name: "documentation",
    type: "folder",
    children: [
      { id: 12, name: "guides", type: "folder", children: [
        { id: 22, name: "setup-guide.pdf", type: "file" },
        { id: 23, name: "user-manual.docx", type: "file" }
      ] },
      { id: 13, name: "API-reference.txt", type: "file" }
    ]
  }
];


const Home = () => {
  
  const [files, setFiles] = useState(initialData);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFiles, setCurrentFiles] = useState(initialData);
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [modalType, setModalType] = useState(""); // "folder", "file", or "rename"
  const [selectedItem, setSelectedItem] = useState(null);

  // Navigate into a folder
  const navigateToFolder = (folder) => {
    setCurrentPath([...currentPath, folder]);
    setCurrentFiles(folder.children);
  };

  // Navigate back
  const navigateBack = (index) => {
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);
    setCurrentFiles(index === -1 ? files : newPath[newPath.length - 1].children);
  };

  // Open modal for new folder or file
  const openNewModal = (type) => {
    setModalType(type);
    setNewItemName("");
    setSelectedItem(null);
    setShowModal(true);
  };

  // Open rename modal
  const openRenameModal = (item) => {
    setModalType("rename");
    setNewItemName(item.name);
    setSelectedItem(item);
    setShowModal(true);
  };

  // Create a new folder or file
  const handleCreateNew = () => {
    if (!newItemName.trim()) return;
    
    const newItem = {
      id: Date.now(),
      name: newItemName,
      type: modalType,
      children: modalType === "folder" ? [] : undefined,
    };

    const updatedFiles = [...files];
    let targetFolder = currentPath.length === 0 ? updatedFiles : updatedFiles;

    currentPath.forEach((folder) => {
      targetFolder = targetFolder.find((f) => f.id === folder.id).children;
    });

    targetFolder.push(newItem);
    setCurrentFiles([...currentFiles, newItem]);
    setFiles(updatedFiles);
    
    setShowModal(false);
  };

  // Rename an item
  const handleRename = () => {
    if (!newItemName.trim() || !selectedItem) return;

    const updatedFiles = [...files];

    const updateItem = (arr, id, newName) => {
      arr.forEach((item) => {
        if (item.id === id) item.name = newName;
        if (item.children) updateItem(item.children, id, newName);
      });
    };

    updateItem(updatedFiles, selectedItem.id, newItemName);
    setFiles(updatedFiles);
    setCurrentFiles([...currentFiles]);

    setShowModal(false);
  };

  // Delete an item
  const handleDelete = (item) => {
    const updatedFiles = [...files];

    const removeItem = (arr, id) => arr.filter((item) => item.id !== id);

    let targetFolder = currentPath.length === 0 ? updatedFiles : updatedFiles;

    currentPath.forEach((folder) => {
      targetFolder = targetFolder.find((f) => f.id === folder.id).children;
    });

    targetFolder.splice(targetFolder.indexOf(item), 1);
    setCurrentFiles(removeItem(currentFiles, item.id));
    setFiles(updatedFiles);
  };

  return (
    <div className="container mt-4">
      <h4>File Manager</h4>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <BreadcrumbNav path={currentPath} navigateBack={navigateBack} />
        <div>
          <Button variant="primary" className="me-2" onClick={() => openNewModal("folder")}>New Folder</Button>
          <Button variant="success" onClick={() => openNewModal("file")}>Upload File</Button>
        </div>
      </div>

      <ListGroup>
        {currentFiles.map((file) => (
          <ListGroup.Item key={file.id} className="d-flex justify-content-between">
            <span onClick={() => file.type === "folder" && navigateToFolder(file)}>
              {file.type === "folder" ? "📁" : "📄"} {file.name}
            </span>
            <div>
              <Button size="sm" variant="warning" onClick={() => openRenameModal(file)}>Rename</Button>
              <Button size="sm" variant="danger" className="ms-2" onClick={() => handleDelete(file)}>Delete</Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* Modal for New Folder, Upload File, Rename */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "rename" ? "Rename" : modalType === "folder" ? "New Folder" : "Upload File"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Enter name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          {modalType === "rename" ? (
            <Button variant="primary" onClick={handleRename}>Rename</Button>
          ) : (
            <Button variant="primary" onClick={handleCreateNew}>Create</Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Home;
