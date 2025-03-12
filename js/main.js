'use strict'
// const variables
const MINE = '💣'
const FLAG = '🚩'
const NORMAL = '🙂'
const LOSE = '🤯'
const WIN = '😎'
// global variables
var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0
}

// functions
function onInit() {
    gBoard = buildBoard()
    console.table(gBoard)
    renderBoard(gBoard)
    addMine()
    setMinesNegsCount(gBoard)
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isCoverd: true,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[i].length; j++) {
            strHTML += `<td class="cell cell-${i}-${j}" 
                            data-i="${i}" data-j="${j}"
                            onclick="onCellClicked(this,${i},${j})">
                            ${''}
                        </td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}



function renderCell(i, j, value) {
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.innerHTML = value
}



function addMine() {
    gBoard[0][2].isMine = true
    gBoard[3][0].isMine = true
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = countMinesAround(board, i, j)
        }
    }
}

function countMinesAround(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}

function onCellClicked(elCell, i, j) {

    renderCell(0, 2, MINE)
    renderCell(3, 0, MINE)
    renderCell(i, j, gBoard[i][j].minesAroundCount)

}

function onCellMarked(elCell) {

}

function checkGameOver() {

}

function expandReveal(board, elCell, i, j) {

}



// 