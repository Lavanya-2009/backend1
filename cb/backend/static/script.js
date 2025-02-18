// /frontend/script.js

// Define primary interview questions with ideal answers
const primaryQuestionsWithIdealAnswers = [
    { 
        question: "Tell me about yourself.", 
        idealAnswer: "I am a passionate individual with a strong interest in software development, particularly in web technologies like JavaScript and Python. I enjoy solving problems and learning new concepts." 
    },
    { 
        question: "Why do you want this job?", 
        idealAnswer: "I want to work with your company because it aligns with my career goals, and I believe I can contribute to the growth of the team by utilizing my skills and passion for development." 
    },
    { 
        question: "Tell me about a challenging project you worked on.",
        idealAnswer: "I worked on a project where we needed to optimize the performance of an existing web application. I collaborated with the team to identify bottlenecks, optimized queries, and improved response times by 50%."
    },
    { 
        question: "How do you handle stress and pressure?",
        idealAnswer: "I prioritize tasks, stay organized, and take short breaks to clear my mind. I also communicate effectively with my team to ensure we stay on track and support each other when pressure arises."
    }
];

// Define role-specific interview questions
const roleQuestions = {
    "Software Engineer": [
        "What programming languages are you comfortable with?",
        "Can you explain the difference between object-oriented programming and functional programming?",
        "How do you approach problem-solving in coding challenges?",
        "What are the most important skills for a software engineer?"
    ],
    "Data Scientist": [
        "What programming languages do you use for data analysis?",
        "Explain the difference between supervised and unsupervised learning.",
        "How would you handle missing data in a dataset?",
        "What are the most important skills for a data scientist?"
    ],
    "Product Manager": [
        "How do you prioritize features for a product?",
        "Explain how you handle conflicts within a product team.",
        "What metrics would you track for a successful product launch?",
        "What are the most important skills for a product manager?"
    ]
};

// Define skills-related questions for each role
const skillsQuestions = {
    "Software Engineer": "What programming tools and technologies are you proficient in?",
    "Data Scientist": "What data visualization tools are you comfortable with?",
    "Product Manager": "What project management tools do you use?"
};

// Store the questions and answers
let questionAnswerLog = [];

// Function to start the interview and ask primary questions
function startInterview() {
    let questionIndex = 0;
    askPrimaryQuestion(questionIndex);
}

// Ask primary interview questions
function askPrimaryQuestion(questionIndex) {
    if (questionIndex < primaryQuestionsWithIdealAnswers.length) {
        const { question, idealAnswer } = primaryQuestionsWithIdealAnswers[questionIndex];
        document.getElementById('question').textContent = question;

        const utterance = new SpeechSynthesisUtterance(question);
        utterance.onend = function() {
            // Wait for the user to respond after the question is spoken
            startSpeechRecognition(question, questionIndex, "primary", idealAnswer);
        };

        window.speechSynthesis.speak(utterance);
    } else {
        askRoleQuestion();
    }
}

// Function to ask about the user's role
function askRoleQuestion() {
    const question = "Which role are you preparing for? (e.g., Software Engineer, Data Scientist, Product Manager)";
    document.getElementById('question').textContent = question;

    const utterance = new SpeechSynthesisUtterance(question);
    utterance.onend = function() {
        // Start listening for the user's role after the question is spoken
        startSpeechRecognition(question, 0, "role", "");
    };

    window.speechSynthesis.speak(utterance);
}

