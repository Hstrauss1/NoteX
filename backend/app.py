import io
import os
from flask import Flask, jsonify, request, send_file, make_response
from flask.helpers import abort
from note import create_note, fetch_note_comments, fetch_note_ids_by_user, fetch_pdf_from_storage, upload_pdf_to_bucket, fetch_note_by_id, delete_note, update_note_cost_from_likes, update_note_title, fetch_unlocked_note_ids_by_user
from auth import authenticate_request
from user import fetch_user_by_id, get_or_create_user
from interaction import like_note, comment_note, check_points, update_note_cost, update_user_points, add_tag, get_tags, get_liked_notes, get_notes_by_tag, get_notes_by_tags_match, update_tag, delete_tag, is_note_unlocked, has_user_liked_note, InsufficientPointsError, search_tags

app = Flask(__name__)

@app.before_request
def before_request():
    if request.endpoint not in ['static', 'public']:
        error = authenticate_request()
        if error:
            return error

@app.route('/')
def account_json():
    return jsonify({
      "test":"Hello"
    })

@app.route("/initialize-user/<user_id>", methods=["POST"])
def init_user(user_id):
    if not user_id:
        return jsonify({"error": "Missing user_id in request body"}), 400

    print("Initializing user with ID:", user_id)
    data = request.get_json()
    user = get_or_create_user(user_id, data["avatar"], data["name"], 10)
    if user is None:
        return jsonify({"error": "Could not fetch or create user"}), 500

    return jsonify(user)

@app.route("/user/<user_id>", methods=["GET"])
def get_user(user_id):
    try:
        app.logger.info(f"Fetching user with id: {user_id}")
        user = fetch_user_by_id(user_id)
        app.logger.info(f"fetch_user_by_id returned: {user}")
        print("User object:", user)
        if user is None:
            abort(404, description="User not found")
        return jsonify(user)
    except Exception as e:
        import traceback
        app.logger.error(f"Error fetching user {user_id}: {e}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/note/<note_id>", methods=["GET"])
def get_note(note_id):
    note = fetch_note_by_id(note_id)
    if note is None:
        abort(404, description="Note not found")
    tags = get_tags(note_id)
    note["tags"] = tags
    return jsonify(note)

