export const checkClickBtn = ([cx, cy], btn) => {
    const scaleFactor = 1;
    cx /= scaleFactor;
    cy /= scaleFactor;
    return cx > btn.x && cx < btn.x + btn.w && cy > btn.y && cy < btn.y + btn.h;
}