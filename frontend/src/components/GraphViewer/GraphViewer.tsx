import React, { useState, useCallback, useMemo } from "react";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Node,
    Edge,
    Background,
    Panel,
    EdgeMarker,
    MarkerType,
    useNodesState,
    useEdgesState,
    NodeChange,
    EdgeChange,
    Connection,
    addEdge,
    Position
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { GraphData } from "../../models/graphData";
import { GraphNode } from "../../models/graphNode";
import { GraphEdge } from "../../models/graphEdge";

interface GraphViewerProps {
    graphData: GraphData | null;
}

// Enhanced node type colors and styles with better gradients
const nodeTypeStyles = {
    CLASS: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: '3px solid #667eea',
        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
        icon: '🏗️'
    },
    INTERFACE: {
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        border: '3px solid #f093fb',
        boxShadow: '0 10px 25px rgba(240, 147, 251, 0.4)',
        icon: '🔌'
    },
    ENUM: {
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: 'white',
        border: '3px solid #4facfe',
        boxShadow: '0 10px 25px rgba(79, 172, 254, 0.4)',
        icon: '📝'
    },
    ANNOTATION: {
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        color: 'white',
        border: '3px solid #43e97b',
        boxShadow: '0 10px 25px rgba(67, 233, 123, 0.4)',
        icon: '📌'
    },
    PACKAGE: {
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        color: 'white',
        border: '3px solid #fa709a',
        boxShadow: '0 10px 25px rgba(250, 112, 154, 0.4)',
        icon: '📦'
    },
    SERVICE: {
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        color: '#2d3748',
        border: '3px solid #a8edea',
        boxShadow: '0 10px 25px rgba(168, 237, 234, 0.4)',
        icon: '⚙️'
    },
    CONTROLLER: {
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        color: '#2d3748',
        border: '3px solid #ffecd2',
        boxShadow: '0 10px 25px rgba(255, 236, 210, 0.4)',
        icon: '🎮'
    },
    REPOSITORY: {
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        color: '#2d3748',
        border: '3px solid #ff9a9e',
        boxShadow: '0 10px 25px rgba(255, 154, 158, 0.4)',
        icon: '🗃️'
    },
    ENTITY: {
        background: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
        color: 'white',
        border: '3px solid #c471f5',
        boxShadow: '0 10px 25px rgba(196, 113, 245, 0.4)',
        icon: '🏛️'
    },
    default: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: '3px solid #667eea',
        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
        icon: '📄'
    }
};

