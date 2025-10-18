const { createApp, ref, onMounted } = Vue

      createApp({
        setup() {
          const apiKey = "b89a7438b7474243b39d6335d94464a4"
          const currentGame = ref(null)
          const score = ref(0)
          const fails = ref(0)
          const lives = ref(3)
          const userGuess = ref("")
          const suggestions = ref([])
          const blurLevel = ref(10)
          const attempts = ref(0)
          const hints = ref([])
          const attemptHistory = ref([])
          const showModal = ref(false)
          const gameOver = ref(false)

          async function getRandomGame() {
            blurLevel.value = 10
            attempts.value = 0
            hints.value = []
            attemptHistory.value = []
            showModal.value = false
            const page = Math.floor(Math.random() * 70) + 1
            const res = await fetch(
              `https://api.rawg.io/api/games?key=${apiKey}&page=${page}&page_size=1`
            )
            const data = await res.json()
            currentGame.value = data.results[0]
          }

          async function onInputChange() {
            if (userGuess.value.length < 3) {
              suggestions.value = []
              return
            }
            const res = await fetch(
              `https://api.rawg.io/api/games?key=${apiKey}&search=${userGuess.value}&page_size=5`
            )
            const data = await res.json()
            suggestions.value = data.results
          }

          function selectSuggestion(name) {
            userGuess.value = name
            suggestions.value = []
            checkGuess()
          }

          function checkGuess() {
            if (!currentGame.value) return
            const guessText = userGuess.value.trim()
            const correct =
              guessText.toLowerCase() === currentGame.value.name.toLowerCase()

            attemptHistory.value.push({ text: guessText, correct })

            if (correct) {
              score.value++
              blurLevel.value = 0
              showModal.value = true
            } else {
              fails.value++
              attempts.value++
              blurLevel.value = Math.max(0, blurLevel.value - 3)

              if (currentGame.value.name.toLowerCase().includes(guessText.toLowerCase()))
                hints.value.push("Estás cerca... ¡esa franquicia es correcta!")

              if (attempts.value === 1)
                hints.value.push("Género: " + (currentGame.value.genres?.[0]?.name || "Desconocido"))
              else if (attempts.value === 2)
                hints.value.push("Lanzamiento: " + (currentGame.value.released || "N/A"))
              else if (attempts.value === 3)
                hints.value.push("Plataforma: " + (currentGame.value.platforms?.[0]?.platform?.name || "N/A"))
              else if (attempts.value >= 5) {
                loseLife()
              }
            }
          }

          function skipGame() {
            if (lives.value > 0) {
              lives.value--
              blurLevel.value = Math.max(0, blurLevel.value - 5)
            } else {
              triggerGameOver()
            }
          }

          function loseLife() {
            lives.value--
            if (lives.value <= 0) triggerGameOver()
            else getRandomGame()
          }

          function triggerGameOver() {
            gameOver.value = true
            score.value = 0
          }

          function nextGame() {
            showModal.value = false
            userGuess.value = ""
            getRandomGame()
          }

          function restartGame() {
            gameOver.value = false
            lives.value = 3
            fails.value = 0
            score.value = 0
            getRandomGame()
          }

          onMounted(() => getRandomGame())

          return {
            currentGame,
            score,
            fails,
            lives,
            userGuess,
            suggestions,
            onInputChange,
            selectSuggestion,
            checkGuess,
            blurLevel,
            hints,
            attemptHistory,
            showModal,
            gameOver,
            nextGame,
            restartGame,
            skipGame,
            attempts,
          }
        },
      }).mount("#app")