function visToGraph() {
    const graph = new Graph(nodes.length);
    edges.forEach(edge => {
        graph.addEdge(edge.from - 1, edge.to - 1, parseInt(edge.label || 1));
    });
    return graph;
}

function graphToVis(graph) {
    nodes.clear();
    edges.clear();
     for (let i = 0; i < graph.V; i++) {
        nodes.add({ id: i + 1, label: `${i + 1}` });
    }
    for (let u = 0; u < graph.V; u++) {
        for (const edge of graph.adj[u]) {
            if (u < edge.to) {
                edges.add({ from: u + 1, to: edge.to + 1, label: String(edge.weight || edge.capacity )});
            }
        }
    }
}


async function primMST() {
    const graph = visToGraph();
    const V = graph.V;
    const mstSet = new Array(V).fill(false); // Набор вершин MST
    const key = new Array(V).fill(Infinity); // Ключ (вес)
    const parent = new Array(V).fill(-1);   // Родитель

    key[0] = 0;

    for (let count = 0; count < V - 1; count++) {
      let u = -1;
      let minKey = Infinity;
       for (let v = 0; v < V; v++) {
            if (!mstSet[v] && key[v] < minKey) {
                minKey = key[v];
                u = v;
            }
        }
        if (u === -1) break;
        mstSet[u] = true;

        const path =  [...getUpdatedPath(parent, u, 0)];
           await visualizeStep(0, path, key);

      for(const edge of graph.adj[u]) {
           const v = edge.to;
          const weight = edge.capacity;
            if (!mstSet[v] && weight < key[v]) {
                parent[v] = u;
                key[v] = weight;
            }
        }
    }
    const mstGraph = new Graph(V);
    for (let i = 1; i < V; i++) {
      mstGraph.addEdge(parent[i], i, key[i]);
    }

    return mstGraph;
}

async function visualizeStep(flow, path, key = []) {
  return new Promise(resolve => {
      setTimeout(() => {
         edges.forEach(edge => {
              edges.update({ id: edge.id, color: { color: 'black' } }); 
          });

          const edgesWithFlow = [];
          const graph = visToGraph()
            for (let u = 0; u < graph.V; u++) {
                for (const edge of graph.adj[u]) {
                   if (u < edge.to && key[u] < Infinity && key[edge.to] < Infinity) {
                    const visEdge = edges.get({
                        filter: function (visEdge) {
                            return (
                                (visEdge.from === u + 1 && visEdge.to === edge.to + 1) ||
                                (visEdge.to === u + 1 && visEdge.from === edge.to + 1)
                                  );
                        },
                    })[0];
                       if (visEdge) {
                            edgesWithFlow.push(visEdge);
                          }
                    }
                }
            }
            edgesWithFlow.forEach(edge => {
               edges.update({ id: edge.id, color: { color: '#ff5733' } });
            });
            // цвет узлов
          path.forEach(nodeId => highlightNode(nodeId + 1, '#f39c12'));
          updateDescription('MST', [`Текущий путь ${path.map(x => x + 1).join(' -> ')}`]);
         resolve()
      }, 500)
  })
}


function getUpdatedPath(parent, sink, source) {
    const path = [];
    let current = sink;
    while (current !== source) {
        path.push(current);
        current = parent[current];
    }
    path.push(source);
    return path.reverse()
}

document.getElementById('startMST').addEventListener('click', async () => {
    const mst = await primMST();
    graphToVis(mst);
});