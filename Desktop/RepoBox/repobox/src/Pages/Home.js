import React, { useState, useEffect } from "react";
import "./Home.css";
import { db } from "../Firebase/Config";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";

const ALLOWED_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.css', '.html',
  '.json', '.md', '.txt', '.py', '.java', '.c',
  '.cpp', '.php', '.xml', '.yml', '.yaml'
];

const languageColors = {
  JavaScript: "#f7df1e", Python: "#3572A5", React: "#61dafb",
  Java: "#b07219", CSS: "#563d7c", HTML: "#e34c26",
  TypeScript: "#2b7489", Other: "#22c55e",
};

function Home() {
  const [repos, setRepos] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [view, setView] = useState("repos");

  const folderInputRef = React.useRef(null);

  useEffect(() => {
    fetchRepos();
  }, []);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('multiple', '');
    }
  }, [view]);

  const fetchRepos = async () => {
    try {
      const snapshot = await getDocs(collection(db, "repos"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRepos(data);
    } catch (err) {
      console.error("Error loading repos:", err);
    }
  };

  const addRepo = async () => {
    if (!name.trim()) { alert("Please enter a repository name"); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, "repos"), {
        name: name.trim(),
        description: description.trim(),
        language: language,
        files: [],
        starred: false,
        createdAt: new Date().toISOString(),
      });
      setName(""); setDescription(""); setLanguage("JavaScript");
      setShowModal(false);
      fetchRepos();
    } catch (err) {
      alert("Failed to add repo: " + err.message);
    }
    setLoading(false);
  };

  const deleteRepo = async (id) => {
    if (!window.confirm("Delete this repository?")) return;
    try {
      await deleteDoc(doc(db, "repos", id));
      fetchRepos();
      if (selectedRepo?.id === id) { setSelectedRepo(null); setView("repos"); }
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const toggleStar = async (id, currentStarred) => {
    try {
      await updateDoc(doc(db, "repos", id), { starred: !currentStarred });
      fetchRepos();
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  const handleFileSelect = (e) => {
    const allFiles = Array.from(e.target.files);

    const filtered = allFiles.filter((file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      return (
        !file.webkitRelativePath.includes('node_modules') &&
        !file.webkitRelativePath.includes('.git') &&
        !file.webkitRelativePath.includes('build/') &&
        !file.webkitRelativePath.includes('dist/') &&
        ALLOWED_EXTENSIONS.includes(ext) &&
        file.size < 500000
      );
    });

    if (filtered.length === 0) {
      alert("No valid files found. Only code files under 500KB are supported.");
      return;
    }

    if (filtered.length !== allFiles.length) {
      alert(`${allFiles.length - filtered.length} file(s) skipped (node_modules, unsupported type or too large).`);
    }

    setFiles(filtered);
  };

  const uploadFiles = async () => {
    if (!selectedRepo || files.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const repoRef = doc(db, "repos", selectedRepo.id);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await readFileAsText(file);

        await updateDoc(repoRef, {
          files: arrayUnion({
            name: file.name,
            path: file.webkitRelativePath || file.name,
            content: content,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          })
        });

        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      alert(`✅ ${files.length} file(s) uploaded successfully!`);
      setFiles([]);

      const snapshot = await getDocs(collection(db, "repos"));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRepos(data);
      const updated = data.find((r) => r.id === selectedRepo.id);
      if (updated) setSelectedRepo(updated);

    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      js: "🟨", jsx: "⚛️", ts: "🔷", tsx: "⚛️",
      css: "🎨", html: "🌐", json: "📋", md: "📝",
      py: "🐍", java: "☕", txt: "📄", cpp: "⚙️",
    };
    return icons[ext] || "📄";
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  return (
    <div className="app">
      <div className="container">

        
        <div className="sidebar">
          <h3>📁 Repositories</h3>
          <p className="repoCount">{repos.length} repos</p>
          <button onClick={() => { setShowModal(true); }}>+ New Repo</button>
          <div className="sidebarLinks">
            <span onClick={() => { setSelectedRepo(null); setView("repos"); }}>🏠 Overview</span>
            <span onClick={() => { setSelectedRepo(null); setView("starred"); }}>⭐ Starred</span>
            <span onClick={() => { setSelectedRepo(null); setView("projects"); }}>📦 Projects</span>
          </div>
        </div>

        <div className="main">

          
          {view === "repos" && (
            <>
              <div className="mainHeader">
                <h3>All Repositories</h3>
                <button className="newRepoBtn" onClick={() => setShowModal(true)}>+ New</button>
              </div>
              <input
                type="text"
                placeholder="🔍 Find a repository..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="searchInput"
              />
              {filteredRepos.length === 0 ? (
                <div className="emptyState">
                  <p>📭 No repositories found</p>
                  <span>Create your first repo by clicking "+ New Repo"</span>
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <div key={repo.id} className="card">
                    <div className="cardInfo">
                      <h4 onClick={() => { setSelectedRepo(repo); setView("files"); }}>{repo.name}</h4>
                      <p>{repo.description || "No description"}</p>
                      <div className="cardMeta">
                        <span className="langDot" style={{ background: languageColors[repo.language] || "#22c55e" }}></span>
                        <span className="langName">{repo.language}</span>
                        <span className="cardDate">📄 {repo.files?.length || 0} files</span>
                        <span className="cardDate">🕒 {repo.createdAt ? new Date(repo.createdAt).toLocaleDateString() : ""}</span>
                      </div>
                    </div>
                    <div className="cardActions">
                      <button className="starBtn" onClick={() => toggleStar(repo.id, repo.starred)}>
                        {repo.starred ? "⭐" : "☆"}
                      </button>
                      <button className="openBtn" onClick={() => { setSelectedRepo(repo); setView("files"); }}>Open</button>
                      <button className="deleteBtn" onClick={() => deleteRepo(repo.id)}>🗑</button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          
          {view === "starred" && (
            <>
              <div className="mainHeader">
                <h3>⭐ Starred Repositories</h3>
              </div>
              {repos.filter(r => r.starred).length === 0 ? (
                <div className="emptyState">
                  <p>⭐ No starred repos yet</p>
                  <span>Click the ☆ button on any repo to star it</span>
                </div>
              ) : (
                repos.filter(r => r.starred).map((repo) => (
                  <div key={repo.id} className="card">
                    <div className="cardInfo">
                      <h4 onClick={() => { setSelectedRepo(repo); setView("files"); }}>{repo.name}</h4>
                      <p>{repo.description || "No description"}</p>
                      <div className="cardMeta">
                        <span className="langDot" style={{ background: languageColors[repo.language] || "#22c55e" }}></span>
                        <span className="langName">{repo.language}</span>
                      </div>
                    </div>
                    <div className="cardActions">
                      <button className="starBtn" onClick={() => toggleStar(repo.id, repo.starred)}>⭐</button>
                      <button className="openBtn" onClick={() => { setSelectedRepo(repo); setView("files"); }}>Open</button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

         
          {view === "projects" && (
            <>
              <div className="mainHeader">
                <h3>📦 Projects</h3>
              </div>
              <div className="emptyState">
                <p>📦 No projects yet</p>
                <span>Projects help you organize your repositories</span>
              </div>
            </>
          )}

        
          {view === "files" && selectedRepo && (
            <>
              <div className="mainHeader">
                <div>
                  <span className="breadcrumb" onClick={() => setView("repos")}>Repositories</span>
                  <span className="breadcrumbSep"> / </span>
                  <span className="breadcrumbActive">{selectedRepo.name}</span>
                </div>
                <button className="newRepoBtn" onClick={() => setView("repos")}>← Back</button>
              </div>

              <div className="repoInfo">
                <p>{selectedRepo.description || "No description"}</p>
                <div className="cardMeta">
                  <span className="langDot" style={{ background: languageColors[selectedRepo.language] || "#22c55e" }}></span>
                  <span className="langName">{selectedRepo.language}</span>
                  <span className="cardDate">📄 {selectedRepo.files?.length || 0} files</span>
                </div>
              </div>

              
              <div className="uploadSection">
                <h4>📤 Upload Files</h4>
                <div className="uploadRow">
                  <input
                    type="file"
                    ref={folderInputRef}
                    onChange={handleFileSelect}
                    className="fileInput"
                    style={{ display: 'none' }}
                    id="folderInput"
                  />
                  <label htmlFor="folderInput" className="selectFolderBtn">
                    📁 Select Folder
                  </label>
                  {files.length > 0 && (
                    <span className="fileCount">✅ {files.length} file(s) ready</span>
                  )}
                  <button
                    className="uploadBtn"
                    onClick={uploadFiles}
                    disabled={uploading || files.length === 0}
                  >
                    {uploading ? `Uploading... ${uploadProgress}%` : "⬆️ Upload"}
                  </button>
                </div>
                {uploading && (
                  <div className="progressBar">
                    <div className="progressFill" style={{ width: `${uploadProgress}%` }} />
                    <span>{uploadProgress}%</span>
                  </div>
                )}
                <p className="uploadHint">
                  Supported: .js .jsx .ts .css .html .json .md .py .java .txt (max 500KB each) — node_modules auto-excluded
                </p>
              </div>

              
              
              <div className="fileList">
                <h4>📁 Files ({selectedRepo.files?.length || 0})</h4>
                {!selectedRepo.files || selectedRepo.files.length === 0 ? (
                  <div className="emptyState">
                    <p>📭 No files yet</p>
                    <span>Upload files using the form above</span>
                  </div>
                ) : (
                  selectedRepo.files.map((file, index) => (
                    <div key={index} className="fileItem"
                      onClick={() => { setSelectedFile(file); setView("fileContent"); }}>
                      <span className="fileIcon">{getFileIcon(file.name)}</span>
                      <span className="fileName">{file.path || file.name}</span>
                      <span className="fileSize">{formatSize(file.size)}</span>
                      <span className="fileDate">{file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : ""}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

        
        
          {view === "fileContent" && selectedFile && (
            <>
              <div className="mainHeader">
                <div>
                  <span className="breadcrumb" onClick={() => setView("repos")}>Repositories</span>
                  <span className="breadcrumbSep"> / </span>
                  <span className="breadcrumb" onClick={() => setView("files")}>{selectedRepo?.name}</span>
                  <span className="breadcrumbSep"> / </span>
                  <span className="breadcrumbActive">{selectedFile.name}</span>
                </div>
                <button className="newRepoBtn" onClick={() => setView("files")}>← Back</button>
              </div>
              <div className="fileContentCard">
                <div className="fileContentHeader">
                  <span>{getFileIcon(selectedFile.name)} {selectedFile.name}</span>
                  <span className="fileSize">{formatSize(selectedFile.size)}</span>
                </div>
                <pre className="fileContent">{selectedFile.content}</pre>
              </div>
            </>
          )}
        </div>
      </div>

     
      {showModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h3>📁 Create Repository</h3>
            <div className="formGroup">
              <label>Repository Name *</label>
              <input type="text" placeholder="e.g. my-awesome-project" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="formGroup">
              <label>Description</label>
              <input type="text" placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="formGroup">
              <label>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>JavaScript</option>
                <option>Python</option>
                <option>React</option>
                <option>Java</option>
                <option>CSS</option>
                <option>HTML</option>
                <option>TypeScript</option>
                <option>Other</option>
              </select>
            </div>
            <div className="modalBtns">
              <button className="uploadBtn" onClick={addRepo} disabled={loading}>
                {loading ? "Creating..." : "✅ Create Repo"}
              </button>
              <button className="cancelBtn" onClick={() => { setShowModal(false); setName(""); setDescription(""); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;