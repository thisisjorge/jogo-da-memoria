document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
  const gameBoard = document.querySelector(".game-board")
  const attemptsElement = document.getElementById("attempts")
  const finalAttemptsElement = document.getElementById("final-attempts")
  const congratulationsElement = document.getElementById("congratulations")
  const restartButton = document.getElementById("restart-btn")
  const historyList = document.getElementById("history-list")
  const easyButton = document.getElementById("easy-btn")
  const mediumButton = document.getElementById("medium-btn")
  const hardButton = document.getElementById("hard-btn")

  // Imagens organizadas por nível de dificuldade
  const difficultyImages = {
    easy: [
      "assets/img/maxresdefault.jpg",
      "assets/img/Chip_Base_Tier_1.webp",
      "assets/img/Chibi_Malphite_Base_Tier_1.webp",
    ],
    medium: [
      // Você pode adicionar imagens específicas para o nível médio aqui
      // Por enquanto, vamos usar as mesmas do nível fácil como exemplo
      "assets/img/Chibi_Ekko_Firelight_Tier_1.webp",
      "assets/img/Chibi_Jinx_Base_Tier_1.webp",
      "assets/img/Poro_Santa_Tier_1.webp",
      // Espaço para adicionar mais 3 imagens para completar os 6 pares
      "assets/img/Chibi_Miss_Fortune_Base_Tier_1.webp",
      "assets/img/Chibi_Riven_Dawnbringer_Tier_1.webp",
      "assets/img/Chibi_Seraphine_KDA_ALL_OUT_Tier_1.webp",
    ],
    hard: [
      // Você pode adicionar imagens específicas para o nível difícil aqui
      // Por enquanto, vamos usar as mesmas do nível fácil como exemplo
      "assets/img/Chibi_Vi_Base_Tier_1.webp",
      "assets/img/chibi-poro-rider-sejuanni-for-fight-of-the-golden-spatula-v0-mgnetmofkt5e1.webp",
      "assets/img/Chibi_Akali_KDA_ALL_OUT_Tier_1.webp",
      // Espaço para adicionar mais 6 imagens para completar os 9 pares
      "assets/img/chibi_aatrox.webp",
      "assets/img/poro.png",
      "assets/img/Poro_Bee_Tier_1.webp",
      "assets/img/Chibi_Caitlyn_Base_Tier_1.webp",
      "assets/img/yone.webp",
      "assets/img/zed.jpg",
    ],
  }

  // Estado do jogo
  let cards = []
  let flippedCards = []
  let attempts = 0
  let matchedPairs = 0
  let isProcessing = false
  const attemptHistory = JSON.parse(localStorage.getItem("memoryGameHistory")) || []
  let currentDifficulty = "easy" // Dificuldade padrão

  // Configurações de dificuldade
  const difficultySettings = {
    easy: { pairs: 3 },
    medium: { pairs: 6 },
    hard: { pairs: 8 },
  }

  // Inicializar o jogo
  initGame()
  updateHistoryDisplay()

  // Event listeners
  restartButton.addEventListener("click", restartGame)
  easyButton.addEventListener("click", () => setDifficulty("easy"))
  mediumButton.addEventListener("click", () => setDifficulty("medium"))
  hardButton.addEventListener("click", () => setDifficulty("hard"))

  // Funções
  function setDifficulty(difficulty) {
    // Atualizar botões de dificuldade
    easyButton.classList.remove("active")
    mediumButton.classList.remove("active")
    hardButton.classList.remove("active")

    document.getElementById(`${difficulty}-btn`).classList.add("active")

    currentDifficulty = difficulty

    // Ajustar a classe do tabuleiro com base na dificuldade
    gameBoard.className = "game-board " + difficulty

    // Reiniciar o jogo com a nova dificuldade
    restartGame()
  }

  function initGame() {
    // Resetar estado
    cards = []
    flippedCards = []
    attempts = 0
    matchedPairs = 0
    isProcessing = false
    attemptsElement.textContent = "0"
    congratulationsElement.classList.add("hidden")
    gameBoard.innerHTML = ""

    // Ajustar a classe do tabuleiro com base na dificuldade atual
    gameBoard.className = "game-board " + currentDifficulty

    // Obter número de pares com base na dificuldade
    const numPairs = difficultySettings[currentDifficulty].pairs

    // Obter imagens para o nível de dificuldade atual
    const currentImages = difficultyImages[currentDifficulty]

    // Verificar se temos imagens suficientes para o nível
    if (currentImages.length < numPairs) {
      console.warn(`Não há imagens suficientes para o nível ${currentDifficulty}. Usando imagens repetidas.`)
    }

    // Criar pares de cartas
    const cardPairs = []

    // Selecionar as imagens para este jogo (até o número de pares necessários)
    const selectedImages = []
    for (let i = 0; i < numPairs; i++) {
      // Usar imagens disponíveis de forma cíclica se não houver suficientes
      const imageIndex = i % currentImages.length
      selectedImages.push(currentImages[imageIndex])
    }

    // Embaralhar as imagens selecionadas para variar a cada jogo
    const shuffledImages = shuffleArray([...selectedImages])

    // Criar os pares de cartas
    shuffledImages.forEach((imageUrl, index) => {
      cardPairs.push(
        { imageUrl, isFlipped: false, isMatched: false, pairId: index },
        { imageUrl, isFlipped: false, isMatched: false, pairId: index },
      )
    })

    // Embaralhar as cartas
    cards = shuffleArray(cardPairs)

    // Renderizar cartas no tabuleiro
    renderCards()
  }

  function renderCards() {
    gameBoard.innerHTML = ""

    cards.forEach((card, index) => {
      const cardElement = document.createElement("div")
      cardElement.className = "card"
      cardElement.dataset.index = index

      cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Enemy_Missing_ping-jBirKghYVOAJd5pIVmtk9c8nBgOMtP.webp" alt="?" class="card-question">
                    </div>
                    <div class="card-back">
                        <img src="${card.imageUrl}" alt="Card Image">
                    </div>
                </div>
            `

      // Adicionar classe 'flipped' se a carta já estiver virada ou combinada
      if (card.isFlipped || card.isMatched) {
        cardElement.classList.add("flipped")
      }

      cardElement.addEventListener("click", () => flipCard(index))
      gameBoard.appendChild(cardElement)
    })
  }

  function flipCard(index) {
    // Impedir virar mais de 2 cartas ou cartas já viradas/combinadas ou durante processamento
    if (isProcessing || flippedCards.length >= 2 || cards[index].isFlipped || cards[index].isMatched) {
      return
    }

    // Virar a carta
    cards[index].isFlipped = true
    flippedCards.push(index)

    // Atualizar a visualização
    document.querySelector(`.card[data-index="${index}"]`).classList.add("flipped")

    // Verificar se duas cartas foram viradas
    if (flippedCards.length === 2) {
      isProcessing = true
      attempts++
      attemptsElement.textContent = attempts

      // Verificar se as cartas são iguais
      const [firstIndex, secondIndex] = flippedCards
      const firstCard = cards[firstIndex]
      const secondCard = cards[secondIndex]

      // Verificar se as cartas têm o mesmo pairId
      if (firstCard.pairId === secondCard.pairId) {
        // Cartas combinam
        firstCard.isMatched = true
        secondCard.isMatched = true
        matchedPairs++

        // Resetar para próxima jogada
        flippedCards = []
        isProcessing = false

        // Verificar se o jogo foi concluído
        if (matchedPairs === difficultySettings[currentDifficulty].pairs) {
          gameCompleted()
        }
      } else {
        // Cartas não combinam, virar de volta após um tempo
        setTimeout(() => {
          cards[firstIndex].isFlipped = false
          cards[secondIndex].isFlipped = false

          document.querySelector(`.card[data-index="${firstIndex}"]`).classList.remove("flipped")
          document.querySelector(`.card[data-index="${secondIndex}"]`).classList.remove("flipped")

          flippedCards = []
          isProcessing = false
        }, 1000)
      }
    }
  }

  function gameCompleted() {
    // Mostrar mensagem de parabéns
    finalAttemptsElement.textContent = attempts
    congratulationsElement.classList.remove("hidden")

    // Adicionar ao histórico com informação de dificuldade
    const historyEntry = {
      attempts: attempts,
      difficulty: currentDifficulty,
      date: new Date().toISOString(),
    }

    attemptHistory.push(historyEntry)
    localStorage.setItem("memoryGameHistory", JSON.stringify(attemptHistory))

    // Atualizar exibição do histórico
    updateHistoryDisplay()

    // Criar efeito de confete
    createConfetti()
  }

  function restartGame() {
    initGame()
  }

  function updateHistoryDisplay() {
    historyList.innerHTML = ""

    if (attemptHistory.length === 0) {
      const emptyItem = document.createElement("li")
      emptyItem.textContent = "Nenhuma partida concluída ainda."
      historyList.appendChild(emptyItem)
      return
    }

    // Mostrar apenas as últimas 10 partidas para não sobrecarregar a interface
    const recentHistory = attemptHistory.slice(-10)

    recentHistory.forEach((entry, index) => {
      const historyItem = document.createElement("li")

      // Verificar se o entry é um objeto (novo formato) ou um número (formato antigo)
      if (typeof entry === "object") {
        // Formatar a dificuldade para exibição
        const difficultyText =
          {
            easy: "Fácil",
            medium: "Médio",
            hard: "Difícil",
          }[entry.difficulty] || entry.difficulty

        historyItem.innerHTML = `
                    <span>Partida ${attemptHistory.length - (recentHistory.length - 1 - index)}:</span>
                    <span>${entry.attempts} tentativas (${difficultyText})</span>
                `
      } else {
        // Formato antigo (apenas número de tentativas)
        historyItem.innerHTML = `
                    <span>Partida ${attemptHistory.length - (recentHistory.length - 1 - index)}:</span>
                    <span>${entry} tentativas</span>
                `
      }

      historyList.appendChild(historyItem)
    })
  }

  function createConfetti() {
    // Cores baseadas no wallpaper
    const colors = ["#3b82f6", "#ec4899", "#7e22ce", "#06b6d4", "#facc15"]

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div")
      confetti.className = "confetti"

      // Posição aleatória
      const left = Math.random() * 100

      // Estilo aleatório
      confetti.style.left = `${left}%`
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.width = `${Math.random() * 10 + 5}px`
      confetti.style.height = `${Math.random() * 10 + 5}px`
      confetti.style.opacity = Math.random() * 0.7 + 0.3

      // Animação com duração aleatória
      const duration = Math.random() * 3 + 2
      confetti.style.animation = `fall ${duration}s linear forwards`

      document.body.appendChild(confetti)

      // Remover após a animação
      setTimeout(() => {
        confetti.remove()
      }, duration * 1000)
    }
  }

  // Função auxiliar para embaralhar array
  function shuffleArray(array) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }
})
