type Cell = Set<string>;

// Buckets of ids by where they stand, so asking who is near a point visits the
// few cells around it and not everybody. The cell is at least as wide as the
// radius usually asked about, which keeps a query to a block of 3 by 3 cells.
export class SpatialGrid {
    private readonly cells = new Map<string, Cell>();
    private readonly where = new Map<
        string,
        { x: number; y: number; cellKey: string }
    >();

    constructor(private readonly cellSize: number) {}

    private cellKeyOf(x: number, y: number): string {
        return `${Math.floor(x / this.cellSize)}:${Math.floor(y / this.cellSize)}`;
    }

    set(id: string, x: number, y: number): void {
        const cellKey = this.cellKeyOf(x, y);
        const previous = this.where.get(id);

        if (previous && previous.cellKey !== cellKey) {
            this.dropFromCell(id, previous.cellKey);
        }
        if (!previous || previous.cellKey !== cellKey) {
            const cell = this.cells.get(cellKey) ?? new Set<string>();
            cell.add(id);
            this.cells.set(cellKey, cell);
        }
        this.where.set(id, { x, y, cellKey });
    }

    remove(id: string): void {
        const previous = this.where.get(id);
        if (!previous) return;

        this.dropFromCell(id, previous.cellKey);
        this.where.delete(id);
    }

    has(id: string): boolean {
        return this.where.has(id);
    }

    get(id: string): { x: number; y: number } | undefined {
        return this.where.get(id);
    }

    // Every id within `radius` of the point, the one at the point included.
    query(x: number, y: number, radius: number): string[] {
        const minCellX = Math.floor((x - radius) / this.cellSize);
        const maxCellX = Math.floor((x + radius) / this.cellSize);
        const minCellY = Math.floor((y - radius) / this.cellSize);
        const maxCellY = Math.floor((y + radius) / this.cellSize);
        const radiusSquared = radius * radius;

        const found: string[] = [];
        for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
            for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
                const cell = this.cells.get(`${cellX}:${cellY}`);
                if (!cell) continue;

                for (const id of cell) {
                    const spot = this.where.get(id);
                    if (!spot) continue;

                    const dx = spot.x - x;
                    const dy = spot.y - y;
                    if (dx * dx + dy * dy <= radiusSquared) found.push(id);
                }
            }
        }
        return found;
    }

    get size(): number {
        return this.where.size;
    }

    private dropFromCell(id: string, cellKey: string): void {
        const cell = this.cells.get(cellKey);
        if (!cell) return;

        cell.delete(id);
        if (cell.size === 0) this.cells.delete(cellKey);
    }
}
