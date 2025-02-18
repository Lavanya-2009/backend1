# /backend/app.py
from flask import Flask, render_template, jsonify, request
from models.interview_chatbot import evaluate_answer, interview_chatbot, scrape_questions  # Correct import

app = Flask(__name__)

# Store questions globally for sequential processing
questions = []
current_question_index = 0

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/start_interview', methods=['GET'])
def start_interview():
    global questions
    global current_question_index
    
    try:
        questions = scrape_questions()  # Scrape questions from GeeksForGeeks
        print(f"Scraped questions: {questions}")  # Debug log
        
        if not questions:
            return jsonify({'question': 'Sorry, no questions found.', 'totalQuestions': 0}), 500

        # If we have more questions, return the next question
        question = questions[current_question_index]
        total_questions = len(questions)

        # Increment the question index for the next question
        current_question_index += 1
        print(f"Current question index: {current_question_index}")  # Debug log
        return jsonify({'question': question, 'totalQuestions': total_questions})

    except Exception as e:
        print(f"Error in start_interview route: {e}")  # Print the error
        return jsonify({'error': 'An error occurred on the server.'}), 500

@app.route('/evaluate_answer', methods=['GET'])
def evaluate_user_answer():
    try:
        user_answer = request.args.get('answer')
        question = request.args.get('question')

        # Dummy correct answer (you can adjust this as needed)
        correct_answer = "Python is an interpreted, high-level programming language."

        # Evaluate the user's answer using the evaluate_answer function
        score = evaluate_answer(user_answer, correct_answer)
        feedback = f"Your answer similarity score is {score}%."

        return jsonify({'feedback': feedback})

    except Exception as e:
        print(f"Error in evaluate_user_answer route: {e}")  # Print the error
        return jsonify({'error': 'An error occurred while evaluating your answer.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
