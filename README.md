# java-dependency-graph-generator

## 📝 Description

Uncover the intricate web of your Java projects with java-dependency-graph-generator, a powerful tool built with Java, Spring boot, React and TypeScript. This project offers a robust API designed to visualize and analyze dependencies, providing you with a clear understanding of your project's architecture.

## 📁 Project Structure

```
.
├── backend
│   ├── .mvn
│   │   └── wrapper
│   │       └── maven-wrapper.properties
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── src
│       ├── main
│       │   ├── java
│       │   │   └── com
│       │   │       └── ramzi
│       │   │           └── java_dependency_graph_generator
│       │   │               ├── JavaDependencyGraphGeneratorApplication.java
│       │   │               ├── controller
│       │   │               │   └── GraphController.java
│       │   │               ├── dtos
│       │   │               │   ├── ClassInfo.java
│       │   │               │   ├── GraphEdge.java
│       │   │               │   └── GraphNode.java
│       │   │               ├── services
│       │   │               │   ├── GraphService.java
│       │   │               │   ├── JavaCodeAnalyzerService.java
│       │   │               │   └── impl
│       │   │               │       ├── GraphServiceImpl.java
│       │   │               │       └── JavaCodeAnalyzerServiceImpl.java
│       │   │               └── utils
│       │   │                   ├── NodeType.java
│       │   │                   └── Unzip.java
│       │   └── resources
│       │       └── application.properties
│       └── test
│           └── java
│               └── com
│                   └── ramzi
│                       └── java_dependency_graph_generator
│                           └── JavaDependencyGraphGeneratorApplicationTests.java
└── frontend
    ├── package.json
    ├── public
    │   ├── favicon.ico
    │   ├── index.html
    │   ├── logo192.png
    │   ├── logo512.png
    │   ├── manifest.json
    │   └── robots.txt
    ├── src
    │   ├── App.css
    │   ├── App.tsx
    │   ├── api
    │   │   └── graphApi.ts
    │   ├── components
    │   │   ├── GraphViewer
    │   │   │   └── GraphViewer.tsx
    │   │   └── UploadAndFetchGraph
    │   │       ├── UploadAndFetchGraph.tsx
    │   │       └── uploadAndFetchGraph.module.css
    │   ├── index.css
    │   ├── index.tsx
    │   └── models
    │       ├── graphData.ts
    │       ├── graphEdge.ts
    │       └── graphNode.ts
    └── tsconfig.json
```

<img width="1920" height="1171" alt="image" src="https://github.com/user-attachments/assets/70928b25-a8b1-48ab-a74a-eb7074478908" />

<img width="1920" height="1445" alt="image" src="https://github.com/user-attachments/assets/16289ad7-f008-4030-b197-940f02c5d2a5" />
