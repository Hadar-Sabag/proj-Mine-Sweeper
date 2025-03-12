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
    gGame.isOn = true
    gBoard = buildBoard()
    console.table(gBoard)
    addMinesRandomly(gBoard, gLevel.MINES)
    renderBoard(gBoard)
    setMinesNegsCount(gBoard)
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isCovered: true,
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
                            onclick="onCellClicked(this,${i},${j})"
                            oncontextmenu="onCellMarked(event, this, ${i}, ${j})">
                            ${''}
                        </td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function addMinesRandomly(board, minesCount) {

    var minesPlaced = 0
    while (minesPlaced < minesCount) {
        var i = getRandomInt(0, board.length)
        var j = getRandomInt(0, board[0].length)

        if (!board[i][j].isMine) {
            board[i][j].isMine = true
            minesPlaced++
        }
    }

    // gBoard[0][2].isMine = true
    // gBoard[3][0].isMine = true
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

    if (!gGame.isOn) return

    var cell = gBoard[i][j]
    // if already clicked of has flag 
    if (!cell.isCovered || cell.isMarked) return
    // if has mine
    if (cell.isMine) {
        elCell.innerText = MINE
        cell.isCovered = false
        revealAllMines()
        // checkGameOver()
        gGame.isOn = false /// אחרי זה להכניס את זה לפונקציה
        return
    }
    // non of the conds
    elCell.innerText = cell.minesAroundCount || ''
    expandReveal(gBoard, elCell, i, j)
    cell.isCovered = false

    elCell.classList.add('revealed')
}

function revealAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.innerHTML = MINE
                elCell.classList.add('revealed')
            }
        }
    }
}

function revealMinesAroundCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isMine || !cell.isMarked) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.innerHTML = cell.minesAroundCount
                elCell.classList.add('revealed')
            }
        }
    }
}


function onCellMarked(event, elCell, i, j) {
    event.preventDefault()

    if (!gGame.isOn) return

    var cell = gBoard[i][j]

    if (!cell.isCovered) return

    if (cell.isCovered) {
        if (!cell.isMarked) {
            cell.isMarked = true
            elCell.innerText = FLAG
            gGame.markedCount++
        } else {
            cell.isMarked = false
            elCell.innerText = ''
            gGame.markedCount--
        }
    }
}

function checkGameOver() {

}

function expandReveal(board, elCell, rowIdx, colIdx) {
    console.log('elCell: ', elCell)

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (!currCell.isMine && currCell.isCovered) {
                var elNegs = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

                elNegs.classList.add('revealed')
            }
        }
    }
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function levelBtn(elBtn) {
    var tbl = document.querySelector('table')
    tbl.style.display = 'block'
    if (elBtn.classList.contains('Beginner')) {
        gLevel.SIZE = 4
        gLevel.MINES = 4
    } else if (elBtn.classList.contains('Medium')) {
        gLevel.SIZE = 8
        gLevel.MINES = 20
    } else if (elBtn.classList.contains('Expert')) {
        gLevel.SIZE = 12
        gLevel.MINES = 32
    }
    onInit()
}