@app.route("/user/<user_id>/notes", methods=["GET"])
def get_note_ids_by_user(user_id):
    try:
        note_ids = fetch_note_ids_by_user(user_id)
        notes = []
        for note_id in note_ids:
            note = fetch_note_by_id(note_id)
            if note is not None:
                note["tags"] = get_tags(note_id)
                notes.append(note)
        return jsonify({"user_id": user_id, "notes": notes}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/user/<user_id>/unlocked-notes", methods=["GET"])
def get_unlocked_note_ids_by_user(user_id):
    try:
        note_ids = fetch_unlocked_note_ids_by_user(user_id)
        notes = []
        for note_id in note_ids:
            note = fetch_note_by_id(note_id)
            if note is not None:
                note["tags"] = get_tags(note_id)
                notes.append(note)
        return jsonify({"user_id": user_id, "notes": notes}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/note/<note_id>/comments/<user_id>', methods=['GET'])
def get_comments(note_id,user_id):
    try:
        result = fetch_note_comments(note_id, user_id)
        print(result)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/storage', methods=['POST'])
def get_pdf_by_path():
    data = request.get_json()
    if not data or 'storage_path' not in data:
        return jsonify({"error": "Missing 'storage_path' in the request body"}), 400

    storage_path = data['storage_path']
    pdf_content = fetch_pdf_from_storage(storage_path)
    if pdf_content:
        return send_file(
            io.BytesIO(pdf_content),
            mimetype='application/pdf',
            as_attachment=False,  # Set to True to force download
            download_name=f"document_{os.path.basename(storage_path)}"
        )
    else:
        return {"error": "Failed to fetch PDF from storage"}, 404


@app.route("/upload-note", methods=["POST"])
def upload_note():
    file = request.files["pdf"]
    title = request.form["title"]
    user_id = request.form["user_id"]

    temp_path = f"/tmp/{file.filename}"
    file.save(temp_path)

    try:
        storage_path = upload_pdf_to_bucket(temp_path, user_id)
        print("upload_pdf_to_bucket returned:", storage_path)
    except Exception as e:
        print("upload_pdf_to_bucket failed:", e)
        return jsonify({"error": str(e)}), 500

    try:
        note_id = create_note(user_id, title, storage_path)
        print("create_note returned note_id:", note_id)
    except Exception as e:
        print("create_note failed:", e)
        return jsonify({"error": str(e)}), 500

    # Handle tags
    tags = []
    tags_count = request.form.get("tags-count", type=int)
    if tags_count:
        for i in range(1, tags_count + 1):
            tag_value = request.form.get(f"tags-{i}")
            if tag_value:
                tags.append(tag_value)
        if tags:
            try:
                add_tag(note_id, tags)
            except Exception as e:
                print("add_tag failed:", e)
                return jsonify({"error": f"Note created but failed to add tags: {str(e)}"}), 500

    return jsonify({"note_id": note_id, "pdf_path": storage_path, "tags": tags})

@app.route('/update_points', methods=['POST'])
def update_points():
    try:
        user_id = request.form.get('user_id')
        reward = request.form.get('reward', default=1, type=int)

        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400

        data = update_user_points(user_id, reward)
        return jsonify({"message": "Points updated", "data": data}), 200
    
    except Exception as e:
        if str(e) == "Points cannot be negative":
            return jsonify({"error": str(e)}), 400
        return jsonify({"error": str(e)}), 500

@app.route('/update_cost', methods=['POST'])
def update_cost():
    try:
        note_id = request.form.get('note_id')
        increment = request.form.get('increment', default=1, type=int)

        if not note_id:
            return jsonify({"error": "Missing note_id"}), 400

        data = update_note_cost(note_id, increment)
        return jsonify({"message": "Note cost updated", "data": data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/unlock_note', methods=['POST'])
def unlock_note():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        note_id = data.get("note_id")

        if not user_id or not note_id:
            return jsonify({"error": "Missing user_id or note_id"}), 400

        print(f"Unlocking note {note_id} for user {user_id}")
        result = check_points(user_id, note_id)
        return jsonify(result), 200
    
    except InsufficientPointsError as e:
        return jsonify({"error": str(e)}), 403 
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/like_note', methods=['POST'])
def like_note_endpoint():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        note_id = data.get("note_id")

        if not user_id or not note_id:
            return jsonify({"error": "Both user_id and note_id must be provided."}), 400

        response = like_note(user_id, note_id)
        return jsonify({"message": "Note liked successfully."}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to like note: {str(e)}"}), 500

@app.route('/comment', methods=['POST'])
def comment_note_endpoint():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        note_id = data.get("note_id")
        comment_text = data.get("comment_text")

        if not user_id or not note_id or not comment_text:
            return jsonify({"error": "Missing user_id, note_id, or comment_text"}), 400

        result = comment_note(user_id, note_id, comment_text)
        return jsonify({"message": "Comment added successfully", "data": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
@app.route("/delete-note/<note_id>", methods=["DELETE"])
def delete_note_route(note_id):
    try:
        delete_note(note_id)
        return jsonify({"status": "success", "message": f"Note {note_id} deleted"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/notes/<note_id>/update-cost", methods=["POST"])
def update_note_cost_route(note_id):
    # Validate & update
    try:
        update_note_cost_from_likes(note_id)
    except TypeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.error("Error updating cost for note %s: %s", note_id, e)
        return jsonify({"error": str(e)}), 500

    # Fetch updated note to get the new cost
    note = fetch_note_by_id(note_id)
    if not note or "cost" not in note:
        return jsonify({"error": "Failed to retrieve updated cost"}), 500

    return jsonify({
        "note_id":  note_id,
        "new_cost": note["cost"]
    }), 200


@app.route("/notes/<note_id>/update-title", methods=["POST"])
def update_note_title_route(note_id):
    data = request.get_json() or {}
    new_title = data.get("new_title")
    if not new_title:
        return jsonify({"error": "Missing new_title"}), 400

    try:
        update_note_title(note_id, new_title)
    except TypeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.error("Error updating title for note %s: %s", note_id, e)
        return jsonify({"error": str(e)}), 500

    note = fetch_note_by_id(note_id)
    if not note:
        return jsonify({"error": "Failed to retrieve updated note"}), 500

    return jsonify({
        "note_id": note_id,
        "new_title": note.get("title")
    }), 200

@app.route("/liked-notes/<user_id>/notes", methods=["GET"])
def get_liked_notes_endpoint(user_id):
    try:
        note_ids = get_liked_notes(user_id)
        notes = [fetch_note_by_id(note_id) for note_id in note_ids if fetch_note_by_id(note_id) is not None]
        return jsonify({"user_id": user_id, "notes": notes}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/notes-by-tag/<tag>/notes", methods=["GET"])
def get_notes_by_tag_endpoint(tag):
    try:
        note_ids = get_notes_by_tag(tag)
        return jsonify({"tag": tag, "note_ids": note_ids}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found', 'message': str(error)}), 404)

@app.errorhandler(500)
def internal_error(error):
    return make_response(jsonify({'error': 'Internal server error', 'message': str(error)}), 500)

@app.route("/notes-by-tags_match", methods=["GET"])
def get_notes_by_tags_endpoint():
    try:
        tag_string = request.args.get("tags")
        match_mode = request.args.get("match", "all").lower()

        if not tag_string:
            return jsonify({"error": "tags query parameter is required"}), 400

        tags = [tag.strip() for tag in tag_string.split(",") if tag.strip()]
        if not tags:
            return jsonify({"error": "No valid tags provided"}), 400

        note_ids = get_notes_by_tags_match(tags, match_mode)
        return jsonify({"tags": tags, "match": match_mode, "note_ids": note_ids}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/tag-note/<note_id>/tags", methods=["PUT"])
def update_tag_endpoint(note_id):
    data = request.get_json()
    old_tag = data.get("old_tag")
    new_tag = data.get("new_tag")

    if not old_tag or not new_tag:
        return jsonify({"error": "Both old_tag and new_tag are required"}), 400

    try:
        response = update_tag(note_id, old_tag, new_tag)
        return jsonify({"message": "Tag updated successfully", "data": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route("/tag-note/<note_id>/tags", methods=["DELETE"])
def delete_tag_endpoint(note_id):
    data = request.get_json()
    tag = data.get("tag")

    if not tag:
        return jsonify({"error": "Tag is required"}), 400

    try:
        response = delete_tag(note_id, tag)
        return jsonify({"message": "Tag deleted successfully", "data": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/is_note_unlocked', methods=['GET'])
def is_note_unlocked_endpoint():
    try:
        user_id = request.args.get('user_id')
        note_id = request.args.get('note_id')

        if not user_id or not note_id:
            return jsonify({"error": "Missing user_id or note_id"}), 400

        unlocked = is_note_unlocked(user_id, note_id)
        return jsonify({
            "note_id": note_id,
            "user_id": user_id,
            "is_unlocked": unlocked
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/is_note_liked', methods=['GET'])
def is_note_liked_endpoint():
    try:
        user_id = request.args.get('user_id')
        note_id = request.args.get('note_id')

        if not user_id or not note_id:
            return jsonify({"error": "Missing user_id or note_id"}), 400

        liked = has_user_liked_note(user_id, note_id) 
        return jsonify({
            "note_id": note_id,
            "user_id": user_id,
            "is_liked": liked
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/search", methods=["GET"])
def search_endpoint():
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify({"error": "Missing query parameter"}), 400

    try:
        results = search_tags(query)
        return jsonify(results)
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


# Run app
if __name__ == "__main__":
    app.run(debug=True)