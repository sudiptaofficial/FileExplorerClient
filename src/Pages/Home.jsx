// import React, { useState } from "react";
import { Button, ListGroup, Dropdown, Form, Modal,Spinner } from "react-bootstrap";
import BreadcrumbNav from "../Components/BreadcrumbNav";
import React, { useEffect, useState } from "react";

import {
  fetchFiles,
  createFolder,
  uploadFile,
  renameFile,
  deleteFile,
  downloadFile,
} from "../api";

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
  // currentPath: array of folder objects (each with _id and name)
  const [currentPath, setCurrentPath] = useState([]);
  // currentFiles: list of files/folders in current location
  const [currentFiles, setCurrentFiles] = useState([]);
  // Loading state for API calls
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  // modalType: "newFolder", "uploadFile", or "rename"
  const [modalType, setModalType] = useState("");
  // For new folder or rename modal
  const [inputValue, setInputValue] = useState("");
  // For rename, store the selected item
  const [selectedItem, setSelectedItem] = useState(null);
  // For file upload modal, store the chosen file
  const [selectedFile, setSelectedFile] = useState(null);

  // Current parentId from path (if none, then root)
  const currentParentId = currentPath.length > 0 ? currentPath[currentPath.length - 1]._id : "";

  // Load files from backend whenever the currentParentId changes
  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await fetchFiles(currentParentId);
      setCurrentFiles(res.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParentId]);

  // Handle navigation to a folder
  const handleNavigateFolder = (folder) => {
    setCurrentPath([...currentPath, folder]);
  };

  // Handle breadcrumb navigation
  // index = -1 means navigate to Home (root)
  // otherwise, slice the path array to index + 1
  const handleNavigateBreadcrumb = (index) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  // Open modal for new folder or file upload
  const openModal = (type) => {
    setModalType(type);
    setInputValue("");
    setSelectedItem(null);
    setSelectedFile(null);
    setShowModal(true);
  };

  // Open modal for renaming an item
  const openRenameModal = (item) => {
    setModalType("rename");
    setSelectedItem(item);
    setInputValue(item.name);
    setShowModal(true);
  };

  // Create a new folder
  const handleCreateFolder = async () => {
    if (!inputValue.trim()) return;
    try {
      await createFolder(inputValue.trim(), currentParentId || null);
      loadFiles();
      setShowModal(false);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  // Upload a file
  const handleUploadFile = async () => {
    if (!selectedFile) return;
    try {
      await uploadFile(selectedFile, currentParentId || null);
      loadFiles();
      setShowModal(false);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // Rename an item
  const handleRename = async () => {
    if (!inputValue.trim() || !selectedItem) return;
    try {
      await renameFile(selectedItem._id, inputValue.trim());
      loadFiles();
      setShowModal(false);
    } catch (error) {
      console.error("Error renaming item:", error);
    }
  };

  // Delete an item (with confirmation)
  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteFile(item._id);
        loadFiles();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  // Download an item
  const handleDownload = async (item) => {
    try {
      const res = await downloadFile(item._id);
      // Create a URL for the blob and trigger a download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        item.type === "file" ? item.name : `${item.name}.zip`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading item:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h4>File Manager</h4>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <BreadcrumbNav path={currentPath} onNavigate={handleNavigateBreadcrumb} />
        <div>
          <Button variant="primary" className="me-2" onClick={() => openModal("newFolder")}>
            New Folder
          </Button>
          <Button variant="success" onClick={() => openModal("uploadFile")}>
            Upload File
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <ListGroup>
          {currentFiles.map((item) => (
            <ListGroup.Item key={item._id} className="d-flex justify-content-between align-items-center">
              <span
                style={{ cursor: item.type === "folder" ? "pointer" : "default" }}
                onClick={() => item.type === "folder" && handleNavigateFolder(item)}
              >
                {item.type === "folder" ? "📁" : "📄"} {item.name}
              </span>
              <Dropdown>
                <Dropdown.Toggle variant="secondary" size="sm">
                  Actions
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => openRenameModal(item)}>Rename</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleDelete(item)} className="text-danger">
                    Delete
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleDownload(item)}>Download</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Modal for New Folder, File Upload, and Rename */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "rename"
              ? "Rename"
              : modalType === "newFolder"
              ? "New Folder"
              : "Upload File"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === "uploadFile" ? (
            <Form.Group>
              <Form.Label>Select File</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </Form.Group>
          ) : (
            <Form.Group>
              <Form.Label>Enter Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          {modalType === "rename" ? (
            <Button variant="primary" onClick={handleRename}>
              Rename
            </Button>
          ) : modalType === "newFolder" ? (
            <Button variant="primary" onClick={handleCreateFolder}>
              Create Folder
            </Button>
          ) : (
            <Button variant="primary" onClick={handleUploadFile}>
              Upload File
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};


export default Home;
