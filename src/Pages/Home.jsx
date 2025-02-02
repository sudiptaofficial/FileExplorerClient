// src/components/FileExplorer.js
import React, { useState, useEffect } from "react";
import {
  Button,
  ListGroup,
  Dropdown,
  Modal,
  Form,
  ProgressBar,
  Spinner,
} from "react-bootstrap";
import {
  fetchFiles,
  createFolder,
  uploadFile,
  renameFile,
  deleteFile,
  downloadFile,
} from "../api";
import BreadcrumbNav from "../Components/BreadcrumbNav";

const Home = () => {
  // --- Navigation and file list state ---
  const [currentPath, setCurrentPath] = useState([]); // Array of folder objects representing breadcrumb path
  const [currentFiles, setCurrentFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Modal state ---
  // modalType: "newFolder", "uploadFiles", "uploadFolder", or "rename"
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [inputValue, setInputValue] = useState(""); // For new folder or rename
  const [selectedItem, setSelectedItem] = useState(null); // For rename

  // --- Upload state ---
  const [selectedFiles, setSelectedFiles] = useState([]); // Array of File objects
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);

  // --- Determine current folder id (parentId) ---
  const currentParentId =
    currentPath.length > 0 ? currentPath[currentPath.length - 1]._id : "";

  // --- Load files for the current folder ---
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

  // --- Navigation functions ---
  const handleNavigateFolder = (folder) => {
    setCurrentPath([...currentPath, folder]);
  };

  const handleNavigateBreadcrumb = (index) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  // --- Modal openers ---
  const openModal = (type) => {
    setModalType(type);
    setInputValue("");
    setSelectedItem(null);
    setSelectedFiles([]);
    setUploadProgress(0);
    setUploadStatus("");
    setShowModal(true);
  };

  const openRenameModal = (item) => {
    setModalType("rename");
    setSelectedItem(item);
    if (item.type === "file") {
      const parts = item.name.split(".");
      const baseName = parts.length > 1 ? parts.slice(0, -1).join(".") : item.name;
      setInputValue(baseName);
    } else {
      setInputValue(item.name);
    }
    setShowModal(true);
  };

  // --- Create a new folder ---
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

  // --- Upload plain file(s) ---
  const handleUploadFiles = async () => {
    if (!selectedFiles.length) return;
    const totalFiles = selectedFiles.length;
    for (let i = 0; i < totalFiles; i++) {
      setCurrentUploadIndex(i + 1);
      setUploadStatus(`${i + 1} of ${totalFiles} file(s) uploaded`);
      const file = selectedFiles[i];
      try {
        // For plain file upload, pass an empty relativePath.
        await uploadFile(
          file,
          currentParentId || null,
          "",
          (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        );
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    setUploadStatus("");
    setUploadProgress(0);
    setSelectedFiles([]);
    setShowModal(false);
    loadFiles();
  };

  // --- Upload folder (with nested structure) ---
  const handleUploadFolder = async () => {
    if (!selectedFiles.length) return;
    // All selected files come from the same folder if using webkitdirectory.
    // Extract the root folder name from the first file’s webkitRelativePath.
    const firstFile = selectedFiles[0];
    if (!firstFile.webkitRelativePath) {
      console.error("Folder upload is not supported in this browser.");
      return;
    }
    const pathParts = firstFile.webkitRelativePath.split("/");
    const rootFolderName = pathParts[0];
    // Create the root folder in the current directory.
    let rootFolder;
    try {
      const res = await createFolder(rootFolderName, currentParentId || null);
      rootFolder = res.data;
    } catch (error) {
      console.error("Error creating root folder:", error);
      return;
    }
    const totalFiles = selectedFiles.length;
    for (let i = 0; i < totalFiles; i++) {
      setCurrentUploadIndex(i + 1);
      setUploadStatus(`${i + 1} of ${totalFiles} file(s) uploaded`);
      const file = selectedFiles[i];
      let relativePath = "";
      if (file.webkitRelativePath) {
        // Example: if webkitRelativePath is "A/B/file.txt"
        // then remove the root folder ("A") → result: "B"
        const parts = file.webkitRelativePath.split("/");
        parts.shift(); // remove root folder name
        // Remove the file name (last part) to get the relative folder structure.
        relativePath = parts.slice(0, -1).join("/");
      }
      try {
        await uploadFile(
          file,
          rootFolder._id, // upload file under the newly created root folder
          relativePath,
          (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        );
      } catch (error) {
        console.error("Error uploading file from folder:", error);
      }
    }
    setUploadStatus("");
    setUploadProgress(0);
    setSelectedFiles([]);
    setShowModal(false);
    loadFiles();
  };

  // --- Rename an item ---
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

  // --- Delete an item ---
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

  // --- Download an item ---
  const handleDownload = async (item) => {
    try {
      const res = await downloadFile(item._id);
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
          <Button variant="success" className="me-2" onClick={() => openModal("uploadFiles")}>
            Upload File(s)
          </Button>
          <Button variant="info" onClick={() => openModal("uploadFolder")}>
            Upload Folder
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
              <div className="d-flex align-items-center">
                {item.type === "file" && (
                  <span className="me-3" style={{ fontSize: "0.9em" }}>
                    {item.size ? (item.size / 1024).toFixed(2) + " KB" : ""}
                  </span>
                )}
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" size="sm">
                    Actions
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => openRenameModal(item)}>
                      Rename
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDelete(item)} className="text-danger">
                      Delete
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDownload(item)}>
                      Download
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Modal for New Folder, Upload Files, Upload Folder, and Rename */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "rename"
              ? "Rename"
              : modalType === "newFolder"
              ? "New Folder"
              : modalType === "uploadFiles"
              ? "Upload File(s)"
              : "Upload Folder"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === "uploadFiles" ? (
            <Form.Group>
              <Form.Label>Select File(s)</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              />
            </Form.Group>
          ) : modalType === "uploadFolder" ? (
            <Form.Group>
              <Form.Label>
                Select Folder (requires a Chromium‑based browser)
              </Form.Label>
              <Form.Control
                type="file"
                multiple
                webkitdirectory="true"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              />
            </Form.Group>
          ) : (
            <Form.Group>
              <Form.Label>
                {modalType === "rename" ? "Enter new name" : "Enter folder name"}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </Form.Group>
          )}
          {(modalType === "uploadFiles" || modalType === "uploadFolder") && selectedFiles.length > 0 && (
            <>
              <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} className="mt-3" />
              <div className="mt-2">{uploadStatus}</div>
            </>
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
          ) : modalType === "uploadFiles" ? (
            <Button variant="primary" onClick={handleUploadFiles}>
              Upload
            </Button>
          ) : (
            <Button variant="primary" onClick={handleUploadFolder}>
              Upload Folder
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Home;
