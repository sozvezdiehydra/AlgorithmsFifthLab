class Graph {
    constructor(V) {
        this.V = V; // количество вершин
        this.adj = Array.from({ length: V }, () => []); // Массив смежности
        this.flow = {}; // Объект для хранения потока по рёбрам
    }

    // Метод для добавления рёбер
    addEdge(u, v, capacity) {
        if (u < 0 || u >= this.V || v < 0 || v >= this.V) {
            throw new Error(`Ошибка: вершины u (${u}) или v (${v}) выходят за пределы графа.`);
        }

        this.adj[u].push({ to: v, capacity: capacity, flow: 0 });
        this.adj[v].push({ to: u, capacity: 0, flow: 0 }); // Обратное ребро с нулевой ёмкостью
    }

    // Алгоритм поиска в ширину (BFS)
    bfs(source, sink, parent) {
        const visited = Array(this.V).fill(false);
        const queue = [source];
        visited[source] = true;

        while (queue.length > 0) {
            const u = queue.shift();
            for (let i = 0; i < this.adj[u].length; i++) {
                const { to, capacity, flow } = this.adj[u][i];
                const residual = capacity - flow;
                if (!visited[to] && residual > 0) {
                    queue.push(to);
                    visited[to] = true;
                    parent[to] = u;
                    if (to === sink) return true;
                }
            }
        }
        return false;
    }

    dfs(source, sink, flow, parent) {
        if (source === sink) return flow;

        for (let i = 0; i < this.adj[source].length; i++) {
            const { to, capacity, flow: edgeFlow } = this.adj[source][i];
            const residual = capacity - edgeFlow;
            if (residual > 0 && parent[to] === source) {
                const currentFlow = Math.min(flow, residual);
                const tempFlow = this.dfs(to, sink, currentFlow, parent);
                if (tempFlow > 0) {
                    this.adj[source][i].flow += tempFlow;
                    this.adj[to].forEach(edge => {
                        if (edge.to === source) edge.flow -= tempFlow; // Обратный поток
                    });
                    return tempFlow;
                }
            }
        }
        return 0;
    }

    dinic(source, sink) {
        let totalFlow = 0;
        let parent = Array(this.V);
        let flow;

        while (this.bfs(source, sink, parent)) {
            while ((flow = this.dfs(source, sink, Infinity, parent)) > 0) {
                totalFlow += flow;
            }
        }

        return totalFlow;
    }
}
