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
  const musicToggleButton = document.getElementById("music-toggle")
  const soundToggleButton = document.getElementById("sound-toggle")
  const musicVolumeSlider = document.getElementById("music-volume")
  const soundVolumeSlider = document.getElementById("sound-volume")

  // Sistema de áudio melhorado
  let isMusicEnabled = localStorage.getItem("memoryGameMusicEnabled") !== "false" // Padrão: true
  let isSoundEnabled = localStorage.getItem("memoryGameSoundEnabled") !== "false" // Padrão: true
  let musicVolume = Number.parseInt(localStorage.getItem("memoryGameMusicVolume")) || 15 // Volume mais baixo padrão
  let soundVolume = Number.parseInt(localStorage.getItem("memoryGameSoundVolume")) || 25 // Volume baixo padrão

  // Criar elemento de áudio para música de fundo
  const backgroundMusic = new Audio()
  backgroundMusic.src = "assets/sound/fundo.mp3" // Música original de fundo
  backgroundMusic.onerror = () => {
    console.log("Erro ao carregar música de fundo local, usando fallback")
    backgroundMusic.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  }
  backgroundMusic.loop = true
  backgroundMusic.volume = musicVolume / 100

  // Efeitos sonoros
  const sounds = {
    flip: new Audio("https://www.soundjay.com/buttons/sounds/button-09.mp3"),
    match: new Audio("https://www.soundjay.com/buttons/sounds/button-35.mp3"),
    noMatch: new Audio("https://www.soundjay.com/buttons/sounds/button-10.mp3"),
    victory: new Audio("assets/sound/win.mp3"), // Som original de vitória
    gameStart: new Audio("https://www.soundjay.com/buttons/sounds/button-21.mp3"),
  }

  // Configurar fallback para o som de vitória caso não carregue
  sounds.victory.onerror = () => {
    console.log("Erro ao carregar som de vitória local, usando URL fornecida")
    sounds.victory.src =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/win-J6U1VtDtH9cKhqAXxXq0H7OVgRCas8.mp3"
  }

  // Ajustar volume dos efeitos sonoros
  Object.values(sounds).forEach((sound) => {
    sound.volume = soundVolume / 100
  })

  // Inicializar sliders
  musicVolumeSlider.value = musicVolume
  soundVolumeSlider.value = soundVolume

  // Função para tocar som com volume específico
  function playSound(sound, volumeMultiplier = 1) {
    if (isSoundEnabled) {
      const soundClone = sound.cloneNode(true)
      soundClone.volume = (soundVolume / 100) * volumeMultiplier
      soundClone.play().catch((error) => {
        console.log("Erro ao tocar som:", error)
      })
    }
  }

  // Função para iniciar/parar música de fundo
  function toggleBackgroundMusic() {
    if (isMusicEnabled) {
      backgroundMusic.volume = musicVolume / 100
      backgroundMusic.play().catch((error) => {
        console.log("Erro ao tocar música de fundo:", error)
      })
    } else {
      backgroundMusic.pause()
    }
  }

  // Atualizar ícones de áudio
  function updateAudioIcons() {
    musicToggleButton.innerHTML = isMusicEnabled ? '<i class="fas fa-music"></i>' : '<i class="fas fa-music"></i>'
    musicToggleButton.classList.toggle("muted", !isMusicEnabled)

    soundToggleButton.innerHTML = isSoundEnabled ? '<i class="fas fa-bell"></i>' : '<i class="fas fa-bell"></i>'
    soundToggleButton.classList.toggle("muted", !isSoundEnabled)
  }

  // Event listeners para controles de áudio
  musicToggleButton.addEventListener("click", () => {
    isMusicEnabled = !isMusicEnabled
    localStorage.setItem("memoryGameMusicEnabled", isMusicEnabled.toString())
    updateAudioIcons()
    toggleBackgroundMusic()
  })

  soundToggleButton.addEventListener("click", () => {
    isSoundEnabled = !isSoundEnabled
    localStorage.setItem("memoryGameSoundEnabled", isSoundEnabled.toString())
    updateAudioIcons()

    if (isSoundEnabled) {
      playSound(sounds.flip)
    }
  })

  // Event listeners para sliders de volume
  musicVolumeSlider.addEventListener("input", (e) => {
    musicVolume = Number.parseInt(e.target.value)
    localStorage.setItem("memoryGameMusicVolume", musicVolume.toString())
    backgroundMusic.volume = musicVolume / 100
  })

  soundVolumeSlider.addEventListener("input", (e) => {
    soundVolume = Number.parseInt(e.target.value)
    localStorage.setItem("memoryGameSoundVolume", soundVolume.toString())

    // Atualizar volume de todos os sons
    Object.values(sounds).forEach((sound) => {
      sound.volume = soundVolume / 100
    })

    // Tocar som de teste
    if (isSoundEnabled) {
      playSound(sounds.flip)
    }
  })

  // Inicializar ícones de áudio
  updateAudioIcons()

  // Forçar início da música automaticamente
  if (isMusicEnabled) {
    // Tentar iniciar imediatamente
    setTimeout(() => {
      toggleBackgroundMusic()
    }, 500)

    // Garantir que a música toque no primeiro clique se não conseguir iniciar automaticamente
    const ensureAudioStart = () => {
      if (isMusicEnabled && backgroundMusic.paused) {
        toggleBackgroundMusic()
      }
      document.removeEventListener("click", ensureAudioStart)
      document.removeEventListener("keydown", ensureAudioStart)
    }

    document.addEventListener("click", ensureAudioStart)
    document.addEventListener("keydown", ensureAudioStart)
  }

  // Imagens de exemplo para o jogo
  const allImages = [
    "assets/img/maxresdefault.jpg",
    "assets/img/Chip_Base_Tier_1.webp",
    "assets/img/Chibi_Malphite_Base_Tier_1.webp",
    "assets/img/Chibi_Ekko_Firelight_Tier_1.webp",
    "assets/img/Chibi_Jinx_Base_Tier_1.webp",
    "assets/img/Poro_Santa_Tier_1.webp",
    "assets/img/Chibi_Miss_Fortune_Base_Tier_1.webp",
    "assets/img/Chibi_Riven_Dawnbringer_Tier_1.webp",
    "assets/img/Chibi_Seraphine_KDA_ALL_OUT_Tier_1.webp",
    "assets/img/Chibi_Vi_Base_Tier_1.webp",
    "assets/img/chibi-poro-rider-sejuanni-for-fight-of-the-golden-spatula-v0-mgnetmofkt5e1.webp",
    "assets/img/Chibi_Akali_KDA_ALL_OUT_Tier_1.webp",
    "assets/img/chibi_aatrox.webp",
    "assets/img/poro.png",
    "assets/img/Poro_Bee_Tier_1.webp",
    "assets/img/Chibi_Caitlyn_Base_Tier_1.webp",
    "assets/img/yone.webp",
    "assets/img/zed.jpg",
    "assets/img/Enemy_Missing_ping.webp",
  ]

  let difficultyImages = {
    easy: [],
    medium: [],
    hard: [],
  }

  const preloadedImages = {}

  // Estado do jogo
  let cards = []
  let flippedCards = []
  let attempts = 0
  let matchedPairs = 0
  let isProcessing = false
  const attemptHistory = JSON.parse(localStorage.getItem("memoryGameHistory")) || []
  let currentDifficulty = "easy"

  // Configurações de dificuldade
  const difficultySettings = {
    easy: { pairs: 3 },
    medium: { pairs: 6 },
    hard: { pairs: 8 },
  }

  // Função para pré-carregar imagens
  function preloadImages(imageUrls) {
    return new Promise((resolve) => {
      let loadedCount = 0
      const totalImages = imageUrls.length

      if (totalImages === 0) {
        resolve()
        return
      }

      imageUrls.forEach((url) => {
        if (preloadedImages[url]) {
          loadedCount++
          if (loadedCount === totalImages) {
            resolve()
          }
          return
        }

        const img = new Image()

        img.onload = () => {
          preloadedImages[url] = true
          loadedCount++
          if (loadedCount === totalImages) {
            resolve()
          }
        }

        img.onerror = () => {
          console.warn(`Falha ao carregar imagem: ${url}`)
          preloadedImages[url] = false
          loadedCount++
          if (loadedCount === totalImages) {
            resolve()
          }
        }

        img.src = url
      })
    })
  }

  function thoroughShuffle(array) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray.sort(() => Math.random() - 0.5)
  }

  function distributeImages() {
    const shuffledImages = thoroughShuffle([...allImages])

    difficultyImages = {
      easy: [],
      medium: [],
      hard: [],
    }

    const totalPairsNeeded =
      difficultySettings.easy.pairs + difficultySettings.medium.pairs + difficultySettings.hard.pairs

    const workingImages = [...shuffledImages]

    while (workingImages.length < totalPairsNeeded) {
      workingImages.push(...shuffledImages.slice(0, totalPairsNeeded - workingImages.length))
    }

    const finalImages = thoroughShuffle(workingImages)

    difficultyImages.easy = finalImages.slice(0, difficultySettings.easy.pairs)
    difficultyImages.medium = finalImages.slice(
      difficultySettings.easy.pairs,
      difficultySettings.easy.pairs + difficultySettings.medium.pairs,
    )
    difficultyImages.hard = finalImages.slice(
      difficultySettings.easy.pairs + difficultySettings.medium.pairs,
      totalPairsNeeded,
    )

    difficultyImages.easy = thoroughShuffle(difficultyImages.easy)
    difficultyImages.medium = thoroughShuffle(difficultyImages.medium)
    difficultyImages.hard = thoroughShuffle(difficultyImages.hard)

    return preloadImages([...difficultyImages.easy, ...difficultyImages.medium, ...difficultyImages.hard])
  }

  async function initializeGame() {
    gameBoard.innerHTML = '<div class="loading">Carregando imagens...</div>'
    await distributeImages()
    playSound(sounds.gameStart)
    initGame()
    updateHistoryDisplay()
  }

  initializeGame()

  restartButton.addEventListener("click", async () => {
    gameBoard.innerHTML = '<div class="loading">Carregando imagens...</div>'
    playSound(sounds.gameStart)
    await distributeImages()
    restartGame()
  })

  easyButton.addEventListener("click", () => setDifficulty("easy"))
  mediumButton.addEventListener("click", () => setDifficulty("medium"))
  hardButton.addEventListener("click", () => setDifficulty("hard"))

  async function setDifficulty(difficulty) {
    easyButton.classList.remove("active")
    mediumButton.classList.remove("active")
    hardButton.classList.remove("active")

    document.getElementById(`${difficulty}-btn`).classList.add("active")

    currentDifficulty = difficulty
    gameBoard.className = "game-board " + difficulty

    gameBoard.innerHTML = '<div class="loading">Carregando imagens...</div>'
    playSound(sounds.gameStart)
    await distributeImages()
    restartGame()
  }

  function initGame() {
    cards = []
    flippedCards = []
    attempts = 0
    matchedPairs = 0
    isProcessing = false
    attemptsElement.textContent = "0"
    congratulationsElement.classList.add("hidden")
    gameBoard.innerHTML = ""

    gameBoard.className = "game-board " + currentDifficulty

    const numPairs = difficultySettings[currentDifficulty].pairs
    const currentImages = difficultyImages[currentDifficulty]

    if (currentImages.length < numPairs) {
      console.warn(`Não há imagens suficientes para o nível ${currentDifficulty}. Usando imagens repetidas.`)
    }

    const cardPairs = []

    currentImages.forEach((imageUrl, index) => {
      cardPairs.push(
        { imageUrl, isFlipped: false, isMatched: false, pairId: index },
        { imageUrl, isFlipped: false, isMatched: false, pairId: index },
      )
    })

    cards = thoroughShuffle(cardPairs)
    renderCards()
  }

  function renderCards() {
    gameBoard.innerHTML = ""

    cards.forEach((card, index) => {
      const cardElement = document.createElement("div")
      cardElement.className = "card"
      cardElement.dataset.index = index

      const imageStatus = preloadedImages[card.imageUrl]
      // Usar uma imagem de fallback se a imagem original falhou no carregamento
      const imageUrl = imageStatus === false ? "assets/img/Enemy_Missing_ping.webp" : card.imageUrl

      cardElement.innerHTML = `
  <div class="card-inner">
    <div class="card-front">
      <img src="assets/img/Enemy_Missing_ping.webp" alt="?" class="card-question">
    </div>
    <div class="card-back">
      <img src="${imageUrl}" alt="Card Image" class="card-image">
    </div>
  </div>
`

      if (card.isFlipped || card.isMatched) {
        cardElement.classList.add("flipped")
      }

      cardElement.addEventListener("click", () => flipCard(index))
      gameBoard.appendChild(cardElement)
    })
  }

  function flipCard(index) {
    if (isProcessing || flippedCards.length >= 2 || cards[index].isFlipped || cards[index].isMatched) {
      return
    }

    playSound(sounds.flip, 0.3)

    cards[index].isFlipped = true
    flippedCards.push(index)

    document.querySelector(`.card[data-index="${index}"]`).classList.add("flipped")

    if (flippedCards.length === 2) {
      isProcessing = true
      attempts++
      attemptsElement.textContent = attempts

      const [firstIndex, secondIndex] = flippedCards
      const firstCard = cards[firstIndex]
      const secondCard = cards[secondIndex]

      if (firstCard.pairId === secondCard.pairId) {
        firstCard.isMatched = true
        secondCard.isMatched = true
        matchedPairs++

        playSound(sounds.match)

        flippedCards = []
        isProcessing = false

        if (matchedPairs === difficultySettings[currentDifficulty].pairs) {
          gameCompleted()
        }
      } else {
        playSound(sounds.noMatch, 0.2)

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

  async function gameCompleted() {
    playSound(sounds.victory, 1.8)

    finalAttemptsElement.textContent = attempts
    congratulationsElement.classList.remove("hidden")

    const historyEntry = {
      attempts: attempts,
      difficulty: currentDifficulty,
      date: new Date().toISOString(),
    }

    attemptHistory.push(historyEntry)
    localStorage.setItem("memoryGameHistory", JSON.stringify(attemptHistory))

    updateHistoryDisplay()
    createConfetti()

    await distributeImages()

    setTimeout(() => {
      congratulationsElement.classList.add("hidden")
      initGame()
    }, 3000)
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

    const recentHistory = attemptHistory.slice(-10)

    recentHistory.forEach((entry, index) => {
      const historyItem = document.createElement("li")

      if (typeof entry === "object") {
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
        historyItem.innerHTML = `
                    <span>Partida ${attemptHistory.length - (recentHistory.length - 1 - index)}:</span>
                    <span>${entry} tentativas</span>
                `
      }

      historyList.appendChild(historyItem)
    })
  }

  function createConfetti() {
    const colors = ["#3b82f6", "#ec4899", "#7e22ce", "#06b6d4", "#facc15"]

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div")
      confetti.className = "confetti"

      const left = Math.random() * 100

      confetti.style.left = `${left}%`
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.width = `${Math.random() * 10 + 5}px`
      confetti.style.height = `${Math.random() * 10 + 5}px`
      confetti.style.opacity = Math.random() * 0.7 + 0.3

      const duration = Math.random() * 3 + 2
      confetti.style.animation = `fall ${duration}s linear forwards`

      document.body.appendChild(confetti)

      setTimeout(() => {
        confetti.remove()
      }, duration * 1000)
    }
  }
})
