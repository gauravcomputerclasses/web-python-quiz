let questionDiv = document.querySelector(".questionDiv");
let submitBtn = document.querySelector(".submitBtn");
let next = document.querySelector(".next");
let finish = document.querySelector(".finish");
let input = document.querySelector("input");

class Question {
  constructor(que, opt, ans, exp) {
    this.que = que;
    this.opt = opt;
    this.ans = ans;
    this.exp = exp;
  }
}

class Quiz {
  constructor(queList) {
    this.questionList = queList;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.attempt = [];
  }

  updateDOM(data) {
    let domData = `
    <div>
      <h2 class="text-xl font-semibold">${data.que}</h2>
    </div>

    <!-- Options -->
    <div class="space-y-4">
      ${data.opt
        .map(
          (option) => `
        <label class="block bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-4 cursor-pointer transition">
          <input type="radio" name="option" value="${option}" class="mr-3 accent-blue-500" />
          ${option}
        </label>
      `
        )
        .join("")}
    </div>

    <!-- Explanation -->
    <div class="bg-gray-800 border-l-4 border-blue-500 p-4 rounded-md text-sm text-gray-300">
                <strong class="text-white">Explanation:</strong>
                <p class="describe"></p>
            </div>`;
    questionDiv.innerHTML = domData;
  }

  loadQuestion() {
    const currentQuestion = this.questionList[this.currentQuestionIndex];
    this.updateDOM(currentQuestion);
  }

  isCorrect() {
    const correctAns = this.questionList[this.currentQuestionIndex].ans;
    const des = this.questionList[this.currentQuestionIndex].exp;

    const selectedOption = document.querySelector(
      'input[name="option"]:checked'
    );

    if (!selectedOption) {
      alert("Please select an option.");
      return;
    }

    const selectedLabel = selectedOption.closest("label");
    const allOptions = document.querySelectorAll('input[name="option"]');

    // Loop through all options to find the correct one
    allOptions.forEach((opt) => {
      const label = opt.closest("label");
      opt.disabled = true;
      if (opt.value === correctAns) {
        label.className =
          "block bg-green-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-4 cursor-pointer transition";
        document.querySelector(".describe").innerHTML = des;
        this.score += 1;
      }
    });

    // If wrong, mark selected one red
    if (selectedOption.value !== correctAns) {
      selectedLabel.className =
        "block bg-red-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-4 cursor-pointer transition";
      this.score -= 1;
    }
    this.attempt.push(true);
  }

  next() {
    const selectedOption = document.querySelector(
      'input[name="option"]:checked'
    );

    if (!selectedOption) {
      alert("Please select an option.");
    } else {
      this.currentQuestionIndex += 1;
      this.loadQuestion();
    }

    if (this.currentQuestionIndex === this.questionList.length - 1) {
      next.className = "hidden";
      finish.className =
        "block order-3 bg-blue-700 text-gray-200 px-5 py-2 rounded-lg hover:bg-blue-600 transition";
    }
  }
  finish() {
    let name = prompt("Enter your name:");
    if (name === null || name === "") {
      alert("Please enter your name.");
      return;
    }
    let newDom = `
    <!-- Final Score Header -->
    <div>
        <h2 class="text-3xl font-bold text-white">🎉 Quiz Completed!</h2>
        <p class="text-lg text-gray-400 mt-2">Here’s how you did:</p>
    </div>

    <!-- Score Box -->
    <div class="bg-gray-800 border border-blue-500 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
        <h3 class="text-6xl font-extrabold text-blue-400 mb-4">${this.score} / ${this.questionList.length}.</h3>
    </div>

    </div>
`;
    questionDiv.innerHTML = newDom;
    this.sendResult(name, this.score);
    submitBtn.className = "hidden";
    finish.className = "hidden";
  }
  sendResult(name, score) {
    const scriptURL =
      "https://script.google.com/macros/s/AKfycbwOrxjGsW1GBZgm8UaYCBrGp_ggi_qtdqkhJ53VNJzD/dev";

    const data = `name=${encodeURIComponent(name)}&score=${score}`;

    fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data,
    })
      .then((response) => response.text())
      .then((result) => {
        console.log("✅ Submitted!", result);
      })
      .catch((error) => {
        console.error("❌ Failed to submit:", error);
      });
  }
}

var questionList = [];
fetch("questions.json")
  .then((response) => response.json())
  .then((data) => {
    for (let i = 0; i < data.quiz.length; i++) {
      const que = data.quiz[i].question;
      const opt = data.quiz[i].options;
      const ans = data.quiz[i].answer;
      const exp = data.quiz[i].explanation;
      questionList.push(new Question(que, opt, ans, exp));
    }
    const quiz = new Quiz(questionList);
    quiz.loadQuestion();

    submitBtn.addEventListener("click", () => {
      quiz.isCorrect();
    });

    next.addEventListener("click", () => {
      quiz.next();
    });
    finish.addEventListener("click", () => {
      quiz.finish();
    });
  });
