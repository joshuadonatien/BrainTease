# questions/utils/hints.py
import random
import logging

logger = logging.getLogger(__name__)

def eliminate_choices(correct, incorrect_list, remove_count=1):
    """
    Return a reduced list of choices (correct + remaining incorrects).
    
    Args:
        correct: The correct answer string
        incorrect_list: List of incorrect answer strings
        remove_count: Number of incorrect answers to remove (default: 1)
    
    Returns:
        List of choices with correct answer + remaining incorrect answers
    """
    try:
        if not correct:
            logger.warning("eliminate_choices: correct answer is empty")
            return []
        
        if not isinstance(incorrect_list, list):
            logger.warning(f"eliminate_choices: incorrect_list is not a list: {type(incorrect_list)}")
            return [correct] if correct else []
        
        if remove_count < 0:
            remove_count = 0
        
        wrongs = incorrect_list.copy()
        random.shuffle(wrongs)
        
        # Don't remove more than available
        remove_count = min(remove_count, len(wrongs))
        remaining = wrongs[remove_count:]
        
        choices = [correct] + remaining
        random.shuffle(choices)
        return choices
        
    except Exception as e:
        logger.error(f"Error in eliminate_choices: {str(e)}", exc_info=True)
        # Fallback: return correct answer only
        return [correct] if correct else []
