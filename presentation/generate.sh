#!/bin/bash
pandoc presentation.md -t beamer -o presentation.pdf --pdf-engine=pdflatex
