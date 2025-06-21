# test_upload.py
from dotenv import load_dotenv
from supabase import AuthApiError
from UploadPdf import supabase, upload_pdf_to_bucket, create_note

load_dotenv()

def main():
    try:
        auth_res = supabase.auth.sign_in_with_password({
            "email":    "testing@scu.edu",
            "password": "testing",
        })
    except AuthApiError as e:
        print("Sign-in failed:", e)
        return

    user = auth_res.user
    if not user or not user.id:
        print("No user returned in sign-in response:", auth_res)
        return

    user_id = user.id
    print("Signed in as user:", user_id)

    try:
        storage_path = upload_pdf_to_bucket("./Door.pdf", user_id)
        print("upload_pdf_to_bucket returned:", storage_path)
    except Exception as e:
        print("upload_pdf_to_bucket failed:", e)
        return

    # Create metadata row having errors due to keys???
    try:
        note_id = create_note(user_id, "Python-only test", storage_path)
        print("create_note returned note_id:", note_id)
    except Exception as e:
        print("create_note failed:", e)

if __name__ == "__main__":
    main()
