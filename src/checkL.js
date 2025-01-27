// function isCheck() {
//     // Find king position
//     let kingRow = -1;
//     let kingCol = -1;
//     boardState.forEach((row, rowIndex) => {
//         row.forEach((piece, colIndex) => {
//             if (piece === (currentPlayer === 'white' ? 'K' : 'k')) {
//                 kingRow = rowIndex;
//                 kingCol = colIndex;
//                 console.log(`King found at (${kingRow}, ${kingCol})`);
//             }
//         });
//     });

//     // Check if any opponent piece can capture the king
//     for (let row = 0; row < 8; row++) {
//         for (let col = 0; col < 8; col++) {
//             if (isCurrentPlayerPiece(row, col, currentPlayer === 'white' ? 'black' : 'white')) {
//                 if (isValidMove(row, col, kingRow, kingCol, currentPlayer === 'white' ? 'black' : 'white')) {
//                     const ksquare = document.querySelector(`[data-row='${kingRow}'][data-col='${kingCol}']`);
//                     if (ksquare) {
//                         ksquare.classList.add('kingcheck');
//                     }
//                     return true;
//                 }
//             }
//         }
//     }
//     return false;
// }