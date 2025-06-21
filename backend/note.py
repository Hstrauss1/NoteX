import logging
import uuid
from flask import g
from flask import g, request, jsonify
from postgrest.exceptions import APIError
from datetime import datetime, timedelta
import mimetypes
import os


def is_valid_pdf_file_path(file_path: str) -> bool:
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        return False
    if not file_path.lower().endswith('.pdf'):
        return False
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type != 'application/pdf':
        return False

    if os.path.getsize(file_path) == 0:
        return False
    return True


def upload_pdf_to_bucket(file_path: str, user_id: str) -> str:
    if not is_valid_pdf_file_path(file_path):
        raise Exception("Invalid or empty PDF file")
    file_name = f"{uuid.uuid4()}.pdf"
    storage_path = f"{user_id}/{file_name}"

    with open(file_path, "rb") as f:
        data = f.read()

    try:
        g.supabase_client.storage.from_("note-storage").upload(storage_path, data)
    except Exception as e:
        raise Exception(f"Storage upload failed: {str(e)}")

    return storage_path


def create_note(user_id: str, title: str, storage_path: str) -> str:
    if not isinstance(title, str) or not title:
        raise TypeError("Invalid note title")
    note_id = str(uuid.uuid4())
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time()).isoformat()
    end_of_day = datetime.combine(today, datetime.max.time()).isoformat()

    try:
        response = g.supabase_client.table("Note") \
            .select("note_id", count="exact") \
            .eq("user_id", user_id) \
            .gte("created_at", start_of_day) \
            .lte("created_at", end_of_day) \
            .execute()
        upload_count = response.count if hasattr(response, "count") else len(response.data)
        if upload_count >= 5:
            raise Exception("Upload limit reached: Max 5 uploads per day.")

        g.supabase_client.table("Note").insert({
            "note_id":      note_id,
            "user_id":      user_id,
            "votes":        0,
            "title":        title,
            "storage_path": storage_path,
            "cost":10,
        }).execute()

    except Exception as e:
        raise Exception(f"Note insert failed: {e}")

    return note_id


def delete_note(note_id: str):
    if not isinstance(note_id, str) or not note_id:
        raise TypeError("Invalid note_id")
    try:
        response = g.supabase_client.table("Note") \
            .select("storage_path") \
            .eq("note_id", note_id) \
            .single() \
            .execute()

        note_data = response.get("data")
        if not note_data:
            raise Exception(f"Note {note_id} not found")

        storage_path = note_data["storage_path"]
        g.supabase_client.storage.from_("note-storage").remove([storage_path])
        g.supabase_client.table("Note").delete().eq("note_id", note_id).execute()

    except Exception as e:
        raise Exception(f"Failed to delete note: {e}")


def fetch_pdf_from_storage(storage_path: str):
    try:
        if not storage_path:
            print("Error: storage_path is empty.")
            return None

        print(f"Attempting to download from: '{storage_path}'")
        file_bytes = g.supabase_client.storage.from_("note-storage").download(storage_path)
        return file_bytes
    except Exception as e:
        print(f"Unexpected error fetching PDF: {e}")
        return None



def fetch_note_by_id(note_id: str):
    try:
        # only select the non-sensitive columns
        response = (
            g.supabase_client
              .table("Note")
              .select("*")
              .eq("note_id", note_id)
              .single()
              .execute()
        )

    except APIError as e:
        logging.error(f"Supabase API error fetching note {note_id}: {e.code} – {e.message}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error fetching note {note_id}: {e}")
        return None

    data = response.data or {}
    if not data:
        # no user found
        return None
    return data

def fetch_note_comments(note_id: str, exclude_user_id: str):
    try:
        response = (
            g.supabase_client
            .table("Comment")
            .select("*")
            .eq("note_id", note_id)
            .neq("user_id", exclude_user_id)  # exclude specific user
            .order("create_time", desc=True)
            .execute()
        )

        user_response = (
            g.supabase_client
            .table("Comment")
            .select("*")
            .eq("note_id", note_id)
            .eq("user_id", exclude_user_id)
            .single()
            .execute()
        )
    except APIError as e:
        logging.error(f"Supabase API error fetching comments for note {note_id}: {e.code} – {e.message}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error fetching comments for note {note_id}: {e}")
        return None


    return {
        "note_comments": response.data  if hasattr(response, 'data') else None,
        "user_comment": user_response.data if hasattr(user_response, 'data') else None
    }

