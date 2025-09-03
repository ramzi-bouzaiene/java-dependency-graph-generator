package com.ramzi.java_dependency_graph_generator.services;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;

@Service
public interface JavaCodeAnalyzerService {
    Map<String, Set<String>> analyzeProject(Path projectDir) throws IOException;
}
