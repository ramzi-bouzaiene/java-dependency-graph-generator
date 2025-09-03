package com.ramzi.java_dependency_graph_generator.dtos;

import java.util.Set;

public class ClassInfo {
    String kind;
    Set<String> annotations;
    Set<String> dependencies;

    public ClassInfo(Set<String> annotations, String kind, Set<String> dependencies) {
        this.annotations = annotations;
        this.kind = kind;
        this.dependencies = dependencies;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public Set<String> getAnnotations() {
        return annotations;
    }

    public void setAnnotations(Set<String> annotations) {
        this.annotations = annotations;
    }

    public Set<String> getDependencies() {
        return dependencies;
    }

    public void setDependencies(Set<String> dependencies) {
        this.dependencies = dependencies;
    }
}
