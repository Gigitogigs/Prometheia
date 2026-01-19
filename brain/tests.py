from datetime import timezone
import hashlib
import hmac
from django.test import TestCase
from brain.services.github_webhook_handler import verify_github_webhook
import unittest

class GitHubWebhookHandlerTests(TestCase):
    def setUp(self):
        self.secret = 'a-super-secret-key'
        self.payload_raw = b'{"repostiory": "test"}'

    def test_verify_github_webhook_valid_signature(self):
        """
        Test that a valid signature returns True.
        """
        expected_signature = 'sha256=' + hmac.new(
            self.secret.encode('utf-8'), self.payload_raw, hashlib.sha256
        ).hexdigest()

        result = verify_github_webhook(self.payload_raw, expected_signature, self.secret)
        self.assertTrue(result)

    def test_verify_github_webhook_invalid_signature(self):
        """
        Test that an invalid signature returns False.
        """
        invalid_signature = 'sha256=invalid'
        result = verify_github_webhook(self.payload_raw, invalid_signature, self.secret)
        self.assertFalse(result)

    def test_verify_github_webhook_missing_signature(self):
        """
        Test that a missing signature returns False.
        """
        result = verify_github_webhook(self.payload_raw, '', self.secret)
        self.assertFalse(result)

    def test_verify_github_webhook_missing_secret(self):
        """
        Test that a missing secret returns False.
        """
        expected_signature = 'sha256=' + hmac.new(
            self.secret.encode('utf-8'), self.payload_raw, hashlib.sha256
        ).hexdigest()
        result = verify_github_webhook(self.payload_raw, expected_signature, '')
        self.assertFalse(result)
        
        
        from datetime import datetime, timedelta
        from django.utils import timezone
        from brain.models import UserProfile, CommitLog
        from brain.services.xp_calculator import XPCalculator
        
        
        class XPCalculatorTests(TestCase):
            def setUp(self):
                self.user_profile = UserProfile.objects.create(
                    github_username='testuser',
                    total_xp=100,
                    current_level=1,
                    last_commit_date=timezone.now() - timedelta(days=1),
                    current_streak=1
                )
                self.commit_log = CommitLog.objects.create(
                    commit_hash='a1b2c3d4',
                    commit_message='Test commit',
                )
        
            def test_calculate_total_xp_base(self):
                """ Test basic XP calculation without bonuses or penalties. """
                xp = XPCalculator.calculate_total_xp(
                    architect_score=50, paladin_score=60, scribe_score=70
                )
                expected_xp = int(50 * 1.0 + 60 * 1.0 + 70 * 1.2)
                self.assertEqual(xp, expected_xp)
        
            def test_calculate_total_xp_with_bonuses(self):
                """ Test XP calculation with bonuses. """
                xp = XPCalculator.calculate_total_xp(
                    architect_score=50, paladin_score=60, scribe_score=70,
                    bonuses={'exceptional': True, 'iteration': True}
                )
                expected_xp = int(50 * 1.0 + 60 * 1.0 + 70 * 1.2) + 5 + 5
                self.assertEqual(xp, expected_xp)
        
            def test_calculate_total_xp_with_penalties(self):
                """ Test XP calculation with penalties. """
                xp = XPCalculator.calculate_total_xp(
                    architect_score=50, paladin_score=60, scribe_score=70,
                    penalties={'critical': True}
                )
                expected_xp = int(50 * 1.0 + 60 * 1.0 + 70 * 1.2) - 10
                self.assertEqual(xp, expected_xp)
        
            def test_calculate_total_xp_max_cap(self):
                """ Test that XP is capped at MAX_XP. """
                xp = XPCalculator.calculate_total_xp(
                    architect_score=500, paladin_score=500, scribe_score=500
                )
                self.assertEqual(xp, XPCalculator.MAX_XP)
        
            def test_calculate_total_xp_min_cap(self):
                """ Test that XP is capped at MIN_XP. """
                xp = XPCalculator.calculate_total_xp(
                    architect_score=0, paladin_score=0, scribe_score=0,
                    penalties={'critical': True}
                )
                self.assertEqual(xp, XPCalculator.MIN_XP)
        
            def test_calculate_level_and_xp(self):
                """ Test level and XP calculation. """
                level, xp_in_level = XPCalculator.calculate_level_and_xp(1200)
                self.assertEqual(level, 3)
                self.assertEqual(xp_in_level, 200)
        
                level, xp_in_level = XPCalculator.calculate_level_and_xp(499)
                self.assertEqual(level, 1)
                self.assertEqual(xp_in_level, 499)
        
            def test_calculate_xp_to_next_level(self):
                """ Test XP to next level calculation. """
                xp_to_next = XPCalculator.calculate_xp_to_next_level(1200)
                self.assertEqual(xp_to_next, 300)
        
            def test_update_streak_increment(self):
                """ Test that streak is incremented correctly. """
                streak = XPCalculator.update_streak(self.user_profile)
                self.assertEqual(streak, 2)
                self.assertEqual(self.user_profile.current_streak, 2)
        
            def test_update_streak_reset(self):
                """ Test that streak is reset correctly. """
                self.user_profile.last_commit_date = timezone.now() - timedelta(days=3)
                self.user_profile.save()
                streak = XPCalculator.update_streak(self.user_profile)
                self.assertEqual(streak, 1)
                self.assertEqual(self.user_profile.current_streak, 1)
        
            def test_update_user_xp(self):
                """ Test the complete user XP update process. """
                result = XPCalculator.update_user_xp(
                    user_profile=self.user_profile,
                    commit_log=self.commit_log,
                    architect_score=50,
                    paladin_score=60,
                    scribe_score=70
                )
        
                expected_xp = int(50 * 1.0 + 60 * 1.0 + 70 * 1.2)
                self.assertEqual(result['xp_awarded'], expected_xp)
                self.assertEqual(result['total_xp'], 100 + expected_xp)
                self.assertEqual(result['level'], 1)
                self.assertEqual(result['streak'], 2)
                self.assertFalse(result['level_up'])
        
                self.user_profile.refresh_from_db()
                self.commit_log.refresh_from_db()
        
                self.assertEqual(self.user_profile.total_xp, 100 + expected_xp)
                self.assertEqual(self.commit_log.total_xp_awarded, expected_xp)
                self.assertTrue(self.commit_log.is_processed)
                self.assertEqual(self.commit_log.author, self.user_profile)


