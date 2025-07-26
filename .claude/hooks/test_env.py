import os; from dotenv import load_dotenv; load_dotenv(); print('API Key found:', bool(os.getenv('ANTHROPIC_API_KEY')))
