package com.ramzi.java_dependency_graph_generator.utils;

public class NodeType {

    private NodeType(){}
    public static String determineNodeType(String className) {
        String name = className.toLowerCase();

        if (name.endsWith("controller")) {
            return "CONTROLLER";
        } else if (name.endsWith("service") || name.contains(".service")) {
            return "SERVICE";
        } else if (name.endsWith("repository") || name.contains(".repository")) {
            return "REPOSITORY";
        } else if (name.endsWith("dto")) {
            return "DTO";
        } else if (name.endsWith("enum")) {
            return "ENUM";
        } else if (name.endsWith("interface")) {
            return "INTERFACE";
        } else if (name.endsWith("annotation")) {
            return "ANNOTATION";
        } else if (name.contains(".package")) {
            return "PACKAGE";
        } else {
            return "CLASS";
        }
    }

}
