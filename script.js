// Sample quiz questions and answers
const quizData = [
    {
        question: "You spent £1,000,000 to buy a new apartment and just found out it's 0.98m². What do you do:",
        options: ["Sell the apartment", "Cry", "Illegally' expand", "Blow up your landlord"],
        answer: "Illegally' expand"
    },
    {
        question: "You need to borrow some screws to fit your the galvanised square steel framework. Who do you ask:",
        options: ["Your friend David", "An aunt", "Liam", "Your parents"],
        answer: "An aunt"
    },
    {
        question: "You need to use some supports whilst expanding your 0.98m² apartment. What do you use: ",
        options: ["Galvanised square steel", "Normal steel", "Aluminium foil", "Logs"],
        answer: "Galvanised square steel"
    },
    {
        question: "Your wife just gave birth to 1 billion kids. What type of door do you install to their bedroom:",
        options: ["Dark oak", "Glass doors", "None", "Face recognition high security door"],
        answer: "Face recognition high security door"
    },
    {
        question: "Of course you need to install a toilet somewhere in your room. So where do you put it: ",
        options: ["In the entrance", "In the bathroom", "Discreetly in the corner", "I don't need a toilet"],
        answer: "In the entrance"
    },
    {
        question: "If you leave the galvanised square steel frames as is it's not very fashionable 👎 How do you fix this:",
        options: ["Solid concrete", "Eco-friendly wood veneers", "Drape some curtains over it", "Cover the whole space with galvanised steel"],
        answer: "Eco-friendly wood veneers"
    },
    {
        question: "You're having some trouble with some leakages from the rain through the windows. You replace them with:",
        options: ["Wooden frame windows","Unplasticised polyvinyl chloride windows","Pure glass windows","Aluminium alloy windows"],
        answer: "Aluminium alloy windows"
    },
    {
        question: "Your apartment must absolutely accommodate your favourite sport. This is:",
        options: ["Running","Ballet","Swimming","Basketball"],
        answer: "Ballet"
    },
    {
        question: "If you were to hypothetically build a house in a desert chimney and needed to use concrete to support the structure how many years would you like it to be durable for:",
        options: ["100 years","1000 years","10000 years","100000 years"],
        answer: "10000 years"
    },
    {
        question: "What is the best method of transport?",
        options: ["Expensive car","Train","Bus","Childhood eagle"],
        answer: "Childhood eagle"
    }
    
    
    
    

    // Add more questions here...
];

const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const restartButton = document.getElementById('restart-btn');
const resultContainer = document.getElementById('result-container');
const progressBar = document.getElementById('progress-bar');

const totalQuestions = quizData.length;
let currentQuestionIndex = 0;
let score = 0;

function loadQuestion() {
    const currentQuestion = quizData[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    
    // Clear previous options
    optionsList.innerHTML = '';
    
    // Display options
    currentQuestion.options.forEach(option => {
        const li = document.createElement('li');
        li.textContent = option;
        li.addEventListener('click', () => {
            selectOption(li, option);
        });
        
        optionsList.appendChild(li);
    });
}

function selectOption(optionElement, option) {
    const currentQuestion = quizData[currentQuestionIndex];
    const selectedText = optionElement.textContent.trim(); // Get text content of selected option
    
    // Check if the selected option is correct
    if (selectedText === currentQuestion.answer) {
        optionElement.classList.add('correct');
        score++;
    } else {
        optionElement.classList.add('wrong');
    }
    
    // Disable further interaction with options for this question
    optionsList.querySelectorAll('li').forEach(li => {
        li.removeEventListener('click', selectOption);
        li.style.pointerEvents = 'none';
    });
    
    // Move to the next question or show result if quiz is complete
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQuestions) {
        setTimeout(loadQuestion, 1000); // Delay loading next question for 1 second
    } else {
        showResult();
    }
    
    updateProgressBar(); // Update progress bar after answering
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex) / totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;
}

function showResult() {
    questionText.textContent = '';
    optionsList.innerHTML = '';
    resultContainer.innerHTML = `<p>You scored ${score} out of ${totalQuestions}</p>`;
    resultContainer.style.color = 'green';
    progressBar.style.width = '100%'; // Ensure progress bar is fully filled at the end
    
    // Show restart button
    restartButton.style.display = '';
}

// Event listener for restart button
restartButton.addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;
    restartButton.style.display = 'none'; // Hide restart button
    resultContainer.textContent = ''; // Clear result message
    loadQuestion(); // Start quiz again
    progressBar.style.width = '0%'; // Reset progress bar
    startQuiz(); // Start the quiz from the beginning
});

// Function to start the quiz
function startQuiz() {
    loadQuestion();
    restartButton.style.display = 'none'; // Hide restart button initially
}

// Initial quiz start
startQuiz();
