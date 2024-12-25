const nodes = new vis.DataSet([]);
const edges = new vis.DataSet([]);

const container = document.getElementById('graph');
const data = { nodes: nodes, edges: edges };
const options = {
    edges: {
        smooth: { type: 'continuous' },
        color: { color: '#ff851b' }
    },
    nodes: {
        shape: 'dot',
        size: 15,
        color: { background: '#28a745', border: '#1d7a1d' }
    },
    physics: {
        enabled: false
    },
    interaction: {
        multiselect: true,
        dragNodes: true,
        selectConnectedEdges: false
    }
};
const network = new vis.Network(container, data, options);

document.getElementById('addNode').addEventListener('click', () => {
    const id = nodes.length + 1;
    nodes.add({ id, label: `Node ${id}` });
});

document.getElementById('addEdge').addEventListener('click', () => {
    const selectedNodes = network.getSelectedNodes();
    if (selectedNodes.length === 2) {
        const [from, to] = selectedNodes;
        const weight = prompt('Enter weight for the edge:');
        edges.add({ from, to, label: weight, weight: parseInt(weight) });
    } else {
        alert('Select exactly two nodes to add an edge');
    }
});

document.getElementById('removeNode').addEventListener('click', () => {
    const selectedNodes = network.getSelectedNodes();
    if (selectedNodes.length > 0) {
        nodes.remove(selectedNodes);
    } else {
        alert('Select a node to remove');
    }
});

document.getElementById('removeEdge').addEventListener('click', () => {
    const selectedEdges = network.getSelectedEdges();
    if (selectedEdges.length > 0) {
        edges.remove(selectedEdges);
    } else {
        alert('Select an edge to remove');
    }
});
