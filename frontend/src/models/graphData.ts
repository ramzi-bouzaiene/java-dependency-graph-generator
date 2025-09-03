import { GraphEdge } from "./graphEdge";
import { GraphNode } from "./graphNode";

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}