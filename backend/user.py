from flask import g
from typing import Optional, Dict, Any
from postgrest.exceptions import APIError
import logging

def fetch_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch a single user record from the "Account" table by user_id.
    Returns:
      - A dict of that user’s fields (excluding password) on success
      - None if no such user or on error
    """
    try:
        # only select the non-sensitive columns
        response = (
            g.supabase_client
              .table("Account")
              .select("*")
              .eq("user_id", user_id)
              .single()
              .execute()
        )
    except APIError as e:
        logging.error(f"Supabase API error fetching user {user_id}: {e.code} – {e.message}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error fetching user {user_id}: {e}")
        return None

    data = response.data or {}
    if not data:
        # no user found
        return None

    return data

def get_or_create_user(user_id: str, avatar:str, name:str, initial_points: int = 0) -> Optional[Dict[str, Any]]:
    """
    Fetches a user by user_id; creates them with default points if they don't exist.
    """
    # First, try to fetch the user by user_id
    user = fetch_user_by_id(user_id)
    if user:
        # If the user exists, return the user's data
        return user

    # If user doesn't exist, create a new one
    try:
        # Insert a new user with default points (0)
        response = (
          g.supabase_client
              .table("Account")
              .insert({
                  "user_id": user_id,
                  "avatar": avatar,
                  "name": name,
                  "points_tot": initial_points,
              })
              .execute()  # Execute the insert
        )

        # Check if the insert was successful and return the inserted data
        if response.data:
            return response.data[0]  # Return the first inserted row

    except APIError as e:
        logging.error(f"Supabase API error creating user {user_id}: {e.code} – {e.message}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error creating user {user_id}: {e}")
        return None

    # If insert failed or there is no data, return None
    return None


def delete_user(user_id: str) -> bool:
    """
    Delete a user by user_id.
    Returns:
      - True if the user was deleted successfully
      - False if the user was not found or on error
    """
    try:
        # Delete the user from the "Account" table
        response = (
            g.supabase_client
              .table("Account")
              .delete()
              .eq("user_id", user_id)
              .execute()
        )
        if response.status_code != 204:
            logging.error(f"Failed to delete user {user_id} from Account table: {response.status_code}")
            return False

        # Delete the user from Supabase Auth
        try:
            auth_response = g.supabase_client.auth.api.delete_user(user_id)
            if auth_response.status_code != 204:
                logging.error(f"Failed to delete user {user_id} from Supabase Auth: {auth_response.status_code}")
                return False
        except Exception as e:
            logging.error(f"Unexpected error deleting user {user_id} from Supabase Auth: {e}")
            return False

        return True

    except APIError as e:
        logging.error(f"Supabase API error deleting user {user_id}: {e.code} – {e.message}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error deleting user {user_id}: {e}")
        return False