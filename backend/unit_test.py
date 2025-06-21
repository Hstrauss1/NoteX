import unittest
from unittest.mock import MagicMock
from interaction import update_user_points, check_points, InsufficientPointsError
from flask import g
from app import app

class TestUpdateUserPoints(unittest.TestCase):
    def test_update_points_success(self):
        with app.app_context():
            mock_client = MagicMock()
            g.supabase_client = mock_client
        
            select_response_mock = MagicMock()
            select_response_mock.data = {"points_tot": 10}

            update_response_mock = MagicMock()
            update_response_mock.data = {"points_tot": 15}

            select_mock = MagicMock()
            select_mock.select.return_value = select_mock
            select_mock.eq.return_value = select_mock
            select_mock.single.return_value = select_mock
            select_mock.execute.return_value = select_response_mock

            update_mock = MagicMock()
            update_mock.update.return_value = update_mock
            update_mock.eq.return_value = update_mock
            update_mock.execute.return_value = update_response_mock

            def table_side_effect(name):
                return select_mock

            mock_client.table.side_effect = table_side_effect
            select_mock.update = update_mock.update

            try:
                result = update_user_points("user123", reward=5)
                self.assertEqual(result["points_tot"], 15)
            except Exception as e:
                self.fail(f"update_user_points raised an Exception unexpectedly: {e}")
    
    def test_update_user_points_negative_raises_exception(self):
        with app.app_context():
            mock_client = MagicMock()
            g.supabase_client = mock_client

            select_response_mock = MagicMock()
            select_response_mock.data = {"points_tot": 3}

            select_chain = MagicMock()
            select_chain.select.return_value = select_chain
            select_chain.eq.return_value = select_chain
            select_chain.single.return_value = select_chain
            select_chain.execute.return_value = select_response_mock

            update_chain = MagicMock()
            update_chain.update.return_value = update_chain
            update_chain.eq.return_value = update_chain
            update_chain.execute.return_value = {} 

            def table_side_effect(table_name):
                return select_chain

            mock_client.table.side_effect = table_side_effect
            select_chain.update = update_chain.update  # Attach update in case it accidentally gets called

            # Now test the function call
            with self.assertRaises(Exception) as context:
                update_user_points("user123", reward=-5)

            self.assertIn("Points cannot be negative", str(context.exception))
    
    def test_check_points_insufficient_points(self):
        with app.app_context():
            mock_client = MagicMock()
            g.supabase_client = mock_client

            user_response_mock = MagicMock()
            user_response_mock.data = {"points_tot": 3}  

            note_response_mock = MagicMock()
            note_response_mock.data = {"cost": 10}  

            select_user_mock = MagicMock()
            select_user_mock.select.return_value = select_user_mock
            select_user_mock.eq.return_value = select_user_mock
            select_user_mock.single.return_value = select_user_mock
            select_user_mock.execute.return_value = user_response_mock

            select_note_mock = MagicMock()
            select_note_mock.select.return_value = select_note_mock
            select_note_mock.eq.return_value = select_note_mock
            select_note_mock.single.return_value = select_note_mock
            select_note_mock.execute.return_value = note_response_mock

            def table_side_effect(table_name):
                if table_name == "Account":
                    return select_user_mock
                elif table_name == "Note":
                    return select_note_mock
                else:
                    raise Exception("Unexpected table")

            mock_client.table.side_effect = table_side_effect

            with self.assertRaises(InsufficientPointsError) as context:
                check_points("user123", "note456")

            self.assertIn("Insufficient points", str(context.exception))

if __name__ == "__main__":
    unittest.main()