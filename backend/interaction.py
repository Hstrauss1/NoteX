from datetime import datetime
from flask import g
from collections import defaultdict

class InsufficientPointsError(Exception):
    pass

def update_user_points(user_id, reward=1):
    response = g.supabase_client.table("Account") \
        .select("points_tot") \
        .eq("user_id", user_id) \
        .single() \
        .execute()

    current_points = response.data["points_tot"] if response.data else 0
    new_points = current_points + reward
    if new_points < 0:
            raise Exception("Points cannot be negative.")

    update_response = g.supabase_client.table("Account") \
        .update({"points_tot": new_points}) \
        .eq("user_id", user_id) \
        .execute()

    return update_response.data

def update_note_cost(note_id, increment=1):
    response = g.supabase_client.table("Note") \
        .select("cost") \
        .eq("note_id", note_id) \
        .single() \
        .execute()

    current_cost = response.data["cost"] if response.data else 0
    new_cost = current_cost + increment
    update_response = g.supabase_client.table("Note") \
        .update({"cost": new_cost}) \
        .eq("note_id", note_id) \
        .execute()

    return update_response.data

def update_note_vote(note_id, increment=1):
    response = g.supabase_client.table("Note") \
        .select("votes") \
        .eq("note_id", note_id) \
        .single() \
        .execute()

    current_cost = response.data["votes"] if response.data else 0
    new_cost = current_cost + increment
    update_response = g.supabase_client.table("Note") \
        .update({"votes": new_cost}) \
        .eq("note_id", note_id) \
        .execute()

    return update_response.data

def check_points(user_id, note_id):
    try:
        user_response = g.supabase_client.table("Account") \
            .select("points_tot") \
            .eq("user_id", user_id) \
            .single() \
            .execute()

        if not user_response.data:
            raise Exception("User not found")

        user_points = user_response.data["points_tot"]

        # Get note cost
        note_response = g.supabase_client.table("Note") \
            .select("cost") \
            .eq("note_id", note_id) \
            .single() \
            .execute()

        if not note_response.data:
            raise Exception("Note not found")

        note_cost = note_response.data["cost"]
        if user_points < note_cost:
            raise InsufficientPointsError("Insufficient points to unlock note.")

        update_user_points(user_id, -note_cost)
        unlocked_note(user_id, note_id)
        return {"message": "Note unlocked successfully"}
    
    except InsufficientPointsError:
        raise
    except Exception as e:
        raise Exception(f"Failed to unlock note: {str(e)}")


def like_note(user_id, note_id):
    exists = g.supabase_client.table("Likes").select("*").eq("user_id", user_id).eq("note_id", note_id).execute()

    note_response = g.supabase_client.table("Note") \
        .select("user_id") \
        .eq("note_id", note_id) \
        .single() \
        .execute()
    
    if not note_response.data:
        raise Exception("Note not found.")
    
    if exists.data:
        raise Exception("User already liked this note.")

    response = g.supabase_client.table("Likes").insert({
        "note_id": note_id,
        "user_id": user_id
    }).execute()

    
    note_user_id = note_response.data["user_id"]

    if user_id == note_user_id:
        raise Exception("Users cannot like their own notes.")
    
    update_note_vote(note_id)
    update_note_cost(note_id)
    update_user_points(note_user_id)
    return response

def comment_note(user_id, note_id, comment_text):
    exists = g.supabase_client.table("Comment").select("*") \
        .eq("note_id", note_id).eq("user_id", user_id).execute()
    
    note_response = g.supabase_client.table("Note") \
        .select("user_id") \
        .eq("note_id", note_id) \
        .single() \
        .execute()

    if not note_response.data:
        raise Exception("Note not found.")

    if exists.data:
        raise Exception("Comment already exists for this user and note.")

    note_user_id = note_response.data["user_id"]

    if user_id == note_user_id:
        raise Exception("Users cannot comment on their own notes.")
    
    create_timestamp = datetime.now().isoformat()
    response = g.supabase_client.table("Comment").insert({
        "note_id": note_id,
        "user_id": user_id,
        "review": comment_text,
        "create_time": create_timestamp
    }).execute()

    update_note_vote(note_id)

    return response.data

def unlocked_note(user_id, note_id):
    exists = g.supabase_client.table("Unlocked").select("*").eq("user_id", user_id).eq("note_id", note_id).execute()

    note_response = g.supabase_client.table("Note") \
        .select("user_id") \
        .eq("note_id", note_id) \
        .single() \
        .execute()
    
    if not note_response.data:
        raise Exception("Note not found.")

    if exists.data:
        raise Exception("User already unlocked this note.")

    response = g.supabase_client.table("Unlocked").insert({
        "note_id": note_id,
        "user_id": user_id
    }).execute()

    return response

