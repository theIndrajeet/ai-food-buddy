issac@issacs-MacBook-Pro ai-food-buddy % git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   .gitignore
        modified:   src/App.jsx
        modified:   src/main.jsx

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        backend/
        src/components/
        src/pages/

no changes added to commit (use "git add" and/or "git commit -a")
issac@issacs-MacBook-Pro ai-food-buddy % git add .
issac@issacs-MacBook-Pro ai-food-buddy % git commit -m "feat: Implement full frontend and backend for AI Food Buddy v1"
[main 1959c05] feat: Implement full frontend and backend for AI Food Buddy v1
 9 files changed, 608 insertions(+), 33 deletions(-)
 create mode 100644 backend/app.py
 create mode 100644 backend/requirements.txt
 create mode 100644 src/components/ChatInput.jsx
 create mode 100644 src/components/Header.jsx
 create mode 100644 src/components/MealCard.jsx
 create mode 100644 src/pages/Home.jsx
issac@issacs-MacBook-Pro ai-food-buddy % git push origin main
Enumerating objects: 20, done.
Counting objects: 100% (20/20), done.
Delta compression using up to 8 threads
Compressing objects: 100% (14/14), done.
Writing objects: 100% (15/15), 10.77 KiB | 10.77 MiB/s, done.
Total 15 (delta 1), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
To https://github.com/theIndrajeet/ai-food-buddy.git
   0c91f47..1959c05  main -> main
issac@issacs-MacBook-Pro ai-food-buddy % 