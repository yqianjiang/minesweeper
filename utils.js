export const checkClickBtn = ([cx, cy], btn) => {
    return cx > btn.x && cx < btn.x + btn.w && cy > btn.y && cy < btn.y + btn.h;
}