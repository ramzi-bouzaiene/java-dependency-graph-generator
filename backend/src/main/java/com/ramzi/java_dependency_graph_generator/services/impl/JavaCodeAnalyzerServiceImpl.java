package com.ramzi.java_dependency_graph_generator.services.impl;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.BodyDeclaration;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.ramzi.java_dependency_graph_generator.services.JavaCodeAnalyzerService;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Component
public class JavaCodeAnalyzerServiceImpl implements JavaCodeAnalyzerService {
    @Override
    public Map<String, Set<String>> analyzeProject(Path projectDir) throws IOException {
        Map<String, Set<String>> classDependencies = new HashMap<>();

        Files.walk(projectDir)
                .filter(path -> path.toString().endsWith(".java"))
                .forEach(file -> {
                    try {
                        CompilationUnit cu = StaticJavaParser.parse(file);
                        Optional<ClassOrInterfaceDeclaration> classDecl = cu.getPrimaryType()
                                .flatMap(BodyDeclaration::toClassOrInterfaceDeclaration);

                        if (classDecl.isPresent()) {
                            String className = classDecl.get().getNameAsString();
                            Set<String> dependencies = new HashSet<>();

                            // Collect field dependencies
                            classDecl.get().findAll(FieldDeclaration.class).forEach(field -> {
                                String dep = field.getElementType().asString();
                                dependencies.add(dep);
                            });

                            // Collect method parameter dependencies
                            classDecl.get().findAll(MethodDeclaration.class).forEach(method -> {
                                method.getParameters().forEach(param -> {
                                    dependencies.add(param.getType().asString());
                                });
                            });

                            classDependencies.put(className, dependencies);
                        }
                    } catch (Exception e) {
                        System.err.println("Failed to parse: " + file);
                    }
                });

        return classDependencies;
    }
}