def add_tag(note_id, tags):
    note_response = g.supabase_client.table("Note") \
        .select("note_id") \
        .eq("note_id", note_id) \
        .single() \
        .execute()

    if not note_response.data:
        raise Exception("Note not found.")

    if not isinstance(tags, list):
        raise Exception("tags must be a list of strings.")

    added_tags = []
    for tag in tags:
        tag_exists = g.supabase_client.table("Tags") \
            .select("*") \
            .eq("note_id", note_id) \
            .eq("tag", tag) \
            .execute()

        if tag_exists.data:
            continue  # Skip existing tags

        response = g.supabase_client.table("Tags").insert({
            "note_id": note_id,
            "tag": tag
        }).execute()
        added_tags.append(response.data)

    return added_tags

def get_tags(note_id):
    tag_response = g.supabase_client.table("Tags") \
        .select("tag") \
        .eq("note_id", note_id) \
        .execute()

    if not tag_response.data:
        return []  

    tags = [entry["tag"] for entry in tag_response.data]
    return tags

def get_liked_notes(user_id):
    like_response = g.supabase_client.table("Likes") \
        .select("note_id") \
        .eq("user_id", user_id) \
        .execute()

    if not like_response.data:
        return []

    note_ids = [entry["note_id"] for entry in like_response.data]
    return note_ids

def get_notes_by_tag(tag):
    tag_response = g.supabase_client.table("Tags") \
        .select("note_id") \
        .eq("tag", tag) \
        .execute()

    if not tag_response.data:
        return []

    note_ids = [entry["note_id"] for entry in tag_response.data]
    return note_ids

def get_notes_by_tags_match(tags, match="all"):
    if not tags:
        return []

    tag_response = g.supabase_client.table("Tags") \
        .select("note_id", "tag") \
        .in_("tag", tags) \
        .execute()

    if not tag_response.data:
        return []

    note_to_tags = defaultdict(set)
    for entry in tag_response.data:
        note_to_tags[entry["note_id"]].add(entry["tag"])

    if match == "all":
        return [
            note_id for note_id, matched_tags in note_to_tags.items()
            if all(tag in matched_tags for tag in tags)
        ]
    elif match == "any":
        return list(note_to_tags.keys())
    else:
        raise ValueError("match must be 'all' or 'any'")
    
def update_tag(note_id, old_tag, new_tag):
    note_response = g.supabase_client.table("Note") \
        .select("note_id") \
        .eq("note_id", note_id) \
        .single() \
        .execute()

    if not note_response.data:
        raise Exception("Note not found.")

    tag_response = g.supabase_client.table("Tags") \
        .select("id") \
        .eq("note_id", note_id) \
        .eq("tag", old_tag) \
        .single() \
        .execute()

    if not tag_response.data:
        raise Exception("Old tag not found.")

    tag_id = tag_response.data["id"]

    new_tag_exists = g.supabase_client.table("Tags") \
        .select("id") \
        .eq("note_id", note_id) \
        .eq("tag", new_tag) \
        .execute()

    if new_tag_exists.data:
        raise Exception("The new tag already exists for this note.")

    response = g.supabase_client.table("Tags") \
        .update({"tag": new_tag}) \
        .eq("id", tag_id) \
        .execute()

    return response

def delete_tag(note_id, tag):
    tag_response = g.supabase_client.table("Tags") \
        .select("id") \
        .eq("note_id", note_id) \
        .eq("tag", tag) \
        .single() \
        .execute()

    if not tag_response.data:
        raise Exception("Tag not found.")

    tag_id = tag_response.data["id"]

    response = g.supabase_client.table("Tags") \
        .delete() \
        .eq("id", tag_id) \
        .execute()

    return response

def is_note_unlocked(user_id, note_id):
    response = g.supabase_client.table("Unlocked") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("note_id", note_id) \
        .execute()

    return bool(response.data)

def has_user_liked_note(user_id, note_id):
    response = g.supabase_client.table("Likes") \
        .select("id") \
        .eq("user_id", user_id) \
        .eq("note_id", note_id) \
        .execute()

    return bool(response.data)

def search_tags(query: str):
    print(f"Searching tags with query: {query}")
    if not query:
        raise ValueError("Query string is empty")

    normalized_query = query.strip().replace(" ", "-").lower()
    
    try:
        response = (
            g.supabase_client
            .table("Tags")
            .select("*")
            .ilike("tag", f"%{normalized_query}%")
            .execute()
        )
    except Exception as e:
        raise Exception(f"Supabase query failed: {str(e)}")

    return response.data 

