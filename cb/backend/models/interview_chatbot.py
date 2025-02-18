# /backend/models/interview_chatbot.py
import random
import requests
from bs4 import BeautifulSoup
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Function to scrape interview questions from GeeksForGeeks
def scrape_questions():
    try:
        url = "https://www.geeksforgeeks.org/python-interview-questions/"
        response = requests.get(url)
        if response.status_code != 200:
            raise Exception(f"Failed to fetch questions, status code: {response.status_code}")

        soup = BeautifulSoup(response.text, "html.parser")
        questions = []

        for item in soup.find_all("strong"):  # Find question tags
            question_text = item.get_text().strip()
            if "?" in question_text:  # Only consider valid questions with a question mark
                questions.append(question_text)

        return questions
    except Exception as e:
        print(f"Error fetching questions: {e}")
        return []  # Return an empty list if something goes wrong

# Function to evaluate the answer using TF-IDF similarity
def evaluate_answer(user_answer, correct_answer):
    """
    Evaluate the similarity between the user's answer and the correct answer
    using TF-IDF and cosine similarity.
    """
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([user_answer, correct_answer])
    similarity = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])
    return round(similarity[0][0] * 100, 2)  # Convert to percentage

# Main chatbot function
def interview_chatbot():
    questions = scrape_questions()
    if not questions:
        return "Sorry, no questions found at the moment.", ""  # Return fallback message if no questions are found
    
    question = random.choice(questions)  # Pick a random question
    feedback = "Answer the question to proceed."  # Simple feedback for now

    return question, feedback
