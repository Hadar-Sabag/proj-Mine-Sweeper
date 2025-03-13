'use strict'
// const variables
const MINE = '💣'
const FLAG = '🚩'
const NORMAL = '🙂'
const LOSE = '🤯'
const WIN = '😎'
// global variables
var gBoard
var gMinesCount
var gTimerInterval
var gLevel = {
    SIZE: 4,
    MINES: 4
}
var gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    clickcounter: 0,
    life: 3,
    hint: 3
}

// functions
function onInit() {
    gGame = {
        isOn: true,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0,
        clickcounter: 0,
        life: 3,
        hint: 3
    }
    gMinesCount = gLevel.MINES
    gBoard = buildBoard()
    // console.table(gBoard)
    renderBoard(gBoard)
    updateMinesCounter(0)

    const elspan = document.querySelector('.smile')
    elspan.innerText = NORMAL

    document.querySelector('.life span').innerText = gGame.life
    document.querySelector('.hint span').innerText = gGame.hint
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

function setDifficulty(elBtn) {
    const tbl = document.querySelector('table')
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

function placeMinesFirstClickSafe(firstI, firstJ) {

    var minesPlaced = 0
    while (minesPlaced < gLevel.MINES) {
        var i = getRandomInt(0, gBoard.length)
        var j = getRandomInt(0, gBoard[0].length)

        // לוודא שלא שמים מוקש על התא הראשון
        if (i === firstI && j === firstJ) continue
        if (gBoard[i][j].isMine) continue

        gBoard[i][j].isMine = true
        minesPlaced++
    }
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

function expandReveal(board, elCell, rowIdx, colIdx) {
    // console.log('elCell: ', elCell)

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (!currCell.isMine && currCell.isCovered) {
                if (currCell.isMarked) return
                if (currCell.isCovered) {
                    currCell.isCovered = false
                    gGame.revealedCount++

                    var elNegs = document.querySelector
                        (`[data-i="${i}"][data-j="${j}"]`)
                    elNegs.classList.add('revealed')

                    elNegs.innerText = !currCell.minesAroundCount ? '' : currCell.minesAroundCount
                }
            }
        }
    }
}

function updateMinesCounter(diff) {

    if (!gMinesCount) gMinesCount = gLevel.MINES
    if (gGame.markedCount > gLevel.MINES) gMinesCount = 0
    gMinesCount -= diff

    const elspan = document.querySelector('.mines-counter')
    elspan.innerText = String(gMinesCount).padStart(3, '0')
}

function onCellClicked(elCell, i, j) {
    var cell = gBoard[i][j]
    if (!gGame.isOn) return

    if (gGame.clickcounter === 0) {
        placeMinesFirstClickSafe(i, j)
        setMinesNegsCount(gBoard)
        startTimer()
    }

    if (cell.isMarked) return
    if (elCell.classList.contains('revealed')) return
    if (!cell.isMine && cell.isCovered) {
        gGame.revealedCount++
    }
    if (cell.isMine) {
        elCell.innerText = MINE
        cell.isCovered = false
        checkLifes(elCell, i, j)
        // checkGameOver()
        return
    }
    gGame.clickcounter++
    expandReveal(gBoard, elCell, i, j)
    cell.isCovered = false

    elCell.innerText = cell.minesAroundCount || ''
    elCell.classList.add('revealed')

    checkVictory(gBoard)
    console.log('gGame.clickcounter: ', gGame.clickcounter)
}

function onCellMarked(event, elCell, i, j) {
    event.preventDefault()
    var cell = gBoard[i][j]

    if (!gGame.isOn) return
    if (elCell.classList.contains('revealed')) {
        return
    }
    if (cell.isCovered) {
        if (!cell.isMarked) {
            cell.isMarked = true
            gGame.markedCount++
            updateMinesCounter(1)

            elCell.innerText = FLAG
        } else {
            cell.isMarked = false
            gGame.markedCount--
            updateMinesCounter(-1)

            elCell.innerText = ''
        }
    }
    checkVictory(gBoard)
}

function startTimer() {

    gGame.secsPassed = 0
    clearInterval(gTimerInterval)
    gTimerInterval = setInterval(() => {
        gGame.secsPassed++
        var elTimer = document.querySelector('.timer')
        elTimer.innerText = String(gGame.secsPassed).padStart(3, '0')
    }, 1000)
}

function stopTimer() {
    clearInterval(gTimerInterval)
}

function checkGameOver() {
    gGame.isOn = false
    revealAllMines()
    stopTimer()

    const elspan = document.querySelector('.smile')
    elspan.innerText = LOSE
}

function checkVictory(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j]
            if ((gGame.revealedCount ===
                (gLevel.SIZE ** 2) - gLevel.MINES)
                && (gGame.markedCount === gLevel.MINES)
                && (cell.isMine && cell.isMarked)) {

                gGame.isOn = false
                stopTimer()

                const elspan = document.querySelector('.smile')
                elspan.innerText = WIN
            }
        }
    }
}

function checkLifes(elCell, i, j) {
    if (gGame.life > 0) {
        gGame.life--

        var elspan = document.querySelector('.life span')
        elspan.innerText = gGame.life

        elCell.innerText = MINE
        elCell.classList.add('revealed')

        setTimeout(() => {
            elCell.innerText = ''
            elCell.classList.remove('revealed')
            gBoard[i][j].isCovered = true
        }, 500)
    } else if (!gGame.life) {
        checkGameOver()
    }
}

function setHints(elHint, board, rowIdx, colIdx) {
    if (gGame.hint > 0) {
        gGame.hint--
        var elspan = document.querySelector('.hint span')
        elspan.innerText = gGame.hint
        elHint.classList.add('on')

        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i >= board.length) continue
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (i === rowIdx && j === colIdx) continue
                if (j < 0 || j >= board[0].length) continue
                var currCell = board[i][j]
                if (currCell.isCovered) {
                    var elCell = document.querySelector
                        (`[data-i="${i}"][data-j="${j}"]`)
                    elCell.classList.add('revealed')
                }
            }
        }
        setTimeout(() => {
            elHint.classList.remove('on')
            // elCell.classList.remove('revealed')
        }, 1500)
    }
}

function highlightAvailableSeatsAround(board, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isSeat && !currCell.isBooked) {
                const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                // console.log('elCell: ', elCell)
                elCell.classList.add('highlight')
                setTimeout(() => {
                    elCell.classList.remove('highlight')
                }, '2500')
            }
        }
    }
}

