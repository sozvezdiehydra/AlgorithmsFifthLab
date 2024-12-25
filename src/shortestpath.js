
function visToGraph() {
    const graph = new Graph(nodes.length);
    edges.forEach(edge => {
        graph.addEdge(edge.from - 1, edge.to - 1, parseInt(edge.label || 1));
    });
    return graph;
}

async function dijkstra(source, sink) {
    const graph = visToGraph();
    const V = graph.V;
    const dist = new Array(V).fill(Infinity); // расстояния
    const parent = new Array(V).fill(-1);   // родители
    const visited = new Array(V).fill(false);

    dist[source] = 0;

    for (let count = 0; count < V - 1; count++) {
        let u = -1;
        let minDistance = Infinity;
        for (let v = 0; v < V; v++) {
            if (!visited[v] && dist[v] < minDistance) {
                minDistance = dist[v];
                u = v;
            }
        }
        if (u === -1) break;
        visited[u] = true;

         const path = [...getUpdatedPath(parent, u, source)];
         await visualizeStep(path, dist, graph);

          for (const edge of graph.adj[u]) {
            const v = edge.to;
             const weight = edge.capacity;
           if (!visited[v] && dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                parent[v] = u;
            }
        }
        
        if (u === sink) break;
    }


    const path = [...getUpdatedPath(parent, sink, source)];
  return {dist: dist[sink] === Infinity ? 'no path' : dist[sink], path: path.map(x => x + 1)};
}


// Функция для визуализации шага
async function visualizeStep(path, dist, graph) {
    return new Promise(resolve => {
       setTimeout(() => {
            edges.forEach(edge => {
               edges.update({ id: edge.id, color: { color: 'black' } });
           });

          const edgesWithFlow = [];
           for (let i = 1; i < path.length; i++) {
             const u = path[i-1] - 1;
               const v = path[i] - 1;
                if(u >=0 && v >= 0) {
                    const visEdge = edges.get({
                        filter: function (visEdge) {
                            return (
                                (visEdge.from === u + 1 && visEdge.to === v + 1) ||
                                (visEdge.to === u + 1 && visEdge.from === v + 1)
                            );
                        },
                    })[0];
                  if(visEdge) edgesWithFlow.push(visEdge);
                }
             }
               edgesWithFlow.forEach(edge => {
                   edges.update({ id: edge.id, color: { color: '#ff5733' } });
               });

         // Подсветка узлов
         nodes.forEach(node => {
                const nodeIndex = path.findIndex(x => x == node.id)
               if (nodeIndex !== -1)  highlightNode(node.id, '#f39c12');
         })

          updateDescription('Dijkstra', [`Текущий путь ${path.join(' -> ')}`]);
           resolve();
       }, 500)
   })
}



function getUpdatedPath(parent, sink, source) {
    const path = [];
    let current = sink;
    while (current !== -1) {
        path.push(current);
         if(current === source) {
             break;
        }
         current = parent[current];
    }
    return path.reverse();
}


// Функция для запуска алгоритма Дейкстры
document.getElementById('startDijkstra').addEventListener('click', async () => {
    const selectedNodes = network.getSelectedNodes();
    if (selectedNodes.length === 2) {
        const [source, sink] = selectedNodes;
      
        const { dist, path} = await dijkstra(source - 1, sink - 1);
          if(dist === 'no path') {
            updateDescription('Dijkstra', [`Нет пути от ${source} до ${sink}`])
          }
          else {
            updateDescription('Dijkstra', [`Кратчайший путь от ${source} до ${sink} равен ${dist} `, `путь ${path.join(' -> ')}`]);
          }

    } else {
        alert('Select exactly two nodes (source and sink) to calculate the shortest path');
    }
});