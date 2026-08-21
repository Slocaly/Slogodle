import { CARD_GAP, CARD_SIZE, GRID_COLUMNS } from "../constants";

export function getCardCenter(index: number, choiceCount: number): { x: number; y: number } {
    const rows = Math.ceil(choiceCount / GRID_COLUMNS);
    const gridWidth = GRID_COLUMNS * CARD_SIZE + (GRID_COLUMNS - 1) * CARD_GAP;
    const gridHeight = rows * CARD_SIZE + (rows - 1) * CARD_GAP;
    const col = index % GRID_COLUMNS;
    const row = Math.floor(index / GRID_COLUMNS);
    const x = -gridWidth / 2 + col * (CARD_SIZE + CARD_GAP) + CARD_SIZE / 2;
    const y = -gridHeight / 2 + row * (CARD_SIZE + CARD_GAP) + CARD_SIZE / 2;
    return { x, y };
}
