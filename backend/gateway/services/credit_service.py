"""Credit service — balance check, deduction, refund, topup."""

import logging

from gateway.models.db_models import fetch_one, execute_returning, get_db_connection

logger = logging.getLogger(__name__)

TASK_COSTS_CENTS = {
    "blog": 50,
    "email": 30,
    "social": 20,
}

TOPUP_PACKAGES = {
    "small": {"price_cents": 1000, "credits_cents": 1000},      # $10 -> 1000 credits
    "medium": {"price_cents": 2500, "credits_cents": 2750},     # $25 -> 2750 credits (10% bonus)
    "large": {"price_cents": 5000, "credits_cents": 6000},      # $50 -> 6000 credits (20% bonus)
}


class CreditService:
    """Atomic credit operations with transaction safety."""

    def get_balance(self, user_id: str) -> int:
        """Get current credit balance in cents."""
        row = fetch_one("SELECT credit_balance_cents FROM users WHERE id = %s", (user_id,))
        if not row:
            return 0
        return row["credit_balance_cents"]

    def get_task_cost(self, content_type: str) -> int:
        """Get cost in cents for a content type."""
        return TASK_COSTS_CENTS.get(content_type, 50)

    def deduct_credits(self, user_id: str, amount_cents: int, task_id: str) -> bool:
        """Deduct credits atomically. Returns False if insufficient balance."""
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT credit_balance_cents FROM users WHERE id = %s FOR UPDATE",
                    (user_id,),
                )
                row = cursor.fetchone()
                if not row or row[0] < amount_cents:
                    return False

                cursor.execute(
                    "UPDATE users SET credit_balance_cents = credit_balance_cents - %s WHERE id = %s",
                    (amount_cents, user_id),
                )

                cursor.execute(
                    """INSERT INTO credit_transactions (user_id, amount_cents, type, task_id, description)
                       VALUES (%s, %s, 'deduction', %s, %s)""",
                    (user_id, -amount_cents, task_id, f"Content task: {task_id}"),
                )

            conn.commit()
        logger.info("Deducted %d cents from user %s for task %s", amount_cents, user_id, task_id)
        return True

    def refund_credits(self, user_id: str, amount_cents: int, task_id: str) -> None:
        """Refund credits on task failure."""
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE users SET credit_balance_cents = credit_balance_cents + %s WHERE id = %s",
                    (amount_cents, user_id),
                )
                cursor.execute(
                    """INSERT INTO credit_transactions (user_id, amount_cents, type, task_id, description)
                       VALUES (%s, %s, 'refund', %s, %s)""",
                    (user_id, amount_cents, task_id, f"Refund for failed task: {task_id}"),
                )
            conn.commit()
        logger.info("Refunded %d cents to user %s for task %s", amount_cents, user_id, task_id)

    def topup_credits(self, user_id: str, amount_cents: int, description: str = "Credit topup") -> None:
        """Add credits after Stripe payment."""
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE users SET credit_balance_cents = credit_balance_cents + %s WHERE id = %s",
                    (amount_cents, user_id),
                )
                cursor.execute(
                    """INSERT INTO credit_transactions (user_id, amount_cents, type, description)
                       VALUES (%s, %s, 'topup', %s)""",
                    (user_id, amount_cents, description),
                )
            conn.commit()
        logger.info("Topped up %d cents for user %s", amount_cents, user_id)


credit_service = CreditService()