from unittest.mock import patch
import json
from django.test import Client
from django.urls import reverse
from brain.models import CommitLog, Repository, UserProfile


class GitHubWebhookViewsTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user_profile = UserProfile.objects.create(
            github_username='testuser',
        )
        self.repository = Repository.objects.create(
            full_name='testuser/test-repo',
            webhook_secret='a-super-secret-key',
            owner=self.user_profile,
            is_active=True
        )

    @patch('brain.views.verify_github_webhook', return_value=True)
    @patch('brain.tasks.evaluate_commit_with_ai.delay')
    def test_github_webhook_push_event(self, mock_delay, mock_verify):
        """
        Test that a push event queues the 'evaluate_commit_with_ai' task.
        """
        payload = {
            "repository": {
                "full_name": "testuser/test-repo"
            },
            "commits": [
                {
                    "id": "a1b2c3d4e5f6",
                    "message": "Test commit",
                    "timestamp": "2024-01-01T12:00:00Z",
                    "url": "http://example.com/commit/a1b2c3d4e5f6",
                    "author": {
                        "username": "testuser"
                    }
                }
            ]
        }
        
        headers = {
            'HTTP_X-GitHub-Event': 'push',
            'HTTP_X-Hub-Signature-256': 'sha256=somesignature',
            'CONTENT_TYPE': 'application/json'
        }

        response = self.client.post(
            reverse('github_webhook'),
            data=json.dumps(payload),
            **headers
        )

        self.assertEqual(response.status_code, 202)
        
        # Check that a CommitLog was created
        commit_log = CommitLog.objects.get(commit_hash="a1b2c3d4e5f6")
        
        # Check that the task was called with the new commit log's ID
        mock_delay.assert_called_once_with(commit_log.id)


from django.test import override_settings
from types import SimpleNamespace