// Custom node component with enhanced styling
const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
    const nodeStyle = nodeTypeStyles[data.type as keyof typeof nodeTypeStyles] || nodeTypeStyles.default;

    return (
        <div
            style={{
                ...nodeStyle,
                padding: '16px 24px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '600',
                minWidth: '180px',
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                transform: selected ? 'scale(1.05)' : 'scale(1)',
                zIndex: selected ? 1000 : 1,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flexDirection: 'column'
            }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                    {nodeStyle.icon}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>
                    {data.label}
                </div>
                <div style={{
                    fontSize: '10px',
                    opacity: 0.8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {data.type}
                </div>
            </div>
        </div>
    );
};

// Enhanced layout algorithm with better positioning
const getLayoutedNodes = (nodes: GraphNode[], edges: GraphEdge[]): Node[] => {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const inDegree = new Map<string, number>();
    const outDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    // Initialize degrees and adjacency list
    nodes.forEach(node => {
        inDegree.set(node.id, 0);
        outDegree.set(node.id, 0);
        adjList.set(node.id, []);
    });

    edges.forEach(edge => {
        inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
        outDegree.set(edge.from, (outDegree.get(edge.from) || 0) + 1);
        adjList.get(edge.from)?.push(edge.to);
    });

    // Topological sort for layering
    const layers: string[][] = [];
    const queue: string[] = [];
    const tempInDegree = new Map(inDegree);

    // Start with nodes that have no incoming edges
    nodes.forEach(node => {
        if (tempInDegree.get(node.id) === 0) {
            queue.push(node.id);
        }
    });

    let currentLayer = 0;
    while (queue.length > 0) {
        const currentLevelSize = queue.length;
        layers[currentLayer] = [];

        for (let i = 0; i < currentLevelSize; i++) {
            const nodeId = queue.shift()!;
            layers[currentLayer].push(nodeId);

            // Process neighbors
            adjList.get(nodeId)?.forEach(neighbor => {
                const newInDegree = tempInDegree.get(neighbor)! - 1;
                tempInDegree.set(neighbor, newInDegree);
                if (newInDegree === 0) {
                    queue.push(neighbor);
                }
            });
        }
        currentLayer++;
    }

    // If there are remaining nodes (cycles), add them to the last layer
    const processedNodes = new Set(layers.flat());
    const remainingNodes = nodes.filter(node => !processedNodes.has(node.id));
    if (remainingNodes.length > 0) {
        layers.push(remainingNodes.map(node => node.id));
    }

    // Calculate positions
    const levelHeight = 200;
    const nodeSpacing = 280;
    const baseY = 100;

    return nodes.map(node => {
        const layer = layers.findIndex(layerNodes => layerNodes.includes(node.id));
        const validLayer = layer >= 0 ? layer : layers.length - 1;
        const indexInLayer = layers[validLayer]?.indexOf(node.id) || 0;
        const nodesInLayer = layers[validLayer]?.length || 1;

        // Center nodes in each layer
        const totalWidth = (nodesInLayer - 1) * nodeSpacing;
        const startX = -totalWidth / 2;

        const nodeData = nodeMap.get(node.id);
        const nodeStyle = nodeTypeStyles[nodeData?.type as keyof typeof nodeTypeStyles] || nodeTypeStyles.default;

        return {
            id: node.id,
            data: {
                label: node.name,
                type: nodeData?.type || 'default',
                originalNode: nodeData
            },
            position: {
                x: startX + (indexInLayer * nodeSpacing),
                y: baseY + (validLayer * levelHeight),
            },
            type: 'custom',
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            style: {
                background: 'transparent',
                border: 'none',
                padding: 0,
            }
        };
    });
};

const GraphViewer: React.FC<GraphViewerProps> = ({ graphData }) => {
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [showMiniMap, setShowMiniMap] = useState(true);
    const [nodeInfo, setNodeInfo] = useState<GraphNode | null>(null);

    // Memoize nodes and edges computation
    const { nodes: initialNodes, edges: initialEdges, nodeTypes: availableTypes } = useMemo(() => {
        if (!graphData) return { nodes: [], edges: [], nodeTypes: [] };

        const filteredNodes = graphData.nodes.filter(node => {
            const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || node.type === filterType;
            return matchesSearch && matchesType;
        });

        const nodeIds = new Set(filteredNodes.map(n => n.id));
        const filteredEdges = graphData.edges.filter(edge =>
            nodeIds.has(edge.from) && nodeIds.has(edge.to)
        );

        const layoutedNodes = getLayoutedNodes(filteredNodes, filteredEdges);

        const edges: Edge[] = filteredEdges.map((edge, i) => ({
            id: `e${i}`,
            source: edge.from,
            target: edge.to,
            animated: true,
            style: {
                stroke: '#667eea',
                strokeWidth: 3,
                strokeDasharray: '0',
            },
            type: 'smoothstep',
            markerEnd: {
                type: 'arrowclosed' as MarkerType,
                color: '#667eea',
                width: 20,
                height: 20,
            },
        }));

        const types = [...new Set(graphData.nodes.map(n => n.type))];

        return { nodes: layoutedNodes, edges, nodeTypes: types };
    }, [graphData, searchTerm, filterType]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes when initial nodes change
    React.useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node.id);
        setNodeInfo(node.data.originalNode as GraphNode);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setNodeInfo(null);
    }, []);

    const nodeTypes = useMemo(() => ({
        custom: CustomNode,
    }), []);

    if (!graphData) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
                color: '#718096',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.5 }}>📊</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 16px 0', color: '#4a5568' }}>
                    No Graph Data Available
                </h3>
                <p style={{ fontSize: '1rem', margin: 0, maxWidth: '500px', lineHeight: '1.6' }}>
                    Upload a ZIP file or provide a GitHub repository URL to visualize your Java dependencies and see the interactive graph.
                </p>
            </div>
        );
    }

    const nodeTypeStats = graphData.nodes.reduce((acc, node) => {
        acc[node.type] = (acc[node.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid rgba(76, 81, 191, 0.1)'
            }}>
                <div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#2d3748',
                        margin: '0 0 8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        📊 Dependency Graph
                    </h2>
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            border: '1px solid rgba(76, 81, 191, 0.1)'
                        }}>
                            <strong style={{ color: '#4c51bf' }}>{nodes.length}</strong> Components
                        </div>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            border: '1px solid rgba(76, 81, 191, 0.1)'
                        }}>
                            <strong style={{ color: '#4c51bf' }}>{edges.length}</strong> Dependencies
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search nodes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0',
                            fontSize: '0.875rem',
                            width: '200px',
                            outline: 'none',
                            transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4c51bf'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0',
                            fontSize: '0.875rem',
                            outline: 'none',
                            background: 'white'
                        }}
                    >
                        <option value="all">All Types</option>
                        {availableTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowMiniMap(!showMiniMap)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '2px solid #4c51bf',
                            background: showMiniMap ? '#4c51bf' : 'white',
                            color: showMiniMap ? 'white' : '#4c51bf',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {showMiniMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
                    </button>
                </div>
            </div>

            {/* Graph Container */}
            <div style={{
                height: '600px',
                background: 'white',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    nodesDraggable={true}
                    nodesConnectable={false}
                    elementsSelectable={true}
                    multiSelectionKeyCode={null}
                    deleteKeyCode={null}
                    style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
                    }}
                >
                    <Background
                        color="#e2e8f0"
                        gap={20}
                        size={1}
                    />

                    {showMiniMap && (
                        <MiniMap
                            nodeColor={(node) => {
                                const nodeType = node.data?.type || 'default';
                                return nodeTypeStyles[nodeType as keyof typeof nodeTypeStyles]?.background || nodeTypeStyles.default.background;
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                            }}
                            maskColor="rgba(76, 81, 191, 0.1)"
                        />
                    )}

                    <Controls
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                        }}
                        showZoom={true}
                        showFitView={true}
                        showInteractive={true}
                    />

                    {/* Legend Panel */}
                    <Panel
                        position="top-right"
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                            padding: '16px',
                            backdropFilter: 'blur(10px)',
                            minWidth: '200px'
                        }}
                    >
                        <div>
                            <h4 style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#2d3748',
                                margin: '0 0 12px 0',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Node Types
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {Object.entries(nodeTypeStats).map(([type, count]) => {
                                    const style = nodeTypeStyles[type as keyof typeof nodeTypeStyles] || nodeTypeStyles.default;
                                    return (
                                        <div key={type} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '4px 0'
                                        }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '6px',
                                                background: style.background,
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '10px'
                                            }}>
                                                {style.icon}
                                            </div>
                                            <span style={{
                                                fontSize: '0.875rem',
                                                color: '#4a5568',
                                                fontWeight: '500'
                                            }}>
                                                {type} ({count})
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Panel>

                    {/* Node Info Panel */}
                    {nodeInfo && (
                        <Panel
                            position="bottom-left"
                            style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                padding: '16px',
                                backdropFilter: 'blur(10px)',
                                minWidth: '250px'
                            }}
                        >
                            <h4 style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#2d3748',
                                margin: '0 0 12px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {nodeTypeStyles[nodeInfo.type as keyof typeof nodeTypeStyles]?.icon || '📄'}
                                {nodeInfo.name}
                            </h4>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <div style={{
                                    background: 'rgba(76, 81, 191, 0.1)',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem'
                                }}>
                                    <strong>Type:</strong> {nodeInfo.type}
                                </div>
                                <div style={{
                                    background: 'rgba(76, 81, 191, 0.1)',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem'
                                }}>
                                    <strong>ID:</strong> {nodeInfo.id.substring(0, 8)}...
                                </div>
                            </div>
                        </Panel>
                    )}
                </ReactFlow>
            </div>
        </div>
    );
};

export default GraphViewer;