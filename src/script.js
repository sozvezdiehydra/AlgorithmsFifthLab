function highlightNode(nodeId) {
    nodes.update({ id: nodeId, color: { background: '#ff5733', border: '#c1351d' } });
}

function resetHighlight() {
    nodes.forEach(node => {
        nodes.update({ id: node.id, color: { background: '#28a745', border: '#1d7a1d' } });
    });
}

function updateDescription(stepType, steps) {
    document.getElementById('description').innerText = `${stepType} Steps: ${steps.join(' -> ')}`;
}

// Функция для запуска алгоритма максимального потока
document.getElementById('startMaxFlow').addEventListener('click', () => {
    const selectedNodes = network.getSelectedNodes();
    if (selectedNodes.length === 2) {
        const [source, sink] = selectedNodes;
        visualizeMaxFlow(source, sink);
    } else {
        alert('Select exactly two nodes (source and sink) to calculate the max flow');
    }
});

function visualizeMaxFlow(source, sink) {
    const graph = new Graph(nodes.length);

    edges.forEach(edge => {
        graph.addEdge(edge.from - 1, edge.to - 1, edge.label || 10);
    });

    console.log('Graph constructed:', graph);

    let totalFlow = 0;
    let parent = new Array(graph.V);

    async function visualizeStep(flow, path, delay = 500) {
      return new Promise(resolve => {
        setTimeout(() => {

          edges.forEach(edge => {
              edges.update({ id: edge.id, color: { color: 'black' } });
          });

          const edgesWithFlow = [];
          for (let u = 0; u < graph.V; u++) {
            for (const edge of graph.adj[u]) {
              if (edge.flow > 0) {
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

          path.forEach(nodeId => highlightNode(nodeId + 1, '#f39c12'));
          updateDescription('Max Flow', [`${flow} пропущено по пути ${path.map(x => x + 1).join(' -> ')}`]);
          resolve();
        }, delay);
      });
    }

    async function bfs(source, sink, parent) {
       return new Promise(resolve => {
         let visited = new Array(graph.V).fill(false);
         const queue = [source];
         visited[source] = true;

         const animate = async () => {
           if(queue.length === 0) {
             resolve(false);
             return;
           }
           const u = queue.shift();
           for (let i = 0; i < graph.adj[u].length; i++) {
              const { to, capacity, flow } = graph.adj[u][i];
              const residual = capacity - flow;
               if (!visited[to] && residual > 0) {
                    queue.push(to);
                    visited[to] = true;
                    parent[to] = u;
                    await visualizeStep(0, [...getUpdatedPath(parent, to, source)]);
                    if (to === sink) {
                        resolve(true)
                        return;
                    }
               }

           }
           setTimeout(animate, 0);
         }
          animate()
        })
    }

    async function dfs(source, sink, flow, parent) {
        if (source === sink) return flow;

        for (let i = 0; i < graph.adj[source].length; i++) {
            const { to, capacity, flow: edgeFlow } = graph.adj[source][i];
            const residual = capacity - edgeFlow;
            if (residual > 0 && parent[to] === source) {
                const currentFlow = Math.min(flow, residual);
                const tempFlow = await dfs(to, sink, currentFlow, parent);
                if (tempFlow > 0) {
                    // Обновляем потоки по пути
                    graph.adj[source][i].flow += tempFlow;
                      graph.adj[to].forEach(edge => {
                        if (edge.to === source) edge.flow -= tempFlow; // Обратный поток
                    });
                  await  visualizeStep(tempFlow, [...getUpdatedPath(parent, to, source)])
                    return tempFlow;
                }
            }
        }
        return 0;
    }

    async function runDinic() {
        while (await bfs(source - 1, sink - 1, parent)) {
            let flow;
            while ((flow = await dfs(source - 1, sink - 1, Infinity, parent)) > 0) {
                totalFlow += flow;
            }
        }
          console.log('Max Flow:', totalFlow);
       updateDescription('Max Flow', [`Общий поток: ${totalFlow}`]);
       setTimeout(resetNodeColors, 500)
    }
    runDinic();
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

function resetNodeColors() {
    nodes.forEach(node => {
        nodes.update({ id: node.id, color: { background: '#28a745', border: '#1d7a1d' } });
    });
}

function resetHighlight() {
    nodes.forEach(node => {
        nodes.update({ id: node.id, color: { background: '#28a745', border: '#1d7a1d' } });
    });
}

function updateDescription(stepType, steps) {
    document.getElementById('description').innerText = `${stepType} Steps: ${steps.join(' -> ')}`;
}

function bfs(startNode) {
    const visited = new Set();
    const queue = [startNode];
    const steps = [];

    while (queue.length > 0) {
        const nodeId = queue.shift();
        if (!visited.has(nodeId)) {
            visited.add(nodeId);
            steps.push(nodeId);

            console.log(`BFS Step: Visited Node ${nodeId}`);
            updateDescription('BFS', steps);

            const neighbors = edges.get({ filter: (edge) => edge.from === nodeId }).map(edge => edge.to);
            neighbors.forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                }
            });
        }
    }
    return steps;
}

function dfs(startNode) {
    const visited = new Set();
    const stack = [startNode];
    const steps = [];

    while (stack.length > 0) {
        const nodeId = stack.pop();
        if (!visited.has(nodeId)) {
            visited.add(nodeId);
            steps.push(nodeId);

            console.log(`DFS Step: Visited Node ${nodeId}`);
            updateDescription('DFS', steps);

            const neighbors = edges.get({ filter: (edge) => edge.from === nodeId }).map(edge => edge.to);
            neighbors.forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    stack.push(neighbor);
                }
            });
        }
    }
    return steps;
}

// Начать обход в ширину (BFS)
document.getElementById('startBFS').addEventListener('click', () => {
    const startNode = nodes.length > 0 ? nodes.get()[0].id : null;
    if (startNode) {
        const bfsSteps = bfs(startNode);
        let i = 0;
        const interval = setInterval(() => {
            if (i < bfsSteps.length) {
                const nodeId = bfsSteps[i];
                highlightNode(nodeId);
                updateDescription('BFS', bfsSteps.slice(0, i + 1)); // Обновляем описание
                i++;
            } else {
                clearInterval(interval);
                resetHighlight();
            }
        }, 1000); // Задержка между шагами
    }
});

// Начать обход в глубину (DFS)
document.getElementById('startDFS').addEventListener('click', () => {
    const startNode = nodes.length > 0 ? nodes.get()[0].id : null;
    if (startNode) {
        const dfsSteps = dfs(startNode);
        let i = 0;
        const interval = setInterval(() => {
            if (i < dfsSteps.length) {
                const nodeId = dfsSteps[i];
                highlightNode(nodeId);
                updateDescription('DFS', dfsSteps.slice(0, i + 1)); // Обновляем описание
                i++;
            } else {
                clearInterval(interval);
                resetHighlight();
            }
        }, 1000); // Задержка между шагами
    }
});