import uuid
from flask import g
import mimetypes
import os


def is_valid_pdf_file_path(file_path: str) -> bool:
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
            "storage_path": storage_path
        }).execute()

    except Exception as e:
        raise Exception(f"Note insert failed: {e}")

    return note_id

def delete_note(note_id: str):
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

