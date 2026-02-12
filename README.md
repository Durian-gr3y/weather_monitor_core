Nigeria Weather Monitoring Dashboard

Overview
This project tracks rain probability and weather conditions across selected locations in Nigeria.
It runs automatically on GitHub Actions and publishes a public dashboard using GitHub Pages.

What this project does

Fetches live weather data using a weather API

Calculates rain probability and risk level

Stores results in weather_data.json

Updates automatically on a schedule

Displays results in a public web dashboard

How it works

GitHub Actions runs the Python script on a schedule

The script pulls weather data for each location

Data is processed and saved to weather_data.json

The file is committed back to the repository

GitHub Pages serves index.html

The dashboard fetches the latest JSON data

Project structure

index.html → Frontend dashboard

weather_data.json → Generated weather data

weather_script.py → Data collection script

.github/workflows/ → GitHub Actions automation

.nojekyll → Disables Jekyll processing

Automation

The workflow runs every 2 hours using cron.
You can adjust the schedule inside:

.github/workflows/weather.yml

Example cron schedule:

0 */2 * * *

This runs every 2 hours.

Deployment

The dashboard is hosted using GitHub Pages.

Settings required:

Go to Settings → Pages

Source: Deploy from a branch

Branch: main

Folder: / (root)

Make sure .nojekyll exists in the root folder.

How to run locally

Clone the repository

Install dependencies:

pip install -r requirements.txt

Run the script:

python weather_script.py

Open index.html in your browser

Future improvements

Add historical tracking

Add charts for rain trends

Add search and filtering

Add dark mode

Store data in a lightweight database

Tech stack

Python

GitHub Actions

GitHub Pages

HTML, CSS, JavaScript

Purpose

This project demonstrates:

Automation with GitHub Actions

API integration

Data processing

Frontend data rendering

End-to-end deployment

You now have a fully automated public weather monitoring system running entirely free on GitHub.
