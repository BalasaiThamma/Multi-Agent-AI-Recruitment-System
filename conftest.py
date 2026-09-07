import sys
import os

# Add backend to sys.path so tests can be run from repository root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
