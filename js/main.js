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
    name: 'Beginner',
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
    hint: 3,
    isHintActive: false,
    safeClick: 3,
    bestScore: 0
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
        hint: 3,
        isHintActive: false,
        safeClick: 3,
        bestScore: 0
    }
    updateBestScoreDisplay(gLevel.name)
    gMinesCount = gLevel.MINES
    gBoard = buildBoard()
    renderBoard(gBoard)
    updateMinesCounter(0)
    stopTimer()
    document.querySelector('.timer').innerText = '000'
    const elspan = document.querySelector('.smile')
    elspan.innerText = NORMAL
    document.querySelector('.life span').innerText = gGame.life
    document.querySelector('.hint span').innerText = gGame.hint
    document.querySelector('.safe span').innerText = gGame.safeClick
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
        gLevel.name = 'Beginner'
    } else if (elBtn.classList.contains('Medium')) {
        gLevel.SIZE = 8
        gLevel.MINES = 20
        gLevel.name = 'Medium'
    } else if (elBtn.classList.contains('Expert')) {
        gLevel.SIZE = 12
        gLevel.MINES = 32
        gLevel.name = 'Expert'
    }
    onInit()
}

function placeMinesFirstClickSafe(firstI, firstJ) {

    var minesPlaced = 0
    while (minesPlaced < gLevel.MINES) {
        var i = getRandomInt(0, gBoard.length)
        var j = getRandomInt(0, gBoard[0].length)

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

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue

            var currCell = board[i][j]
            if (currCell.isMine || !currCell.isCovered || currCell.isMarked) continue

            currCell.isCovered = false
            gGame.revealedCount++

            var elNegs = document.querySelector
                (`[data-i="${i}"][data-j="${j}"]`)
            elNegs.classList.add('revealed')
            elNegs.innerText = currCell.minesAroundCount || ''
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
    if (gGame.isHintActive) {
        revealForHint(i, j)
        gGame.isHintActive = false
        return
    }
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
        return
    }

    gGame.clickcounter++
    expandReveal(gBoard, elCell, i, j)
    cell.isCovered = false

    elCell.innerText = cell.minesAroundCount || ''
    elCell.classList.add('revealed')

    checkVictory(gBoard)
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

    if (gGame.revealedCount === (gLevel.SIZE ** 2) - gLevel.MINES &&
        gGame.markedCount === gLevel.MINES) {

        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                var cell = board[i][j]
                if (cell.isMine && !cell.isMarked) return
            }
        }
        gGame.isOn = false
        stopTimer()

        const elspan = document.querySelector('.smile')
        elspan.innerText = WIN
        saveBestScore(gLevel.name, gGame.secsPassed)
        updateBestScoreDisplay(gLevel.name)
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

function onHintClick() {

    if (gGame.clickcounter < 1 || gGame.hint <= 0) return

    gGame.isHintActive = true
    gGame.hint--

    document.querySelector('.hint span').innerText = gGame.hint
}

function revealForHint(rowIdx, colIdx) {

    var revealedCells = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue

            var cell = gBoard[i][j]
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

            if (cell.isCovered) {
                elCell.classList.add('revealed')
                elCell.innerText = cell.isMine ? MINE : (cell.minesAroundCount || '')
                revealedCells.push({ elCell, cell })
            }
        }
    }
    setTimeout(() => {
        for (var i = 0; i < revealedCells.length; i++) {
            var elCell = revealedCells[i].elCell
            elCell.classList.remove('revealed')
            elCell.innerText = ''
        }
    }, 1500)
}

function onSafeClick() {

    if (gGame.safeClick <= 0) return
    gGame.safeClick--
    document.querySelector('.safe span').innerText = gGame.safeClick
    revealForSafe(gBoard)
}

function revealForSafe(board) {

    var safeCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isMine && cell.isCovered) {
                safeCells.push({ i, j })
            }
        }
    }
    if (safeCells.length > 0) {
        var randIdx = getRandomInt(0, safeCells.length)
        var randCell = safeCells[randIdx]

        var elCell = document.querySelector(`.cell.cell-${randCell.i}-${randCell.j}`)
        elCell.classList.add('revealed-safe')

        setTimeout(() => {
            elCell.classList.remove('revealed-safe')
        }, 1500)
    }
}

function saveBestScore(level, score) {

    var bestScore = +localStorage.getItem(level) || Infinity

    if (!bestScore || score < bestScore) {
        localStorage.setItem(level, score)
    }
}

function getBestScore(level) {

    return localStorage.getItem(level) || '---'
}

function updateBestScoreDisplay(level) {

    var elBestScore = document.querySelector('.best-score span')
    elBestScore.innerText = `${getBestScore(level)}`
}

function toggleDarkMode() {

    var body = document.body
    body.classList.toggle('dark-mode')

    var btn = document.querySelector('.toggle-mode-btn')
    if (body.classList.contains('dark-mode')) {
        btn.innerText = 'Light Mode'
    } else {
        btn.innerText = 'Dark Mode'
    }
}

