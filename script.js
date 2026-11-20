document.addEventListener("DOMContentLoaded", () => {
    const questions = [...document.querySelectorAll(".question[data-question]")];
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const finishBtn = document.getElementById("finish-btn");
    const questionCounter = document.getElementById("question-counter");
    const progressLabel = document.getElementById("progress-label");
    const progressPercent = document.getElementById("progress-percent");
    const progressFill = document.getElementById("progress-fill");
    const resultPanel = document.getElementById("result-panel");
    const scoreNumber = document.getElementById("score-number");
    const reviewBtn = document.getElementById("review-btn");
    if (questions.length === 0) {
        console.error("DevQuiz: nenhuma pergunta foi encontrada no HTML.");
        return;
    }
    let currentQuestion = 0;
    let finished = false;

    const correctAnswers = {
        1: null,
        2: "google.com",
        3: null,
        4: null,
        5: null,
        6: null,
        7: null,
        8: null
    };
    function getQuestionNumber(question) {
        return Number(question.dataset.question);
    }
    function getAnswer(question) {
        const number = getQuestionNumber(question);
        // Perguntas de texto ou número.
        const textInput = question.querySelector(
            'input[type="text"], input[type="number"]'
        );
        if (textInput) {
            return textInput.value.trim();
        }

        const select = question.querySelector("select");
        if (select) {
            return select.value;
        }

        const checkedInputs = [
            ...question.querySelectorAll(
                'input[type="radio"]:checked, input[type="checkbox"]:checked'
            )
        ];
        if (checkedInputs.length === 0) {
            return "";
        }
        if (number === 5 || checkedInputs.some(
            input => input.type === "checkbox"
        )) {
            return checkedInputs
                .map(input => input.value)
                .sort()
                .join("|");
        }
        return checkedInputs[0].value;
    }
    function hasAnswer(question) {
        const answer = getAnswer(question);
        if (Array.isArray(answer)) {
            return answer.length > 0;
        }
        return String(answer).trim() !== "";
    }
    function showQuestion(index) {
        currentQuestion = Math.max(
            0,
            Math.min(index, questions.length - 1)
        );
        questions.forEach((question, i) => {
            question.hidden = i !== currentQuestion;
        });
        const current = currentQuestion + 1;
        const total = questions.length;
        const percent = Math.round((current / total) * 100);
        if (questionCounter) {
            questionCounter.textContent = `Questão ${current} de ${total}`;
        }
        if (progressLabel) {
            progressLabel.textContent = `Progresso: ${current}/${total}`;
        }
        if (progressPercent) {
            progressPercent.textContent = `${percent}%`;
        }
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
        if (prevBtn) {
            prevBtn.hidden = currentQuestion === 0;
        }
        if (nextBtn) {
            nextBtn.hidden = currentQuestion === total - 1;
        }
        if (finishBtn) {
            finishBtn.hidden = currentQuestion !== total - 1;
        }
    }
    function isCorrect(question) {
        const number = getQuestionNumber(question);

        const correctMarkedInputs = [
            ...question.querySelectorAll(
                'input[data-correct="true"]:checked, ' +
                'option[data-correct="true"]:checked'
            )
        ];
        const selectedInputs = [
            ...question.querySelectorAll(
                'input[type="radio"]:checked, input[type="checkbox"]:checked'
            )
        ];
        const select = question.querySelector("select");
        const selectedOption = select
            ? select.options[select.selectedIndex]
            : null;
        if (correctMarkedInputs.length > 0) {


            return selectedInputs.length === correctMarkedInputs.length &&
                selectedInputs.every(input => input.dataset.correct === "true");
        }
        if (selectedInputs.length > 0 &&
            selectedInputs.some(input => input.dataset.correct === "false")) {
            return false;
        }
        if (selectedOption?.dataset.correct) {
            return selectedOption.dataset.correct === "true";
        }
        const expected = correctAnswers[number];

        if (expected === null || expected === undefined) {
            return false;
        }
        const answer = getAnswer(question);
        if (number === 5 && typeof expected === "string") {
            return answer === expected;
        }
        return String(answer).trim().toLowerCase() ===
            String(expected).trim().toLowerCase();
    }
    function calculateScore() {
        return questions.reduce((total, question) => {
            return total + (isCorrect(question) ? 1 : 0);
        }, 0);
    }
    function finishQuiz() {
        const unanswered = questions.find(question => !hasAnswer(question));
        if (unanswered) {
            const index = questions.indexOf(unanswered);
            showQuestion(index);
            alert("Responda a todas as perguntas antes de finalizar.");
            return;
        }
        finished = true;
        const score = calculateScore();
        const total = questions.length;
        const percentage = Math.round((score / total) * 100);
        if (scoreNumber) {
            scoreNumber.textContent = `${score}/${total}`;
        }
        if (resultPanel) {
            resultPanel.hidden = false;
            const resultMessage = resultPanel.querySelector(
                "[data-result-message]"
            );
            if (resultMessage) {
                if (percentage === 100) {
                    resultMessage.textContent =
                        "Excelente! Você acertou todas as perguntas!";
                } else if (percentage >= 70) {
                    resultMessage.textContent =
                        "Muito bem! Você tem um bom conhecimento.";
                } else if (percentage >= 40) {
                    resultMessage.textContent =
                        "Bom começo! Continue praticando.";
                } else {
                    resultMessage.textContent =
                        "Continue estudando. Cada tentativa é aprendizado!";
                }
            }
            resultPanel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
        if (nextBtn) nextBtn.disabled = true;
        if (finishBtn) finishBtn.disabled = true;
        showReview();
    }
    function showReview() {
        questions.forEach(question => {
            const number = getQuestionNumber(question);
            const existing = question.querySelector(".answer-feedback");
            if (existing) {
                existing.remove();
            }
            const feedback = document.createElement("p");
            feedback.className = "answer-feedback";
            if (isCorrect(question)) {
                feedback.classList.add("correct");
                feedback.textContent = "✓ Resposta correta!";
            } else {
                feedback.classList.add("incorrect");
                feedback.textContent = "✗ Resposta incorreta.";
            }
            feedback.setAttribute("role", "status");

            question.appendChild(feedback);

            feedback.dataset.question = String(number);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (!hasAnswer(questions[currentQuestion])) {
                alert("Selecione ou preencha uma resposta antes de continuar.");
                return;
            }
            if (currentQuestion < questions.length - 1) {
                showQuestion(currentQuestion + 1);
            }
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentQuestion > 0) {
                showQuestion(currentQuestion - 1);
            }
        });
    }
    if (finishBtn) {
        finishBtn.addEventListener("click", finishQuiz);
    }
    if (reviewBtn) {
        reviewBtn.addEventListener("click", () => {
            if (!finished) return;
            questions.forEach(question => {
                question.hidden = false;
            });
            if (resultPanel) {
                resultPanel.hidden = false;
            }
            questions[0].scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }

const feedbackForm = document.getElementById("feedback-form");
    const feedbackMessage = document.getElementById("feedback-message");
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", event => {
            event.preventDefault();
            if (!feedbackForm.checkValidity()) {
                feedbackForm.reportValidity();
                return;
            }
            if (feedbackMessage) {
                feedbackMessage.textContent =
                    "Obrigado pela sua avaliação!";
            }
            feedbackForm.reset();
        });
    }


    showQuestion(0);
    if (resultPanel) {
        resultPanel.hidden = true;
    }
});
