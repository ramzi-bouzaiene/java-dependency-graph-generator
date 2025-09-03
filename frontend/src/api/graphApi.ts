import axios from "axios";
import { GraphData } from "../models/graphData";

const backendUrl = "http://localhost:8080";

export async function uploadZip(file: File): Promise<GraphData> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(backendUrl + "/api/graph/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
}

export async function fetchFromGitHub(repoUrl: string): Promise<GraphData> {
    const response = await axios.post(backendUrl + "/api/graph/github", { repoUrl });
    return response.data;
}
