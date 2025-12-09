# questions/utils/hints.py
import random

def eliminate_choices(correct, incorrect_list, remove_count=1):
    """Return a reduced list of choices (correct + remaining incorrects)."""
    wrongs = incorrect_list.copy()
    random.shuffle(wrongs)
    remaining = wrongs[remove_count:]
    choices = [correct] + remaining
    random.shuffle(choices)
    return choices
