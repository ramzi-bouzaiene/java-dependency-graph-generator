import React, { useState, ChangeEvent } from "react";
import axios from "axios";
import styles from './uploadAndFetchGraph.module.css';

interface UploadAndFetchGraphProps {
    onGraphData: (data: any) => void;
}

const backendUrl = "http://localhost:8080";

const UploadAndFetchGraph: React.FC<UploadAndFetchGraphProps> = ({ onGraphData }) => {
    const [file, setFile] = useState<File | null>(null);
    const [repoUrl, setRepoUrl] = useState<string>("");
    const [loading, setLoading] = useState<{ upload: boolean; github: boolean }>({
        upload: false,
        github: false,
    });
    const [dragActive, setDragActive] = useState(false);

    const uploadZip = async () => {
        if (!file) {
            alert("Please select a ZIP file first");
            return;
        }

        setLoading(prev => ({ ...prev, upload: true }));
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(backendUrl +"/api/graph/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            onGraphData(res.data);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setLoading(prev => ({ ...prev, upload: false }));
        }
    };

    const fetchFromGitHub = async () => {
        if (!repoUrl.trim()) {
            alert("Please enter a GitHub repository URL");
            return;
        }

        setLoading(prev => ({ ...prev, github: true }));

        try {
            const res = await axios.post(backendUrl + "/api/graph/github", {
                repoUrl: repoUrl.trim()
            });
            onGraphData(res.data);
        } catch (error) {
            console.error("GitHub fetch error:", error);
            alert("Failed to fetch from GitHub. Please check the URL and try again.");
        } finally {
            setLoading(prev => ({ ...prev, github: false }));
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.zip')) {
                setFile(selectedFile);
            } else {
                alert("Please select a ZIP file");
                e.target.value = '';
            }
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.zip')) {
                setFile(droppedFile);
            } else {
                alert("Please drop a ZIP file");
            }
        }
    };

    const clearFile = () => {
        setFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>🚀 Import Your Java Project</h2>
                <p className={styles.subtitle}>Upload a ZIP file or analyze a GitHub repository to generate dependency graphs</p>
            </div>

            <div className={styles.inputGroup}>
                {/* ZIP Upload Section */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>📁 Upload ZIP File</h3>
                        <p className={styles.sectionDescription}>Upload your Java project as a ZIP file</p>
                    </div>

                    <div
                        className={`${styles.uploadCard} ${dragActive ? styles.dragActive : ''} ${file ? styles.hasFile : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className={styles.uploadIcon}>
                            {file ? '📦' : '📁'}
                        </div>

                        {file ? (
                            <div className={styles.fileInfo}>
                                <div className={styles.fileName}>{file.name}</div>
                                <div className={styles.fileSize}>
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </div>
                                <button
                                    onClick={clearFile}
                                    className={styles.clearButton}
                                    type="button"
                                >
                                    ✕ Remove
                                </button>
                            </div>
                        ) : (
                            <div className={styles.uploadText}>
                                <div className={styles.uploadMainText}>
                                    Drop your ZIP file here or click to browse
                                </div>
                                <div className={styles.uploadSubText}>
                                    Supports .zip files up to 100MB
                                </div>
                            </div>
                        )}

                        <input
                            id="file-input"
                            type="file"
                            accept=".zip"
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                    </div>

                    <button
                        onClick={uploadZip}
                        disabled={loading.upload || !file}
                        className={`${styles.button} ${styles.buttonPrimary} ${(!file || loading.upload) ? styles.buttonDisabled : ''}`}
                    >
                        {loading.upload ? (
                            <>
                                <div className={styles.spinner}></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                ⚡ Generate Graph
                            </>
                        )}
                    </button>
                </div>

                {/* GitHub Section */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>🐙 GitHub Repository</h3>
                        <p className={styles.sectionDescription}>Analyze a public GitHub repository</p>
                    </div>

                    <div className={styles.inputCard}>
                        <div className={styles.inputIcon}>🔗</div>
                        <input
                            type="text"
                            placeholder="https://github.com/username/repository"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            className={styles.input}
                            disabled={loading.github}
                        />
                    </div>

                    <div className={styles.inputHelp}>
                        <div className={styles.helpText}>
                            💡 <strong>Examples:</strong>
                        </div>
                        <div className={styles.helpExample}>
                            • https://github.com/spring-projects/spring-boot
                        </div>
                        <div className={styles.helpExample}>
                            • https://github.com/apache/kafka
                        </div>
                    </div>

                    <button
                        onClick={fetchFromGitHub}
                        disabled={loading.github || !repoUrl.trim()}
                        className={`${styles.button} ${styles.buttonSecondary} ${(!repoUrl.trim() || loading.github) ? styles.buttonDisabled : ''}`}
                    >
                        {loading.github ? (
                            <>
                                <div className={styles.spinner}></div>
                                Fetching...
                            </>
                        ) : (
                            <>
                                🔍 Analyze Repository
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadAndFetchGraph;