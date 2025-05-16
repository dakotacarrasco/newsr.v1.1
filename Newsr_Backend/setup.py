#!/usr/bin/env python3
from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="citydigest",
    version="0.1.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="A modular local news digest system",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/citydigest",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=[
        "selenium>=4.0.0",
        "requests>=2.25.1",
        "beautifulsoup4>=4.9.3",
        "webdriver-manager>=3.5.2",
        "supabase>=0.5.8",
        "schedule>=1.1.0",
        "python-dotenv>=0.19.1",
    ],
    entry_points={
        "console_scripts": [
            "citydigest=local.citydigest.main:main",
        ],
    },
) 