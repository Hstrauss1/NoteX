import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request, g
from supabase import Client, create_client
from supabase.lib.client_options import SyncClientOptions

load_dotenv()

app = Flask(__name__)
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")

def get_supabase_client(jwt:str) -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if url is None or key is None:
        raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")

    options = None
    if jwt:
        options = SyncClientOptions(headers={"Authorization": f"Bearer {jwt}"})

    return create_client(url, key, options)

def authenticate_request():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization header is missing or invalid"}), 401
    try:
        jwt = auth_header.split(' ')[1]
        g.supabase_client = get_supabase_client(jwt)
    except IndexError:
        return jsonify({"error": "Invalid Authorization header format"}), 401
    except Exception as e:
        return jsonify({"error": f"Error creating Supabase client: {e}"}), 500
    return None