// Handle user's speech for primary or role-related answers
function startSpeechRecognition(question, questionIndex, type, idealAnswer) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    
    if (!recognition) {
        console.error("Speech Recognition API is not supported in this browser.");
        document.getElementById('feedback').textContent = "Speech recognition is not supported in this browser. Please use Chrome or Edge.";
        return;
    }

    recognition.lang = 'en-US';
    recognition.continuous = false; // Listen for a single response
    recognition.interimResults = false; // Get only the final result

    let userAnswer = '';

    recognition.start();

    recognition.onstart = function() {
        console.log("Speech recognition started...");
        document.getElementById('feedback').textContent = "Listening for your answer...";
    };

    recognition.onresult = function(event) {
        userAnswer = event.results[0][0].transcript.trim();
        document.getElementById('feedback').textContent = `You said: ${userAnswer}`;
    };

    recognition.onspeechend = function() {
        console.log("Speech ended...");
        recognition.stop();
        processAnswer(question, questionIndex, userAnswer, idealAnswer, type);
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event);
        if (event.error === 'no-speech') {
            document.getElementById('feedback').textContent = 'No speech detected. Please try again.';
            setTimeout(() => startSpeechRecognition(question, questionIndex, type, idealAnswer), 3000);
        } else if (event.error === 'audio-capture') {
            document.getElementById('feedback').textContent = 'Microphone access error. Please ensure your microphone is working and not muted.';
        } else {
            document.getElementById('feedback').textContent = `Error occurred: ${event.error}. Please try again.`;
        }
    };

    recognition.onend = function() {
        console.log("Speech recognition ended...");
    };
}

// Process the answer to primary or role-related questions
function processAnswer(question, questionIndex, userAnswer, idealAnswer, type) {
    console.log(`Answer to question: ${question} is ${userAnswer}`);

    // Store question and answer
    questionAnswerLog.push({ question: question, answer: userAnswer });

    // Provide feedback based on the user's answer
    if (idealAnswer) {
        const similarityScore = getSimilarity(userAnswer, idealAnswer);
        const feedback = generateFeedback(similarityScore);
        document.getElementById('feedback').textContent = `Feedback: ${feedback}`;
    }

    // Move to the next question or role question
    if (type === "primary") {
        if (questionIndex + 1 < primaryQuestionsWithIdealAnswers.length) {
            askPrimaryQuestion(questionIndex + 1);
        } else {
            askRoleQuestion();
        }
    } else if (type === "role") {
        processRoleAnswer(userAnswer);
    }
}

// Process the user's role answer and start asking role-specific questions
function processRoleAnswer(role) {
    role = role.toLowerCase().trim();

    // Partial Matching: Check if input contains a valid role
    let matchedRole = Object.keys(roleQuestions).find(r => role.includes(r.toLowerCase()));

    if (matchedRole) {
        console.log("Detected role:", matchedRole);
        document.getElementById('feedback').textContent = `Role selected: ${matchedRole}`;
        askRoleSpecificQuestions(matchedRole, 0);
    } else {
        document.getElementById('feedback').textContent = "Sorry, I didn't understand your role. Please try again.";
        setTimeout(askRoleQuestion, 3000);
    }
}

// Ask role-specific questions
function askRoleSpecificQuestions(role, questionIndex) {
    if (questionIndex < roleQuestions[role].length) {
        const question = roleQuestions[role][questionIndex];
        document.getElementById('question').textContent = question;

        const utterance = new SpeechSynthesisUtterance(question);
        utterance.onend = function() {
            startSpeechRecognition(question, questionIndex, "roleSpecific", "");
        };

        window.speechSynthesis.speak(utterance);
    } else {
        askSkillsQuestion(role);
    }
}

// Generate feedback based on similarity score
function generateFeedback(similarityScore) {
    if (similarityScore >= 80) return "Great job! Your answer is very close to the ideal response.";
    if (similarityScore >= 50) return "Good effort! Try to be more detailed in your answer.";
    return "Your answer needs improvement. Try to provide more specific details.";
}

// Simple text similarity function
function getSimilarity(userAnswer, idealAnswer) {
    const userWords = new Set(userAnswer.toLowerCase().split(" "));
    const idealWords = new Set(idealAnswer.toLowerCase().split(" "));
    const commonWords = [...userWords].filter(word => idealWords.has(word));
    return (commonWords.length / idealWords.size) * 100;
}

// Start the interview when the button is clicked
document.getElementById('startInterviewBtn').addEventListener('click', startInterview);
