<<<<<<< HEAD
=======
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
>>>>>>> 522b9f8d42b32539e6fa5840eb824218ee72f164
import os
import sys


def main():
<<<<<<< HEAD
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "braintease.settings")
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
=======
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
>>>>>>> 522b9f8d42b32539e6fa5840eb824218ee72f164
