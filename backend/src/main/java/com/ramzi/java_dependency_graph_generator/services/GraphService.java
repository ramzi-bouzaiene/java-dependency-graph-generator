package com.ramzi.java_dependency_graph_generator.services;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Map;

@Service
public interface GraphService {
    Map<String, Object> generateGraph(Path sourceDir) throws IOException;
}
