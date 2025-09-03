package com.ramzi.java_dependency_graph_generator.controller;

import com.ramzi.java_dependency_graph_generator.services.GraphService;
import com.ramzi.java_dependency_graph_generator.utils.Unzip;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/graph")
@CrossOrigin(origins = "http://localhost:3000")
public class GraphController {

    private final GraphService graphService;

    public GraphController(GraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getGraph(@RequestParam String pathToCode) throws IOException {
        Path path = Paths.get(pathToCode);
        Map<String, Object> graph = graphService.generateGraph(path);
        return ResponseEntity.ok(graph);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadZip(@RequestParam("file") MultipartFile file) throws IOException {
        // 1. Save ZIP to a temp directory
        Path tempDir = Files.createTempDirectory("uploaded-src");
        Path zipPath = tempDir.resolve("source.zip");
        file.transferTo(zipPath.toFile());

        // 2. Unzip it
        Unzip.unzip(zipPath.toFile(), tempDir.toFile());

        // 3. Analyze source code
        Map<String, Object> graph = graphService.generateGraph(tempDir);
        return ResponseEntity.ok(graph);
    }

    @PostMapping("/github")
    public ResponseEntity<Map<String, Object>> uploadGithub(@RequestBody Map<String, String> body) throws IOException, GitAPIException {
        String repoUrl = body.get("repoUrl");

        // 1. Clone repo to temp directory
        Path tempDir = Files.createTempDirectory("cloned-repo");
        Git.cloneRepository()
                .setURI(repoUrl)
                .setDirectory(tempDir.toFile())
                .call();

        // 2. Analyze source code
        Map<String, Object> graph = graphService.generateGraph(tempDir);
        return ResponseEntity.ok(graph);
    }
}
