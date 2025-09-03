package com.ramzi.java_dependency_graph_generator.services.impl;

import com.ramzi.java_dependency_graph_generator.dtos.GraphEdge;
import com.ramzi.java_dependency_graph_generator.dtos.GraphNode;
import com.ramzi.java_dependency_graph_generator.services.GraphService;
import com.ramzi.java_dependency_graph_generator.services.JavaCodeAnalyzerService;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Path;
import java.util.*;

import static com.ramzi.java_dependency_graph_generator.utils.NodeType.determineNodeType;

@Component
public class GraphServiceImpl implements GraphService {

    private final JavaCodeAnalyzerService analyzerService;

    public GraphServiceImpl(JavaCodeAnalyzerService analyzerService) {
        this.analyzerService = analyzerService;
    }
    @Override
    public Map<String, Object> generateGraph(Path sourceDir) throws IOException {
        Map<String, Set<String>> dependencies = analyzerService.analyzeProject(sourceDir);

        List<GraphNode> nodes = new ArrayList<>();
        List<GraphEdge> edges = new ArrayList<>();
        Set<String> classNames = dependencies.keySet();

        for (String className : classNames) {
            String type = determineNodeType(className);
            nodes.add(new GraphNode(UUID.randomUUID().toString(), className, type));

            for (String dep : dependencies.get(className)) {
                if (classNames.contains(dep)) {
                    edges.add(new GraphEdge(className, dep));
                }
            }
        }

        Map<String, Object> graph = new HashMap<>();
        graph.put("nodes", nodes);
        graph.put("edges", edges);

        return graph;
    }
}
