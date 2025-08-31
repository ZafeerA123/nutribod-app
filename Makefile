# Makefile for MedPrep Tracker

.PHONY: serve build clean install help

# Default target
all: serve

# Install dependencies (if needed later)
install:
	@echo "Installing dependencies..."
	@command -v python3 >/dev/null 2>&1 || { echo "Python3 required but not installed. Installing..."; sudo apt update && sudo apt install python3; }

# Serve the website locally
serve:
	@echo "Starting local server..."
	@echo "Opening http://localhost:8000"
	@python3 -m http.server 8000 --bind 127.0.0.1

# Build (placeholder for future build steps)
build:
	@echo "Building project..."
	@echo "Project ready for deployment"

# Clean temporary files
clean:
	@echo "Cleaning temporary files..."
	@rm -f *.tmp *.log

# Show help
help:
	@echo "Available commands:"
	@echo "  make serve  - Start local development server"
	@echo "  make build  - Build project for deployment"
	@echo "  make clean  - Clean temporary files"
	@echo "  make help   - Show this help message"