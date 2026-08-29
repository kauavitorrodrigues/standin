function hashToHue(id: string, seed: number): number {
    let hash = seed;
    for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % 360;
}

export function getSpaceGradient(id: string): string {
    const from = hashToHue(id, 0);
    const to = hashToHue(id, 17);
    return `linear-gradient(135deg, hsl(${from} 80% 60%), hsl(${to} 80% 45%))`;
}