def update_note_cost_from_likes(note_id: str) -> None:
    if not isinstance(note_id, str) or not note_id:
        raise TypeError("Invalid note_id")
    try:
        resp = (
            g.supabase_client
             .table("Note")
             .select("votes")
             .eq("note_id", note_id)
             .single()
             .execute()
        )
    except APIError as e:
        logging.error(f"Supabase API error fetching votes for note {note_id}: {e.code} – {e.message}")
        raise Exception(f"Failed to fetch note votes: {e.message}")
    except Exception as e:
        raise Exception(f"Failed to fetch note votes: {e}")

    data = getattr(resp, "data", None) or {}
    if "votes" not in data:
        raise Exception(f"No note found with id {note_id}")

    try:
        votes = int(data["votes"])
    except (ValueError, TypeError):
        raise Exception(f"Invalid votes value for note {note_id}: {data['votes']}")

    computed_cost = votes // 3
    if computed_cost < 1:
        computed_cost = 1
    try:
        upd = (
            g.supabase_client
             .table("Note")
             .update({"cost": computed_cost})
             .eq("note_id", note_id)
             .execute()
        )
        if hasattr(upd, "count") and upd.count == 0:
            raise Exception(f"No note found to update with id {note_id}")
    except APIError as e:
        logging.error(f"Supabase API error updating cost for note {note_id}: {e.code} – {e.message}")
        raise Exception(f"Note cost update failed: {e.message}")
    except Exception as e:
        raise Exception(f"Note cost update failed: {e}")

   
def update_note_title(note_id: str, new_title: str) -> None:
    if not isinstance(note_id, str) or not note_id:
        raise TypeError("Invalid note_id")
    if not isinstance(new_title, str) or not new_title:
        raise TypeError("Invalid new_title")

    try:
        resp = (
            g.supabase_client
             .table("Note")
             .update({"title": new_title})
             .eq("note_id", note_id)
             .execute()
        )
        if hasattr(resp, "count") and resp.count == 0:
            raise Exception(f"No note found with id {note_id}")
    except APIError as e:
        logging.error(f"Supabase API error updating title for note {note_id}: {e.code} – {e.message}")
        raise Exception(f"Note title update failed: {e.message}")
    except Exception as e:
        raise Exception(f"Note title update failed: {e}")

def fetch_note_ids_by_user(user_id: str):
    if not isinstance(user_id, str) or not user_id:
        raise TypeError("Invalid user_id")
    try:
        response = (
            g.supabase_client
            .table("Note")
            .select("note_id")
            .eq("user_id", user_id)
            .execute()
        )
    except APIError as e:
        logging.error(f"Supabase API error fetching note ids for user {user_id}: {e.code} – {e.message}")
        return []
    except Exception as e:
        logging.error(f"Unexpected error fetching note ids for user {user_id}: {e}")
        return []
    data = getattr(response, "data", None) or []
    return [item["note_id"] for item in data if "note_id" in item]

def fetch_unlocked_note_ids_by_user(user_id: str):
    if not isinstance(user_id, str) or not user_id:
        raise TypeError("Invalid user_id")
    try:
        response = (
            g.supabase_client
            .table("Unlocked")
            .select("note_id")
            .eq("user_id", user_id)
            .execute()
        )
    except APIError as e:
        logging.error(f"Supabase API error fetching unlocked note ids for user {user_id}: {e.code} – {e.message}")
        return []
    except Exception as e:
        logging.error(f"Unexpected error fetching unlocked note ids for user {user_id}: {e}")
        return []
    data = getattr(response, "data", None) or []
    return [item["note_id"] for item in data if "note_id" in item]