@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
class EndToEndTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user_profile = UserProfile.objects.create(
            github_username='testuser',
            total_xp=0
        )
        self.repository = Repository.objects.create(
            full_name='testuser/test-repo',
            webhook_secret='a-super-secret-key',
            owner=self.user_profile,
            is_active=True
        )

    @patch('brain.views.verify_github_webhook', return_value=True)
    @patch('brain.tasks.fetch_github_diff', return_value="diff --git a/file.py b/file.py")
    @patch('brain.logic.ai_council.opik.get_current_trace_data')
    @patch('brain.logic.ai_council._call_gemini_api')
    def test_end_to_end_webhook_to_profile_update(self, mock_gemini_call, mock_opik, mock_diff, mock_verify):
        """
        Test the full end-to-end process from webhook to user profile update,
        including Opik trace ID saving.
        """
        # Mock the Gemini API call to return fixed XP and reasoning
        mock_gemini_call.side_effect = [
            (50, "Architect reasoning"),
            (60, "Paladin reasoning"),
            (70, "Scribe reasoning"),
        ]
        # Mock Opik trace data
        mock_opik.return_value = SimpleNamespace(id="mock_opik_trace_id")

        payload = {
            "repository": {
                "full_name": "testuser/test-repo"
            },
            "commits": [
                {
                    "id": "a1b2c3d4e5f6",
                    "message": "Test commit",
                    "timestamp": "2024-01-01T12:00:00Z",
                    "url": "http://example.com/commit/a1b2c3d4e5f6",
                    "author": {
                        "username": "testuser"
                    }
                }
            ]
        }
        
        headers = {
            'HTTP_X-GitHub-Event': 'push',
            'HTTP_X-Hub-Signature-256': 'sha256=somesignature',
            'CONTENT_TYPE': 'application/json'
        }

        response = self.client.post(
            reverse('github_webhook'),
            data=json.dumps(payload),
            **headers
        )

        self.assertEqual(response.status_code, 202)

        # Refresh objects from the database
        self.user_profile.refresh_from_db()
        commit_log = CommitLog.objects.get(commit_hash="a1b2c3d4e5f6")

        # Assertions for XP
        expected_xp = int(50 * 1.0 + 60 * 1.0 + 70 * 1.2)
        self.assertEqual(self.user_profile.total_xp, expected_xp)
        self.assertTrue(commit_log.is_processed)
        self.assertEqual(commit_log.total_xp_awarded, expected_xp)
        
        # Assertions for JudgeEvaluation and opik_trace_id
        evaluations = commit_log.evaluations.all()
        self.assertEqual(evaluations.count(), 3)
        for evaluation in evaluations:
            self.assertEqual(evaluation.opik_trace_id, "mock_opik_trace_id")


from brain.models import JudgeEvaluation

class JudgeEvaluationModelTests(TestCase):
    def setUp(self):
        self.user_profile = UserProfile.objects.create(github_username="testuser")
        self.repository = Repository.objects.create(
            full_name='testuser/test-repo',
            owner=self.user_profile,
        )
        self.commit_log = CommitLog.objects.create(
            repository=self.repository,
            commit_hash='a1b2c3d4',
            message='Test commit',
            timestamp=timezone.now(),
            url='http://example.com'
        )

    def test_proof_url_with_trace_id(self):
        """
        Test that proof_url generates the correct URL when opik_trace_id is present.
        """
        evaluation = JudgeEvaluation.objects.create(
            commit=self.commit_log,
            judge_type='ARCHITECT',
            xp_awarded=100,
            reasoning='Great job!',
            opik_trace_id='test_trace_id'
        )
        expected_url = "https://www.comet.com/opik/dashboard/traces/test_trace_id"
        self.assertEqual(evaluation.proof_url, expected_url)

    def test_proof_url_without_trace_id(self):
        """
        Test that proof_url returns None when opik_trace_id is not present.
        """
        evaluation = JudgeEvaluation.objects.create(
            commit=self.commit_log,
            judge_type='ARCHITECT',
            xp_awarded=100,
            reasoning='Great job!',
            opik_trace_id=None
        )
        self.assertIsNone(evaluation.proof_url)



        